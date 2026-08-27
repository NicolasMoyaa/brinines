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

    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("📦 Catálogo")
        .addItem("🔄 Cargar Mock Data", "setupMockDataComercial")
        .addItem("🗑️ Invalidar Caché Comercial", "invalidarCacheComercial")
    )

    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("🚚 Envíos")
        .addItem("Ver zonas configuradas", "verEnviosConfigurados")
    )

    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("💳 Pagos")
        .addItem("Ver medios disponibles", "verPagosDisponibles")
    )

    .addSubMenu(
      SpreadsheetApp.getUi().createMenu("🎁 Promociones")
        .addItem("Ver promociones activas", "verPromocionesActivas")
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
     * Obtener contexto comercial actual (snapshot desde Sheets con cache).
     */

    const contextoComercial = obtenerContextoComercial();


    /*
     * Analizar mensaje con contexto comercial inyectado.
     */

    const analisis =
      analizarMensaje(
        mensaje,
        plataforma,
        identificador,
        contextoComercial
      );


    /*
     * Normalizar zona mencionada por el cliente.
     */

    let zonaNormalizada = null;
    if (analisis.zona_mencionada) {
      zonaNormalizada = normalizarZonaComercial(analisis.zona_mencionada);
    }


    /*
     * Calcular pedido si corresponde.
     */

    let calculoPedido = null;
    let respuestaFinal = analisis.respuesta_sugerida || "";

    if (analisis.es_pedido && analisis.productos_detectados && analisis.productos_detectados.length > 0) {
      try {
        const ctxParaCalculo = {
          ...contextoComercial,
          cliente: { zona: zonaNormalizada || cliente.Zona_Cliente || "CENTRO" }
        };
        calculoPedido = calcularPedidoCompleto(analisis, ctxParaCalculo, contextoComercial.productos);

        // Construir respuesta final con totales reales
        respuestaFinal = construirRespuestaPedido(calculoPedido, contextoComercial.pagos);
      } catch (errorCalc) {
        logSistema("CALCULO_PEDIDO", "ERROR", cliente.Cliente_ID, errorCalc.toString(), "CORE");
        respuestaFinal = "Hubo un problema calculando tu pedido. " + errorCalc.toString();
      }
    }


    /*
     * Actualizar zona del cliente si se detectó una nueva.
     */

    if (analisis.zona_mencionada) {
      actualizarZonaCliente(cliente.Cliente_ID, analisis.zona_mencionada);
    }

    /*
     * Actualizar memoria del cliente (incluye zona normalizada si se detectó).
     */

    const analisisParaGuardar = { ...analisis };
    if (zonaNormalizada) {
      analisisParaGuardar.zona_normalizada = zonaNormalizada;
    }
    actualizarCliente(
      cliente.Cliente_ID,
      analisisParaGuardar
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
        respuestaFinal,

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


    /*
     * Guardar pedido si se calculó.
     */

    if (calculoPedido) {
      guardarPedido(cliente.Cliente_ID, calculoPedido, analisis, zonaNormalizada, analisis.medio_pago_mencionado);
    }


    logSistema(

      "PROCESAR_CONVERSACION",

      "OK",

      cliente.Cliente_ID,

      JSON.stringify({
        analisis: analisis,
        calculo_pedido: calculoPedido
      }),

      "CORE"

    );


    return {

      status: "ok",

      cliente_id:
        cliente.Cliente_ID,

      analisis:
        analisis,

      calculo_pedido:
        calculoPedido,

      respuesta_final:
        respuestaFinal

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

function construirRespuestaPedido(calculo, pagosDisponibles) {
  const lines = [];
  lines.push("¡Dale! 😊 Te armé el pedido:");
  
  calculo.items.forEach(item => {
    const subtotalItem = item.precio * item.cantidad;
    lines.push(item.cantidad + " x " + item.sabor + " ($" + item.precio.toLocaleString() + ") = $" + subtotalItem.toLocaleString());
  });
  
  lines.push("Subtotal: $" + calculo.subtotal.toLocaleString());
  
  if (calculo.envio.costo > 0) {
    lines.push("Envío " + calculo.envio.zona + ": $" + calculo.envio.costo.toLocaleString());
  } else if (calculo.envio.gratis) {
    lines.push("Envío " + calculo.envio.zona + ": GRATIS 🎉");
  }
  
  if (calculo.descuento_total > 0) {
    lines.push("Descuentos: -$" + calculo.descuento_total.toLocaleString());
    calculo.promociones.forEach(p => lines.push("  - " + p.nombre + ": -$" + p.descuento.toLocaleString()));
  }
  
  lines.push("────────────────────────");
  lines.push("Total: $" + calculo.total.toLocaleString());
  
  const mediosActivos = (pagosDisponibles || []).filter(p => p.disponible).map(p => p.medio);
  if (mediosActivos.length > 0) {
    lines.push("");
    lines.push("¿Cómo querés abonar? " + mediosActivos.join(" o "));
  }
  
  return lines.join("\n");
}

function guardarPedido(clienteId, calculo, analisis, zonaNormalizada, medioPagoMencionado) {
  try {
    const sheet = getSheet(BRININES.sheets.pedidos);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const itemsJson = JSON.stringify(calculo.items.map(i => ({
      producto_id: i.producto_id,
      sabor: i.sabor,
      cantidad: i.cantidad,
      precio_unitario: i.precio,
      subtotal: i.precio * i.cantidad
    })));
    
    const promoJson = JSON.stringify(calculo.promociones.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descuento: p.descuento
    })));
    
    const fila = headers.map(header => {
      switch (header) {
        case "Pedido_ID": return generarId("PED");
        case "Cliente_ID": return clienteId;
        case "Fecha_Hora": return ahora();
        case "Items_JSON": return itemsJson;
        case "Subtotal": return calculo.subtotal;
        case "Envio_Zona": return calculo.envio.zona;
        case "Envio_Costo": return calculo.envio.costo;
        case "Descuento_Promos": return calculo.descuento_total;
        case "Total": return calculo.total;
        case "Medio_Pago": return medioPagoMencionado || "";
        case "Estado": return "CONFIRMADO";
        case "Tipo_Entrega": return calculo.envio.costo > 0 ? "ENVIO" : "RETIRO";
        case "Notas": return "Promos: " + promoJson;
        default: return "";
      }
    });
    
    sheet.appendRow(fila);
    logSistema("GUARDAR_PEDIDO", "OK", clienteId, "Total: " + calculo.total, "CORE");
  } catch (e) {
    logSistema("GUARDAR_PEDIDO", "ERROR", clienteId, e.toString(), "CORE");
    throw e;
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
    "No me gustaron, estaban secos",
    "Quiero 3 de chocolate y 2 de limón",
    "Quiero 3 de chocolate y 2 de limón, zona Las Talitas",
    "Quiero 3 de chocolate y 2 de limón, zona Centro",
    "Quiero 1 de sin azúcar",
    "Quiero 100 de chocolate",
    "Estoy en Las Talitas",
    "OTRA Las Talitas",
    "Quiero pagar por MercadoPago",
    "Quiero pagar por transferencia",
    "Quiero pagar en efectivo"
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

  const pruebasPedido = resultados.filter(r => r.status === "OK" && r.prueba >= 11 && r.prueba <= 15);
  const pedidoSinCalculo = pruebasPedido.filter(r => !r.analisis_completo?.calculo_pedido);
  if (pedidoSinCalculo.length > 0) {
    patrones.push(`${pedidoSinCalculo.length} prueba(s) de pedido sin cálculo determinístico`);
  }

  const zonaTalitas = resultados.find(r => r.prueba === 12);
  if (zonaTalitas && zonaTalitas.analisis_completo?.zona_mencionada === "Las Talitas" && zonaTalitas.analisis_completo?.zona_normalizada !== "OTRA_LAS_TALITAS") {
    patrones.push("Prueba 12: zona Las Talitas no normalizada a OTRA_LAS_TALITAS");
  }

  const zonaCentro = resultados.find(r => r.prueba === 13);
  if (zonaCentro && zonaCentro.analisis_completo?.zona_mencionada === "Centro" && zonaCentro.analisis_completo?.zona_normalizada !== "CENTRO") {
    patrones.push("Prueba 13: zona Centro no normalizada a CENTRO");
  }

  const promoSinAzucar = resultados.find(r => r.prueba === 14);
  if (promoSinAzucar && promoSinAzucar.analisis_completo?.calculo_pedido?.descuento_total === 0) {
    patrones.push("Prueba 14: promo Sin Azúcar 15% no aplicada");
  }

  const stockInsuficiente = resultados.find(r => r.prueba === 15);
  if (stockInsuficiente && stockInsuficiente.status === "OK") {
    patrones.push("Prueba 15: debería fallar por stock insuficiente (100 chocolate, stock=50)");
  }

  const zonaDetectada = resultados.find(r => r.prueba === 16);
  if (zonaDetectada && zonaDetectada.analisis_completo?.zona_normalizada !== "OTRA_LAS_TALITAS") {
    patrones.push("Prueba 16: 'Estoy en Las Talitas' no normalizó a OTRA_LAS_TALITAS");
  }

  const ctaOtra = resultados.find(r => r.prueba === 17);
  if (ctaOtra && ctaOtra.analisis_completo?.zona_normalizada !== "OTRA_LAS_TALITAS") {
    patrones.push("Prueba 17: selección OTRA + 'Las Talitas' no normalizó a OTRA_LAS_TALITAS");
  }

  const mpInactivo = resultados.find(r => r.prueba === 18);
  if (mpInactivo && mpInactivo.analisis_completo?.medio_pago_mencionado === "MERCADOPAGO") {
    patrones.push("Prueba 18: MercadoPago no debería ser ofrecido (inactivo)");
  }

  const transferencia = resultados.find(r => r.prueba === 19);
  if (transferencia && transferencia.analisis_completo?.medio_pago_mencionado !== "TRANSFERENCIA") {
    patrones.push("Prueba 19: 'transferencia' no detectado como medio de pago");
  }

  const efectivo = resultados.find(r => r.prueba === 20);
  if (efectivo && efectivo.analisis_completo?.medio_pago_mencionado !== "EFECTIVO") {
    patrones.push("Prueba 20: 'efectivo' no detectado como medio de pago");
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

function verEnviosConfigurados() {
  const ctx = obtenerContextoComercial();
  const lines = ["🚚 ZONAS DE ENVÍO CONFIGURADAS:"];
  ctx.envios.forEach(e => {
    lines.push(`${e.zona} | $${e.costo} | ${e.disponible ? "✅" : "❌"} | ${e.tiempo || ""} | Mín gratis: ${e.minimoGratis || "N/A"}`);
  });
  SpreadsheetApp.getUi().alert(lines.join("\n"));
}

function verPagosDisponibles() {
  const ctx = obtenerContextoComercial();
  const lines = ["💳 MEDIOS DE PAGO:"];
  ctx.pagos.forEach(p => {
    lines.push(`${p.medio} | ${p.disponible ? "✅" : "❌"} | Comisión: ${p.comision}% | ${p.instrucciones || ""}`);
  });
  SpreadsheetApp.getUi().alert(lines.join("\n"));
}

function verPromocionesActivas() {
  const ctx = obtenerContextoComercial();
  const lines = ["🎁 PROMOCIONES VIGENTES:"];
  ctx.promociones.forEach(p => {
    lines.push(`${p.nombre} | ${p.tipo} | Valor: ${p.valor} | Condición: ${JSON.stringify(p.condicion)}`);
  });
  if (ctx.promociones.length === 0) lines.push("(ninguna activa)");
  SpreadsheetApp.getUi().alert(lines.join("\n"));
}