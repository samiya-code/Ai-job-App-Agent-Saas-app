const FREE_TIER_FALLBACK_MODEL = "gemini-2.5-flash"

export function getFreeTierFallbackModel() {
  return FREE_TIER_FALLBACK_MODEL
}

export function isGeminiQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const err = error as {
    status?: number
    message?: string
    error?: { code?: number; status?: string; message?: string }
  }

  const status = err.status ?? err.error?.code
  const statusText = err.error?.status
  const message = `${err.message ?? ""} ${err.error?.message ?? ""}`.toLowerCase()

  return (
    status === 429 ||
    statusText === "RESOURCE_EXHAUSTED" ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted")
  )
}

export function formatGeminiError(error: unknown, model?: string): string {
  if (isGeminiQuotaError(error)) {
    const modelHint = model?.includes("flash-lite-image")
      ? ` The model "${model}" is not available on the Gemini free tier. Set GEMINI_MODEL=${FREE_TIER_FALLBACK_MODEL} in .env.local, or enable billing at https://ai.google.dev/pricing.`
      : ` Gemini API quota exceeded. Wait a minute and try again, or switch GEMINI_MODEL to ${FREE_TIER_FALLBACK_MODEL}.`

    return `AI quota exceeded.${modelHint}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Failed to parse resume with Gemini AI"
}

export function getModelsToTry(primaryModel: string): string[] {
  const models = [primaryModel]
  if (primaryModel !== FREE_TIER_FALLBACK_MODEL) {
    models.push(FREE_TIER_FALLBACK_MODEL)
  }
  return models
}
