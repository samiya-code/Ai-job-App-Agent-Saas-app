export function extractJsonFromModelText(text: string): unknown {
  const trimmed = text.trim()

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fencedMatch?.[1]) {
    return JSON.parse(fencedMatch[1].trim())
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/)
  if (objectMatch?.[0]) {
    return JSON.parse(objectMatch[0])
  }

  return JSON.parse(trimmed)
}
