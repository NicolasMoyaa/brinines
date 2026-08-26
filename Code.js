/*******************************************************
 * BRININES AI — CORE V1
 * VERSION: 2026-08
 *
 * OBJETIVO:
 * - Memoria de clientes
 * - Análisis de conversaciones
 * - Registro de conversaciones
 * - Registro de pedidos
 * - Aprendizaje
 * - Feedback de entregas
 * - Gemini API Free Tier
 *
 * IMPORTANTE:
 * La API Key vive en Script Properties:
 * GEMINI_KEY
 *******************************************************/


/*******************************************************
 * MENÚ
 *******************************************************/

function onOpen() {

  SpreadsheetApp
    .getUi()

    .createMenu("🥐 Brinines AI")

    .addItem(
      "🧪 Probar Core",
      "probarCore"
    )

    .addItem(
      "💬 Probar conversación",
      "probarConversacion"
    )

    .addItem(
      "📦 Registrar pedido manual",
      "registrarPedidoManual"
    )

    .addItem(
      "🤝 Registrar feedback de entrega",
      "registrarFeedbackEntrega"
    )

    .addItem(
      "🧠 Analizar cliente",
      "analizarClienteManual"
    )

    .addSeparator()

    .addItem(
      "⚙️ Verificar sistema",
      "verificarSistema"
    )

    .addToUi();
}


/*******************************************************
 * GUARDAR CONVERSACIÓN
 *******************************************************/

function guardarConversacion(
  datos
) {

  const sheet =
    getSheet(
      BRININES.sheets.conversaciones
    );


  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];


  const fila =
    headers.map(
      header => {

        switch (header) {

          case "Conversacion_ID":
          case "ID_Conversacion":
            return generarId("CON");

          case "Fecha_Hora":
          case "Fecha":
            return ahora();

          case "Cliente_ID":
            return datos.cliente_id || "";

          case "Plataforma":
            return datos.plataforma || "";

          case "Usuario":
          case "Usuario_IG_FB_TT":
            return datos.usuario || "";

          case "Mensaje_Cliente":
            return datos.mensaje_cliente || "";

          case "Respuesta_Agente":
            return datos.respuesta_agente || "";

          case "Intencion":
            return datos.intencion || "";

          case "Etapa_Venta":
            return datos.etapa_venta || "";

          case "Estrategia_ID":
            return datos.estrategia_id || "";

          case "Resultado_Turno":
            return datos.resultado_turno || "";

          case "Intervino_Humano":
            return datos.intervino_humano || "NO";

          case "Pedido_ID":
            return datos.pedido_id || "";

          case "Hielo_Roto_Por_Cliente":
            return datos.hielo_roto_por_cliente
              ? "SI"
              : "NO";

          case "Hielo_Roto_Por_Brinines":
            return datos.hielo_roto_por_brinines
              ? "SI"
              : "NO";

          case "Nivel_Confianza":
            return datos.nivel_confianza || "";

          case "Estilo":
          case "Estilo_Detectado":
            return datos.estilo_detectado || "";

          case "Tono":
          case "Tono_Usado":
            return datos.tono_usado || "";

          case "Reaccion_Cliente":
            return datos.reaccion_cliente || "";

          case "Aprendizaje_ID":
            return datos.aprendizaje_id || "";

          case "Notas_Aprendizaje":
            return datos.notas_aprendizaje || "";

          default:
            return "";
        }
      }
    );


  sheet.appendRow(fila);
}


/*******************************************************
 * PROCESAR CONVERSACIÓN
 *******************************************************/

function procesarConversacion(
  mensaje,
  plataforma,
  identificador,
  nombre
) {

  try {

    let cliente =
      buscarCliente(
        identificador
      );


    /*
     * Si no existe:
     * crear cliente.
     */

    if (!cliente) {

      cliente =
        crearCliente({

          nombre:
            nombre || "",

          instagram:
            plataforma ===
            "instagram"
              ? identificador
              : "",

          tiktok:
            plataforma ===
            "tiktok"
              ? identificador
              : "",

          facebook:
            plataforma ===
            "facebook"
              ? identificador
              : "",

          whatsapp:
            plataforma ===
            "whatsapp"
              ? identificador
              : "",

          origen:
            plataforma

        });
    }


    /*
     * Analizar mensaje.
     */

    const analisis =
      analizarMensaje(
        mensaje,
        plataforma,
        identificador
      );


    /*
     * Actualizar memoria.
     */

    actualizarCliente(
      cliente.Cliente_ID,
      analisis
    );


    /*
     * Guardar conversación.
     */

    guardarConversacion({

      cliente_id:
        cliente.Cliente_ID,

      plataforma:
        plataforma,

      usuario:
        identificador,

      mensaje_cliente:
        mensaje,

      respuesta_agente:
        analisis.respuesta_sugerida || "",

      intencion:
        analisis.intencion,

      etapa_venta:
        analisis.etapa_venta,

      hielo_roto_por_cliente:
        analisis.hielo_roto_por_cliente,

      hielo_roto_por_brinines:
        analisis.hielo_roto_por_brinines,

      nivel_confianza:
        analisis.nivel_confianza,

      estilo_detectado:
        analisis.estilo_detectado,

      tono_usado:
        analisis.tono_recomendado

    });


    logSistema(

      "PROCESAR_CONVERSACION",

      "OK",

      cliente.Cliente_ID,

      JSON.stringify(
        analisis
      ),

      "CORE"

    );


    return {

      status: "ok",

      cliente_id:
        cliente.Cliente_ID,

      analisis:
        analisis

    };


  } catch (error) {

    logSistema(

      "PROCESAR_CONVERSACION",

      "ERROR",

      identificador || "",

      error.toString(),

      "CORE"

    );

    throw error;
  }
}


/*******************************************************
 * PRUEBA DEL CORE
 *******************************************************/

function probarCore() {

  const ui =
    SpreadsheetApp.getUi();


  try {

    const key =
      getGeminiKey();


    ui.alert(

      "🥐 Brinines AI Core\n\n" +

      "Gemini: OK\n" +

      "Modelo: " +
      BRININES.modeloPrincipal +
      "\n" +

      "API Key: encontrada\n" +

      "Google Sheets: OK\n\n" +

      "Ahora podemos probar una conversación."

    );


  } catch (error) {

    ui.alert(

      "❌ Error del Core\n\n" +

      error.toString()

    );
  }
}


/*******************************************************
 * PRUEBA DE CONVERSACIÓN
 *******************************************************/

function probarConversacion() {

  const ui =
    SpreadsheetApp.getUi();


  const respuesta =
    ui.prompt(

      "💬 Probar conversación",

      "Escribí un mensaje como si fueras un cliente:",

      ui.ButtonSet.OK_CANCEL

    );


  if (
    respuesta.getSelectedButton() !==
    ui.Button.OK
  ) {

    return;
  }


  const mensaje =
    respuesta.getResponseText();


  try {

    const resultado =
      procesarConversacion(

        mensaje,

        "prueba",

        "usuario_prueba"

      );


    ui.alert(

      "🧠 Análisis de Brinines AI\n\n" +

      JSON.stringify(

        resultado.analisis,

        null,

        2

      )

    );


  } catch (error) {

    ui.alert(

      "❌ Error\n\n" +

      error.toString()

    );
  }
}


/*******************************************************
 * PEDIDO MANUAL
 *******************************************************/

function registrarPedidoManual() {

  const ui =
    SpreadsheetApp.getUi();


  const texto =
    ui.prompt(

      "📦 Registrar pedido",

      "Pegá la conversación o información del pedido:",

      ui.ButtonSet.OK_CANCEL

    );


  if (
    texto.getSelectedButton() !==
    ui.Button.OK
  ) {

    return;
  }


  const cliente =
    ui.prompt(

      "Cliente",

      "Instagram / TikTok / WhatsApp / teléfono:",

      ui.ButtonSet.OK_CANCEL

    );


  if (
    cliente.getSelectedButton() !==
    ui.Button.OK
  ) {

    return;
  }


  const identificador =
    cliente.getResponseText();


  const resultado =
    procesarConversacion(

      texto.getResponseText(),

      "manual",

      identificador

    );


  ui.alert(

    "Pedido/conversación analizada.\n\n" +

    JSON.stringify(

      resultado.analisis,

      null,

      2

    )

  );
}


/*******************************************************
 * FEEDBACK DE ENTREGA
 *******************************************************/

function registrarFeedbackEntrega() {

  const ui =
    SpreadsheetApp.getUi();


  const cliente =
    ui.prompt(

      "🤝 Feedback de entrega",

      "Instagram / TikTok / WhatsApp / teléfono:",

      ui.ButtonSet.OK_CANCEL

    );


  if (
    cliente.getSelectedButton() !==
    ui.Button.OK
  ) {

    return;
  }


  const identificador =
    cliente.getResponseText();


  const feedback =
    ui.prompt(

      "📝 ¿Cómo fue la entrega?",

      "Ejemplo: Muy buena onda, preguntó por sabores nuevos.",

      ui.ButtonSet.OK_CANCEL

    );


  if (
    feedback.getSelectedButton() !==
    ui.Button.OK
  ) {

    return;
  }


  const clienteObj =
    buscarCliente(
      identificador
    );


  if (!clienteObj) {

    ui.alert(
      "❌ No encontré ese cliente."
    );

    return;
  }


  const prompt = `

Analizá este feedback humano
posterior a una entrega.

IMPORTANTE:

Separá hechos observados
de interpretaciones.

No inventes información.

Cliente:

${JSON.stringify(
  clienteObj
)}

Feedback del dueño/repartidor:

${feedback.getResponseText()}

Devolvé únicamente JSON:

{
  "observaciones": "",
  "tono_cliente": "",
  "preferencias_detectadas": "",
  "posible_aprendizaje": "",
  "impacto_retencion": "",
  "accion_futura": ""
}
`;


  try {

    const analisis =
      llamarGemini(
        prompt,
        "low"
      );


    const sheet =
      getSheet(
        BRININES.sheets.aprendizaje
      );


    const headers =
      sheet
        .getRange(
          1,
          1,
          1,
          sheet.getLastColumn()
        )
        .getValues()[0];


    const fila =
      headers.map(
        header => {

          switch (header) {

            case "Aprendizaje_ID":
            case "ID_Aprendizaje":
              return generarId("APR");

            case "Fecha_Hora":
              return ahora();

            case "Tipo":
              return "FEEDBACK_ENTREGA";

            case "Cliente_ID":
              return clienteObj.Cliente_ID;

            case "Observaciones":
              return analisis.observaciones || "";

            case "Feedback":
              return feedback.getResponseText();

            case "Impacto_Retencion":
              return analisis.impacto_retencion || "";

            case "Accion_Futura":
              return analisis.accion_futura || "";

            case "Estado":
              return "REGISTRADO";

            default:
              return "";
          }

        }
      );


    sheet.appendRow(fila);


    logSistema(

      "FEEDBACK_ENTREGA",

      "OK",

      clienteObj.Cliente_ID,

      JSON.stringify(
        analisis
      ),

      "DELIVERY"

    );


    ui.alert(

      "✅ Feedback guardado.\n\n" +

      "El aprendizaje quedó registrado."

    );


  } catch (error) {

    ui.alert(

      "❌ Error:\n\n" +

      error.toString()

    );
  }
}


/*******************************************************
 * ANALIZAR CLIENTE
 *******************************************************/

function analizarClienteManual() {

  const ui =
    SpreadsheetApp.getUi();


  const respuesta =
    ui.prompt(

      "🧠 Analizar cliente",

      "Ingresá Instagram, teléfono, WhatsApp u otro identificador:",

      ui.ButtonSet.OK_CANCEL

    );


  if (
    respuesta.getSelectedButton() !==
    ui.Button.OK
  ) {

    return;
  }


  const identificador =
    respuesta.getResponseText();


  const cliente =
    buscarCliente(
      identificador
    );


  if (!cliente) {

    ui.alert(
      "No encontré ese cliente."
    );

    return;
  }


  const contexto =
    construirContextoCliente(
      cliente
    );


  ui.alert(

    "🧠 Perfil de cliente\n\n" +

    JSON.stringify(

      contexto,

      null,

      2

    )

  );
}


/*******************************************************
 * VERIFICACIÓN DEL SISTEMA (OPTIMIZADA)
 *******************************************************/

function verificarSistema() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Obtener todas las hojas de UNA SOLA VEZ (mapa nombre -> sheet)
  const todasLasHojas = {};
  ss.getSheets().forEach(s => { todasLasHojas[s.getName()] = s; });
  
  const esperadas = BRININES.sheets;
  const resultados = [];
  const detalles = [];
  
  // 2. Verificar existencia, filas, columnas, encabezados en un solo pase
  Object.keys(esperadas).forEach(key => {
    const nombre = esperadas[key];
    const sheet = todasLasHojas[nombre];
    
    if (!sheet) {
      resultados.push("❌ " + nombre + " (NO EXISTE)");
      return;
    }
    
    const ultimaFila = sheet.getLastRow();
    const ultimaCol = sheet.getLastColumn();
    let headers = [];
    
    if (ultimaFila > 0 && ultimaCol > 0) {
      headers = sheet.getRange(1, 1, 1, ultimaCol).getValues()[0];
    }
    
    resultados.push("✅ " + nombre + " (" + ultimaFila + " filas, " + ultimaCol + " cols)");
    detalles.push({ hoja: nombre, filas: ultimaFila, cols: ultimaCol, headers });
  });
  
  // 3. Gemini Key (rápido, solo Script Properties)
  let geminiStatus = "❌ GEMINI_KEY no encontrada";
  try {
    getGeminiKey();
    geminiStatus = "✅ GEMINI_KEY configurada";
  } catch (e) {}
  
  // 4. Verificar funciones críticas existen (referencia global)
  const funcionesCriticas = [
    'doPost', 'onOpen', 'procesarConversacion', 'analizarMensaje',
    'buscarCliente', 'construirContextoCliente', 'llamarGemini',
    'guardarConversacion', 'actualizarCliente', 'crearCliente',
    'getSheet', 'getGeminiKey', 'leerTabla', 'generarId', 'logSistema'
  ];
  
  const faltantes = funcionesCriticas.filter(f => typeof this[f] !== 'function');
  const funcStatus = faltantes.length === 0 
    ? "✅ Funciones críticas: OK" 
    : "❌ Faltantes: " + faltantes.join(', ');
  
  // 5. Modelo configurado
  const modelo = BRININES.modeloPrincipal || "NO DEFINIDO";
  
  // 6. Output consolidado
  const mensaje = [
    "🥐 BRININES AI — DIAGNÓSTICO RÁPIDO",
    "",
    "📋 HOJAS:",
    ...resultados,
    "",
    "🔑 " + geminiStatus,
    "🤖 Modelo: " + modelo,
    "⚙️ " + funcStatus,
    "",
    "✅ Verificación completada en < 5 seg"
  ].join("\n");
  
  ui.alert(mensaje);
  
  // Log silencioso para auditoría
  console.log("DIAGNÓSTICO:", { hojas: detalles, gemini: geminiStatus, funciones: funcStatus, modelo });
}

function diagnosticarEstructuraBrinines() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojas = ss.getSheets();

  const resultado = [];

  hojas.forEach(sheet => {
    const nombre = sheet.getName();
    const ultimaColumna = sheet.getLastColumn();
    const ultimaFila = sheet.getLastRow();

    let encabezados = [];

    if (ultimaColumna > 0 && ultimaFila > 0) {
      encabezados = sheet
        .getRange(1, 1, 1, ultimaColumna)
        .getValues()[0];
    }

    resultado.push({
      hoja: nombre,
      filas: ultimaFila,
      columnas: ultimaColumna,
      encabezados: encabezados
    });
  });

  Logger.log(JSON.stringify(resultado, null, 2));

  SpreadsheetApp.getUi().alert(
    "Diagnóstico terminado ✅\n\n" +
    "Abrí Ejecuciones > Registros para ver la estructura."
  );
}


/*******************************************************
 * PRUEBAS DE VALIDACIÓN - 10 CASOS
 *******************************************************/

function ejecutarPruebasValidacion() {
  const pruebas = [
    "Hola, quiero los de siempre",
    "Nunca probé los budines, cuál me recomendás?",
    "Hola! Cómo están? 😊 Quería consultar qué sabores tienen disponibles.",
    "Hola! Quiero pedir de nuevo, me encantaron los budines 😍",
    "Cuánto sale el de chocolate?",
    "Tenés de limón?",
    "Quiero 3 de chocolate y 2 de limón",
    "Cuánto sale el envío?",
    "Quiero pedir para mañana",
    "No me gustaron, estaban secos"
  ];

  const identificador = "usuario_prueba_validacion";
  const plataforma = "validacion";

  const resultados = [];
  let exitosas = 0;
  let fallidas = 0;
  const errores = [];

  for (let i = 0; i < pruebas.length; i++) {
    const numPrueba = i + 1;
    const mensaje = pruebas[i];

    try {
      const resultado = procesarConversacion(mensaje, plataforma, identificador);
      const analisis = resultado.analisis;

      const registro = {
        prueba: numPrueba,
        mensaje: mensaje,
        analisis_completo: analisis,
        respuesta_sugerida: analisis.respuesta_sugerida || "",
        intencion: analisis.intencion || "",
        etapa_venta: analisis.etapa_venta || "",
        temperatura: analisis.temperatura || "",
        nivel_confianza: analisis.nivel_confianza || "",
        estilo_detectado: analisis.estilo_detectado || "",
        directo_score: analisis.directo_score || 0,
        cordialidad_score: analisis.cordialidad_score || 0,
        informalidad_score: analisis.informalidad_score || 0,
        humor_score: analisis.humor_score || 0,
        necesita_guia_score: analisis.necesita_guia_score || 0,
        preferencia_longitud: analisis.preferencia_longitud || "",
        preferencia_emojis: analisis.preferencia_emojis || "",
        hielo_roto_por_cliente: analisis.hielo_roto_por_cliente || false,
        hielo_roto_por_brinines: analisis.hielo_roto_por_brinines || false,
        es_pedido: analisis.es_pedido || false,
        resumen_interno: analisis.resumen_interno || "",
        status: "OK"
      };

      resultados.push(registro);
      exitosas++;

      Logger.log(`PRUEBA ${numPrueba}/10 ✅`);
      Logger.log(`Mensaje: ${mensaje}`);
      Logger.log(`Intención: ${analisis.intencion}`);
      Logger.log(`Confianza: ${analisis.nivel_confianza}`);
      Logger.log(`Respuesta: ${analisis.respuesta_sugerida}`);
      Logger.log("---");

    } catch (error) {
      const registro = {
        prueba: numPrueba,
        mensaje: mensaje,
        error: error.toString(),
        status: "ERROR"
      };
      resultados.push(registro);
      fallidas++;
      errores.push({ prueba: numPrueba, mensaje, error: error.toString() });

      Logger.log(`PRUEBA ${numPrueba}/10 ❌`);
      Logger.log(`Mensaje: ${mensaje}`);
      Logger.log(`Error: ${error.toString()}`);
      Logger.log("---");
    }
  }

  const fecha = new Date();
  const timestamp = Utilities.formatDate(fecha, Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");

  const resumenFinal = {
    fecha_ejecucion: timestamp,
    modelo: BRININES.modeloPrincipal,
    total_pruebas: pruebas.length,
    exitosas: exitosas,
    fallidas: fallidas,
    tasa_exito: ((exitosas / pruebas.length) * 100).toFixed(1) + "%",
    resultados: resultados,
    errores: errores,
    patrones_problematicos: detectarPatronesProblemas(resultados)
  };

  Logger.log("========================================");
  Logger.log("RESUMEN FINAL DE PRUEBAS DE VALIDACIÓN");
  Logger.log("========================================");
  Logger.log(`Fecha: ${timestamp}`);
  Logger.log(`Modelo: ${BRININES.modeloPrincipal}`);
  Logger.log(`Total: ${pruebas.length}`);
  Logger.log(`Exitosas: ${exitosas}`);
  Logger.log(`Fallidas: ${fallidas}`);
  Logger.log(`Tasa de éxito: ${resumenFinal.tasa_exito}`);
  Logger.log("========================================");

  guardarResultadosPruebas(resumenFinal);

  return resumenFinal;
}

function detectarPatronesProblemas(resultados) {
  const patrones = [];

  const fallidas = resultados.filter(r => r.status === "ERROR");
  if (fallidas.length > 0) {
    patrones.push(`${fallidas.length} prueba(s) fallaron con errores de ejecución`);
  }

  const sinIntencion = resultados.filter(r => r.status === "OK" && !r.intencion);
  if (sinIntencion.length > 0) {
    patrones.push(`${sinIntencion.length} prueba(s) sin intención detectada`);
  }

  const bajaConfianza = resultados.filter(r => r.status === "OK" && r.nivel_confianza === "BAJO");
  if (bajaConfianza.length > 0) {
    patrones.push(`${bajaConfianza.length} prueba(s) con confianza BAJA`);
  }

  const sinRespuesta = resultados.filter(r => r.status === "OK" && !r.respuesta_sugerida);
  if (sinRespuesta.length > 0) {
    patrones.push(`${sinRespuesta.length} prueba(s) sin respuesta sugerida`);
  }

  const hieloRotoIncorrecto = resultados.filter(r =>
    r.status === "OK" &&
    r.hielo_roto_por_cliente === true &&
    !["Hola, quiero los de siempre", "Hola! Quiero pedir de nuevo, me encantaron los budines 😍"].includes(r.mensaje)
  );
  if (hieloRotoIncorrecto.length > 0) {
    patrones.push(`${hieloRotoIncorrecto.length} prueba(s) con hielo_roto_por_cliente=true en casos sin continuidad clara`);
  }

  return patrones.length > 0 ? patrones : ["No se detectaron patrones problemáticos significativos"];
}

function guardarResultadosPruebas(resumen) {
  const sheetName = "Resultados_Pruebas";
  let sheet;
  try {
    sheet = getSheet(sheetName);
  } catch (e) {
    const ss = getSS();
    sheet = ss.insertSheet(sheetName);
    const headers = [
      "Timestamp", "Prueba", "Mensaje", "Status", "Intencion", "Etapa_Venta",
      "Temperatura", "Nivel_Confianza", "Estilo", "Respuesta_Sugerida",
      "Directo_Score", "Cordialidad_Score", "Informalidad_Score", "Humor_Score",
      "Necesita_Guia_Score", "Pref_Longitud", "Pref_Emojis",
      "Hielo_Roto_Cliente", "Hielo_Roto_Brinines", "Es_Pedido", "Resumen_Interno", "Error"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  const timestamp = resumen.fecha_ejecucion;
  const rows = resumen.resultados.map(r => [
    timestamp,
    r.prueba,
    r.mensaje,
    r.status,
    r.intencion || "",
    r.etapa_venta || "",
    r.temperatura || "",
    r.nivel_confianza || "",
    r.estilo_detectado || "",
    r.respuesta_sugerida || "",
    r.directo_score || 0,
    r.cordialidad_score || 0,
    r.informalidad_score || 0,
    r.humor_score || 0,
    r.necesita_guia_score || 0,
    r.preferencia_longitud || "",
    r.preferencia_emojis || "",
    r.hielo_roto_por_cliente ? "SI" : "NO",
    r.hielo_roto_por_brinines ? "SI" : "NO",
    r.es_pedido ? "SI" : "NO",
    r.resumen_interno || "",
    r.error || ""
  ]);

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }

  const resumenSheetName = "Resumen_Pruebas";
  let resumenSheet;
  try {
    resumenSheet = getSheet(resumenSheetName);
  } catch (e) {
    const ss = getSS();
    resumenSheet = ss.insertSheet(resumenSheetName);
    const resumenHeaders = ["Timestamp", "Modelo", "Total", "Exitosas", "Fallidas", "Tasa_Exito", "Patrones"];
    resumenSheet.getRange(1, 1, 1, resumenHeaders.length).setValues([resumenHeaders]);
    resumenSheet.setFrozenRows(1);
  }

  resumenSheet.getRange(resumenSheet.getLastRow() + 1, 1, 1, 7).setValues([[
    timestamp,
    resumen.modelo,
    resumen.total_pruebas,
    resumen.exitosas,
    resumen.fallidas,
    resumen.tasa_exito,
    resumen.patrones_problematicos.join("; ")
  ]]);

  Logger.log(`Resultados guardados en hoja "${sheetName}" y resumen en "${resumenSheetName}"`);
}