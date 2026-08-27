/*******************************************************
 * CONFIGURACIÓN CENTRAL
 *******************************************************/

const BRININES = {

  timezone: "America/Argentina/Tucuman",

  geminiKeyProperty: "GEMINI_KEY",

  modeloPrincipal: "gemini-3.1-flash-lite",

  sheets: {

    config: "Config",
    productos: "Productos",
    clientes: "Clientes",
    conversaciones: "Conversaciones",
    pedidos: "Pedidos",
    envios: "Envios",
    pagos: "Pagos",
    promociones: "Promociones",
    contenidos: "Contenidos",
    metricas: "Metricas",
    estrategias: "Estrategias",
    aprendizaje: "Aprendizaje",
    experimentos: "Experimentos",
    agentes: "Agentes",
    logs: "Logs"
  }
};

function getSS() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(nombre) {
  const sheet = getSS().getSheetByName(nombre);
  if (!sheet) {
    throw new Error('No existe la hoja "' + nombre + '".');
  }
  return sheet;
}

function getGeminiKey() {
  const key = PropertiesService.getScriptProperties().getProperty(BRININES.geminiKeyProperty);
  if (!key) {
    throw new Error("No se encontró GEMINI_KEY en Script Properties.");
  }
  return key;
}

function ahora() {
  return new Date();
}
