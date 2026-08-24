function myFunction() {
  // Podés dejarlo con ScriptProperties o pegar directamente tu API Key entre comillas si preferís no renegar
const API_KEY = PropertiesService.getScriptProperties().getProperty("GEMINI_KEY") || "PEGAR_TU_API_KEY_AQUI";
const TU_NUMERO = "5493813562078";
const NOMBRE_HOJA = "Pedidos";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🥐 Brinines AI')
    .addItem('Cargar Pedido Manual', 'procesarPedidoConGemini')
    .addItem('Crear Encabezados', 'crearEncabezados')
    .addToUi();
}

function crearEncabezados() {
  const sheet = getHoja();
  const headers = ["Fecha_Hora", "Plataforma", "Usuario_IG_FB_TT", "Nombre", "Telefono", "Pedido", "Direccion_Zona", "Monto", "Estado", "Notas_IA"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  SpreadsheetApp.getActiveSpreadsheet().toast("Encabezados creados ✅");
}

function procesarPedidoConGemini() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Cargar Pedido con IA', 'Pegá el texto del pedido:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  try {
    const datos = consultarGemini(response.getResponseText(), "manual");
    guardarEnSheet(datos);
    ui.alert('✅ ¡Pedido registrado!');
  } catch (err) {
    ui.alert('❌ Error: ' + err.message);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", error: "Sin datos recibidos"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const mensaje = data.mensaje_crudo || data.mensaje || data.last_input_text || "";
    const plataforma = data.plataforma || "webhook";
    const usuario = data.usuario || data.usuario_ig || data.ig_username || "";

    const datos = consultarGemini(mensaje, plataforma, usuario);
    guardarEnSheet(datos);

    return ContentService.createTextOutput(JSON.stringify({status: "ok", pedido: datos}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(NOMBRE_HOJA) || ss.insertSheet(NOMBRE_HOJA);
}

function guardarEnSheet(datos) {
  const sheet = getHoja();
  sheet.appendRow([
    new Date(),
    datos.plataforma || "",
    datos.usuario_ig || "",
    datos.nombre || "",
    datos.telefono || "",
    datos.pedido || "",
    datos.direccion_zona || "",
    datos.monto || "",
    datos.estado || "Pendiente",
    datos.notas || ""
  ]);
}

function consultarGemini(promptUsuario, plataforma, usuario = "") {
  if (!API_KEY || API_KEY === "PEGAR_TU_API_KEY_AQUI") {
    throw new Error("API Key no encontrada. Pegala en la constante API_KEY o en las Propiedades del Script.");
  }

  // 1. Pide a Google los modelos activos para tu API Key
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  const listRes = UrlFetchApp.fetch(listUrl, { muteHttpExceptions: true });
  const listJson = JSON.parse(listRes.getContentText());

  if (!listJson.models || listJson.models.length === 0) {
    throw new Error("Tu API Key no es válida o no tiene modelos habilitados en Google AI Studio.");
  }

  const modelosValidos = listJson.models
    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
    .map(m => m.name);

  const instruccion = `Sos el asistente de pedidos de "Brinines Panadería".
Extrae del texto y devuelve SOLO JSON válido sin bloques markdown.

Reglas:
- telefono: solo números. Si empieza con 381 agregar 549381 delante.
- monto: si dice "$12000" devolver "12000".
- estado: "Pendiente" por defecto. "Señado" o "Pagado" si lo dice explícitamente.
- plataforma: usar "${plataforma}".

Estructura JSON:
{
  "plataforma": "string",
  "usuario_ig": "string",
  "nombre": "string",
  "telefono": "string",
  "pedido": "string",
  "direccion_zona": "string",
  "monto": "string",
  "estado": "string",
  "notas": "string"
}`;

  const payload = {
    "contents": [{
      "parts": [{ "text": instruccion + `\n\nTexto a procesar:\n"""${promptUsuario}"""` }]
    }],
    "generationConfig": {
      "response_mime_type": "application/json",
      "temperature": 0.1
    }
  };

  let errores = [];

  // 2. Probar dinámicamente contra los modelos disponibles
  for (const modelPath of modelosValidos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${API_KEY}`;
    const options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    const res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      const resJson = JSON.parse(res.getContentText());
      if (resJson.candidates && resJson.candidates[0]?.content) {
        let jsonText = resJson.candidates[0].content.parts[0].text;
        
        // Limpieza estricta de JSON
        const match = jsonText.match(/\{[\s\S]*\}/);
        if (match) jsonText = match[0];

        const datos = JSON.parse(jsonText);
        datos.plataforma = plataforma;
        datos.usuario_ig = usuario;
        return datos;
      }
    } else {
      const errJson = JSON.parse(res.getContentText());
      errores.push(`${modelPath}: ${errJson.error ? errJson.error.message : res.getResponseCode()}`);
    }
  }

  throw new Error("Fallaron los modelos disponibles:\n" + errores.slice(0, 2).join("\n"));
}
}
