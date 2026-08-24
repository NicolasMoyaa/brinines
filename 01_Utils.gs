/*******************************************************
 * UTILIDADES TRANSVERSALES
 *******************************************************/

function generarId(prefijo) {
  return (
    prefijo +
    "-" +
    Utilities.formatDate(new Date(), BRININES.timezone, "yyyyMMdd-HHmmss") +
    "-" +
    Utilities.getUuid().slice(0, 8)
  );
}

function logSistema(accion, estado, referencia, detalle, agente) {
  try {
    const sheet = getSheet(BRININES.sheets.logs);
    sheet.appendRow([
      generarId("LOG"),
      ahora(),
      agente || "CORE",
      accion || "",
      estado || "",
      referencia || "",
      detalle || "",
      "",
      ""
    ]);
  } catch (error) {
    console.error("No se pudo guardar log:", error);
  }
}

function leerTabla(nombreHoja) {
  const sheet = getSheet(nombreHoja);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter(row => row.some(value => value !== ""))
    .map(row => {
      const objeto = {};
      headers.forEach((header, index) => { objeto[header] = row[index]; });
      return objeto;
    });
}
