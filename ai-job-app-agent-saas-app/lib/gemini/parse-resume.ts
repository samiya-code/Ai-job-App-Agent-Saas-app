import { GoogleGenAI, Type } from "@google/genai"

import {
  getGeminiClientOptions,
  getGeminiConfig,
  supportsStructuredOutput,
} from "@/lib/gemini/config"
import {
  formatGeminiError,
  getModelsToTry,
  isGeminiQuotaError,
} from "@/lib/gemini/errors"
import { extractJsonFromModelText } from "@/lib/gemini/extract-json"
import {
  parsedResumeSchema,
  type ParsedResume,
} from "@/lib/resume/schema"

const RESUME_JSON_SHAPE = `{
  "fullName": "string",
  "headline": "string",
  "professionalSummary": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "website": "string",
  "linkedinUrl": "string",
  "githubUrl": "string",
  "otherLinks": [{ "label": "string", "url": "string" }],
  "workExperiences": [{
    "company": "string",
    "jobTitle": "string",
    "location": "string",
    "startDate": "string",
    "endDate": "string",
    "isCurrent": false,
    "responsibilities": ["string"]
  }],
  "education": [{
    "institution": "string",
    "degree": "string",
    "fieldOfStudy": "string",
    "startDate": "string",
    "endDate": "string"
  }],
  "skills": [{ "name": "string", "category": "string" }],
  "projects": [{
    "name": "string",
    "description": "string",
    "url": "string",
    "technologies": ["string"]
  }],
  "certifications": [{
    "name": "string",
    "issuer": "string",
    "issueDate": "string",
    "url": "string"
  }]
}`

const resumeResponseSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    headline: { type: Type.STRING },
    professionalSummary: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    location: { type: Type.STRING },
    website: { type: Type.STRING },
    linkedinUrl: { type: Type.STRING },
    githubUrl: { type: Type.STRING },
    otherLinks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          url: { type: Type.STRING },
        },
        required: ["label", "url"],
      },
    },
    workExperiences: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          jobTitle: { type: Type.STRING },
          location: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          isCurrent: { type: Type.BOOLEAN },
          responsibilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["company", "jobTitle"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          fieldOfStudy: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
        },
        required: ["institution"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          url: { type: Type.STRING },
          technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["name"],
      },
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          issueDate: { type: Type.STRING },
          url: { type: Type.STRING },
        },
        required: ["name"],
      },
    },
  },
  required: [
    "fullName",
    "headline",
    "professionalSummary",
    "workExperiences",
    "education",
    "skills",
  ],
}

function buildPrompt(useStructuredSchema: boolean): string {
  const base = `Extract all important information from this resume.
Include: full name, headline, professional summary, contact details, skills, work experience (company, job title, duration, responsibilities as bullet points), education, projects, certifications, and any links (website, LinkedIn, GitHub, portfolio, etc.).
Use empty strings for missing text fields and empty arrays for missing lists.
For work experience dates, preserve the original format from the resume (e.g. "Jan 2020 - Present").
Set isCurrent to true when the role is ongoing.`

  if (useStructuredSchema) {
    return `${base}

Return structured JSON.`
  }

  return `${base}

Return ONLY valid JSON (no markdown, no explanation) matching this shape:
${RESUME_JSON_SHAPE}`
}

function validateParsedResume(parsed: unknown): ParsedResume {
  const result = parsedResumeSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Failed to validate parsed resume: ${result.error.message}`)
  }
  return result.data
}

export async function parseResumeWithGemini(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ParsedResume> {
  const config = getGeminiConfig()
  const ai = new GoogleGenAI(getGeminiClientOptions(config))
  const base64Data = fileBuffer.toString("base64")
  const modelsToTry = getModelsToTry(config.model)

  let lastError: unknown

  for (const model of modelsToTry) {
    try {
      return await parseWithModel(ai, model, base64Data, mimeType)
    } catch (error) {
      lastError = error
      const hasFallback = model !== modelsToTry[modelsToTry.length - 1]
      if (hasFallback && isGeminiQuotaError(error)) {
        continue
      }
      throw new Error(formatGeminiError(error, model))
    }
  }

  throw new Error(formatGeminiError(lastError, config.model))
}

async function parseWithModel(
  ai: GoogleGenAI,
  model: string,
  base64Data: string,
  mimeType: string
): Promise<ParsedResume> {
  const useStructuredSchema = supportsStructuredOutput(model)

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: buildPrompt(useStructuredSchema) },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: useStructuredSchema
      ? {
          responseMimeType: "application/json",
          responseSchema: resumeResponseSchema,
          temperature: 0.1,
        }
      : {
          temperature: 0.1,
        },
  })

  const text = response.text
  if (!text) {
    throw new Error(`Gemini (${model}) returned an empty response`)
  }

  let parsed: unknown
  try {
    parsed = useStructuredSchema ? JSON.parse(text) : extractJsonFromModelText(text)
  } catch {
    throw new Error(`Gemini (${model}) returned invalid JSON`)
  }

  return validateParsedResume(parsed)
}
