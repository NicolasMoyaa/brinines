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