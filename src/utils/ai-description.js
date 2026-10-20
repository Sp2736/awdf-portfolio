export function buildFallbackDescription(title) {
  return `Complete "${title.trim()}" and verify the result.`;
}

export function extractGeminiDescription(payload) {
  const description = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!description) {
    throw new Error('Gemini returned no description');
  }

  return description;
}

export async function generateTaskDescription(title, {
  apiKey,
  model = 'gemini-3.1-flash-lite',
  fetchImpl = fetch
}) {
  const fallback = (reason) => ({
    description: buildFallbackDescription(title),
    fallback: true,
    message: 'Gemini is unavailable. A suggested description was added; you can edit it before saving.',
    reason
  });

  if (!apiKey) {
    return fallback('GEMINI_API_KEY is not configured');
  }

  try {
    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'Write one concise, actionable task description (one or two sentences) based only on the task title. Return only the description.'
            }]
          },
          contents: [{
            parts: [{ text: `Task title: ${title.trim()}` }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 120
          }
        }),
        signal: AbortSignal.timeout(12000)
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned HTTP ${response.status}`);
    }

    return {
      description: extractGeminiDescription(await response.json()),
      fallback: false
    };
  } catch (error) {
    return fallback(error.message);
  }
}
