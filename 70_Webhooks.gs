/*******************************************************
 * WEBHOOKS
 *******************************************************/

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No se recibió contenido POST.");
    }

    const data = JSON.parse(e.postData.contents);

    const mensaje = data.mensaje_crudo || data.mensaje || data.last_input_text || "";
    const plataforma = data.plataforma || "webhook";
    const usuario = data.usuario || data.usuario_ig || data.ig_username || "";
    const nombre = data.nombre || "";

    const resultado = procesarConversacion(mensaje, plataforma, usuario, nombre);

    return ContentService
      .createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}