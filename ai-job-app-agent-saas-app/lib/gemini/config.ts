const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"

export type GeminiConfig = {
  apiKey: string
  model: string
}

export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to .env.local (server-only)."
    )
  }

  return { apiKey, model }
}

export function supportsStructuredOutput(model: string): boolean {
  // gemini-3.1-flash-lite-image does not support responseSchema / structured outputs
  return !model.includes("flash-lite-image")
}

export function getGeminiClientOptions(config: GeminiConfig) {
  return { apiKey: config.apiKey }
}
