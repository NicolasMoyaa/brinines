/*******************************************************
 * INTEGRACIÓN GEMINI
 *******************************************************/

function llamarGemini(prompt, thinkingLevel) {
  const apiKey = getGeminiKey();
  const model = BRININES.modeloPrincipal;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: {
        thinkingLevel: thinkingLevel || "low"
      }
    }
  };
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "x-goog-api-key": apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  const status = response.getResponseCode();
  const body = response.getContentText();
  if (status !== 200) {
    throw new Error("Gemini HTTP " + status + ":\n\n" + body);
  }
  const json = JSON.parse(body);
  const texto = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) {
    throw new Error("Gemini respondió correctamente, pero no devolvió contenido.");
  }
  const limpio = texto.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(limpio);
  } catch (error) {
    throw new Error("Gemini no devolvió JSON válido.\n\n" + limpio);
  }
}
