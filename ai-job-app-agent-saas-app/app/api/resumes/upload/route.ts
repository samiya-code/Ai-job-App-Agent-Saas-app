import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { parseResumeWithGemini } from "@/lib/gemini/parse-resume"
import {
  markResumeParseFailed,
  saveParsedResume,
} from "@/lib/resume/save-parsed-resume"
import {
  ALLOWED_RESUME_MIME_TYPES,
  MAX_RESUME_FILE_SIZE,
  sanitizeFileName,
} from "@/lib/resume/schema"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getClaims()
    const userId = authData?.claims?.sub

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_RESUME_MIME_TYPES.includes(file.type as (typeof ALLOWED_RESUME_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF or Word document." },
        { status: 400 }
      )
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }

    const resumeId = randomUUID()
    const safeName = sanitizeFileName(file.name)
    const storagePath = `${userId}/${resumeId}/${safeName}`

    const { count: existingCount } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    const { error: insertError } = await supabase.from("resumes").insert({
      id: resumeId,
      user_id: userId,
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      parse_status: "pending",
      is_primary: (existingCount ?? 0) === 0,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      await markResumeParseFailed(supabase, userId, resumeId, uploadError.message)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    await supabase
      .from("resumes")
      .update({ parse_status: "processing", updated_at: new Date().toISOString() })
      .eq("id", resumeId)
      .eq("user_id", userId)

    try {
      const parsed = await parseResumeWithGemini(fileBuffer, file.type)
      await saveParsedResume(supabase, userId, resumeId, parsed)

      return NextResponse.json({
        success: true,
        resumeId,
        message: "Resume uploaded and parsed successfully",
      })
    } catch (parseError) {
      const message =
        parseError instanceof Error ? parseError.message : "Failed to parse resume"
      await markResumeParseFailed(supabase, userId, resumeId, message)
      const status = message.toLowerCase().includes("quota") ? 429 : 500
      return NextResponse.json({ error: message }, { status })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
