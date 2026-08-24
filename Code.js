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
 * CONFIGURACIÓN CENTRAL
 *******************************************************/

/*
// const BRININES = {

  timezone: "America/Argentina/Tucuman",

  geminiKeyProperty: "GEMINI_KEY",

  modeloPrincipal: "gemini-3.1-flash-lite",

  sheets: {

    config: "Config",

    productos: "Productos",

    clientes: "Clientes",

    conversaciones: "Conversaciones",

    pedidos: "Pedidos",

    contenidos: "Contenidos",

    metricas: "Metricas",

    estrategias: "Estrategias",

    aprendizaje: "Aprendizaje",

    experimentos: "Experimentos",

    agentes: "Agentes",

    logs: "Logs"
  }
};
*/


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
 * GOOGLE SHEETS
 *******************************************************/

function getSS() {

  return SpreadsheetApp
    .getActiveSpreadsheet();
}


function getSheet(nombre) {

  const sheet =
    getSS().getSheetByName(nombre);

  if (!sheet) {

    throw new Error(
      'No existe la hoja "' +
      nombre +
      '".'
    );
  }

  return sheet;
}


/*******************************************************
 * GEMINI KEY
 *******************************************************/

function getGeminiKey() {

  const key =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        BRININES.geminiKeyProperty
      );

  if (!key) {

    throw new Error(
      "No se encontró GEMINI_KEY en Script Properties."
    );
  }

  return key;
}


/*******************************************************
 * FECHA
 *******************************************************/

function ahora() {

  return new Date();
}


/*******************************************************
 * IDS
 *******************************************************/

function generarId(prefijo) {

  return (
    prefijo +
    "-" +
    Utilities.formatDate(
      new Date(),
      BRININES.timezone,
      "yyyyMMdd-HHmmss"
    ) +
    "-" +
    Utilities.getUuid().slice(0, 8)
  );
}


/*******************************************************
 * LOG
 *******************************************************/

function logSistema(
  accion,
  estado,
  referencia,
  detalle,
  agente
) {

  try {

    const sheet =
      getSheet(
        BRININES.sheets.logs
      );

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

    console.error(
      "No se pudo guardar log:",
      error
    );
  }
}


/*******************************************************
 * LEER TABLA COMO OBJETOS
 *******************************************************/

/*
function leerTabla(nombreHoja) {

  const sheet =
    getSheet(nombreHoja);

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (values.length < 2) {

    return [];
  }

  const headers =
    values[0];

  return values
    .slice(1)

    .filter(row =>
      row.some(
        value =>
          value !== ""
      )
    )

    .map(row => {

      const objeto = {};

      headers.forEach(
        (header, index) => {

          objeto[header] =
            row[index];

        }
      );

      return objeto;

    });
}
*/


/*******************************************************
 * BUSCAR CLIENTE
 *******************************************************/

/*
function buscarCliente(
  identificador
) {

  if (!identificador) {

    return null;
  }

  const clientes =
    leerTabla(
      BRININES.sheets.clientes
    );

  const buscado =
    String(
      identificador
    )
      .trim()
      .toLowerCase();

  return clientes.find(
    cliente => {

      const campos = [

        cliente.Cliente_ID,

        cliente.Telefono,

        cliente.Instagram,

        cliente.TikTok,

        cliente.Facebook,

        cliente.WhatsApp,

        cliente.Nombre

      ];

      return campos.some(
        valor =>

          valor &&

          String(valor)
            .trim()
            .toLowerCase() ===
          buscado
      );

    }
  ) || null;
}
*/


/*******************************************************
 * NORMALIZAR ZONA
 *
 * SOLO:
 * CENTRO
 * FUERA_CENTRO
 *
 * Nunca guardamos dirección.
 *******************************************************/

/*
function normalizarZona(zona) {

  if (!zona) {

    return "";
  }

  const texto =
    String(zona)
      .trim()
      .toUpperCase();

  if (
    texto.includes("FUERA")
  ) {

    return "FUERA_CENTRO";
  }

  if (
    texto.includes("CENTRO")
  ) {

    return "CENTRO";
  }

  return "";
}
*/


/*******************************************************
 * CREAR CLIENTE
 *******************************************************/

/*
function crearCliente(
  datos
) {

  const sheet =
    getSheet(
      BRININES.sheets.clientes
    );

  const id =
    generarId("CLI");

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

          case "Cliente_ID":
            return id;

          case "Nombre":
            return datos.nombre || "";

          case "Telefono":
            return datos.telefono || "";

          case "Instagram":
            return datos.instagram || "";

          case "TikTok":
            return datos.tiktok || "";

          case "Facebook":
            return datos.facebook || "";

          case "WhatsApp":
            return datos.whatsapp || "";

          case "Zona":
          case "Zona_Cliente":
            return normalizarZona(
              datos.zona
            );

          case "Fecha_Alta":
            return ahora();

          case "Ultima_Interaccion":
            return ahora();

          case "Cantidad_Pedidos":
            return 0;

          case "Total_Gastado":
            return 0;

          case "Nivel_Familiaridad":
            return "NUEVO";

          case "Estado_Confianza":
            return "STANDARD";

          case "Hielo_Roto_Por_Cliente":
            return "NO";

          case "Hielo_Roto_Por_Brinines":
            return "NO";

          case "Estilo_Comunicacion":
            return "SIN_DATOS";

          case "Tono_Recomendado":
            return "CORDIAL";

          default:
            return "";
        }
      }
    );

  sheet.appendRow(fila);

  return buscarCliente(id);
}
*/


/*******************************************************
 * HISTORIAL CLIENTE
 *******************************************************/

/*
function obtenerHistorialCliente(
  clienteId
) {

  const conversaciones =
    leerTabla(
      BRININES.sheets.conversaciones
    )
      .filter(
        conversacion =>
          String(
            conversacion.Cliente_ID
          ) ===
          String(clienteId)
      );

  const pedidos =
    leerTabla(
      BRININES.sheets.pedidos
    )
      .filter(
        pedido =>
          String(
            pedido.Cliente_ID || ""
          ) ===
          String(clienteId)
      );

  return {

    conversaciones:
      conversaciones.slice(-30),

    pedidos:
      pedidos.slice(-20)

  };
}
*/


/*******************************************************
 * CONTEXTO DEL CLIENTE
 *******************************************************/

/*
function construirContextoCliente(
  cliente
) {

  if (!cliente) {

    return {
      existe: false
    };
  }

  const historial =
    obtenerHistorialCliente(
      cliente.Cliente_ID
    );

  return {

    existe: true,

    cliente: {

      id:
        cliente.Cliente_ID,

      nombre:
        cliente.Nombre,

      cantidad_pedidos:
        cliente.Cantidad_Pedidos,

      total_gastado:
        cliente.Total_Gastado,

      producto_favorito:
        cliente.Producto_Favorito,

      nivel_familiaridad:
        cliente.Nivel_Familiaridad,

      estado_confianza:
        cliente.Estado_Confianza,

      hielo_roto_por_cliente:
        cliente.Hielo_Roto_Por_Cliente,

      hielo_roto_por_brinines:
        cliente.Hielo_Roto_Por_Brinines,

      estilo:
        cliente.Estilo_Comunicacion,

      tono_recomendado:
        cliente.Tono_Recomendado

    },

    historial: historial
  };
}
*/


/*******************************************************
 * GEMINI
 *
 * Gemini 3.7 Flash
 *
 * Free Tier.
 *
 * No usamos:
 * temperature
 * top_p
 * top_k
 *
 * porque Gemini 3.x utiliza
 * thinkingLevel.
 *******************************************************/

/*
function llamarGemini(
  prompt,
  thinkingLevel
) {

  const apiKey =
    getGeminiKey();

  const model =
    BRININES.modeloPrincipal;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    model +
    ":generateContent";

  const payload = {

    contents: [

      {

        parts: [

          {
            text: prompt
          }

        ]

      }

    ],

    generationConfig: {

      responseMimeType:
        "application/json",

      thinkingConfig: {

        thinkingLevel:
          thinkingLevel ||
          "low"

      }

    }

  };


  const response =
    UrlFetchApp.fetch(
      url,
      {

        method: "post",

        contentType:
          "application/json",

        headers: {

          "x-goog-api-key":
            apiKey

        },

        payload:
          JSON.stringify(
            payload
          ),

        muteHttpExceptions:
          true

      }
    );


  const status =
    response.getResponseCode();

  const body =
    response.getContentText();


  if (status !== 200) {

    throw new Error(

      "Gemini HTTP " +
      status +
      ":\n\n" +
      body

    );
  }


  const json =
    JSON.parse(body);


  const texto =
    json
      .candidates?.[0]
      ?.content
      ?.parts?.[0]
      ?.text;


  if (!texto) {

    throw new Error(

      "Gemini respondió correctamente, " +
      "pero no devolvió contenido."

    );
  }


  const limpio =
    texto
      .replace(
        /```json/gi,
        ""
      )
      .replace(
        /```/g,
        ""
      )
      .trim();


  try {

    return JSON.parse(
      limpio
    );

  } catch (error) {

    throw new Error(

      "Gemini no devolvió JSON válido.\n\n" +
      limpio

    );
  }
}
*/


/*******************************************************
 * ANALIZAR MENSAJE
 *******************************************************/

function analizarMensaje(
  mensaje,
  plataforma,
  identificador
) {

  const cliente =
  buscarCliente(
    identificador,
    plataforma
  );


  const contexto =
    construirContextoCliente(
      cliente
    );


  const prompt = `

Sos el MOTOR DE ANÁLISIS CONVERSACIONAL
de Brinines Panadería.

Brinines vende budines en Tucumán.

Tu trabajo NO es simplemente generar una respuesta.

Tu trabajo principal es comprender con precisión
qué está ocurriendo en la conversación para que
otro componente del sistema pueda decidir
la mejor estrategia comercial.

OBJETIVO GENERAL:

1. Aumentar ventas.
2. Retener clientes.
3. Generar buenas experiencias.
4. Comprender a cada cliente.
5. Aprender de resultados reales.
6. Adaptar la comunicación.
7. No invadir al cliente.
8. No forzar ventas.

IMPORTANTE:

Una conversación sin venta puede ser
una buena conversación.

Una venta no demuestra automáticamente
que la estrategia utilizada haya sido correcta.

El sistema debe aprender de resultados reales.


==================================================
REGLAS DE VERACIDAD
==================================================

1. NO inventes precios.

2. NO inventes sabores.

3. NO inventes disponibilidad.

4. NO inventes condiciones de envío.

5. NO inventes promociones.

6. NO inventes información del negocio.

7. NO inventes información del cliente.

8. NO afirmes que un producto es "el más vendido"
   si esa información no aparece explícitamente
   en el contexto proporcionado.

9. NO afirmes que un sabor es "favorito de nuestros
   clientes" si no existe una métrica real
   que lo demuestre.

10. NO conviertas una suposición en un hecho.

11. Si una información no está disponible,
    indicá internamente que falta información.

12. Nunca rellenes información faltante
    inventándola.


==================================================
PRIVACIDAD
==================================================

13. No realizar reconocimiento facial.

14. No inferir edad por fotografías.

15. No inferir características sensibles.

16. No inferir personalidad por apariencia.

17. El estilo comunicacional debe inferirse
    únicamente a partir del intercambio conversacional
    y del contexto permitido.

18. La zona del cliente solamente puede utilizarse
    para análisis interno.

19. Los únicos valores válidos para zona son:

    CENTRO
    FUERA_CENTRO

20. Nunca mencionar la zona al cliente
    como técnica comercial.

21. Nunca utilizar la dirección exacta del cliente
    para generar una respuesta.


==================================================
ESTILO DEL CLIENTE
==================================================

Analizá cómo se comunica el cliente.

Puede ser:

- directo
- cordial
- serio
- informal
- conversador
- curioso
- necesita guía
- humorístico
- muy breve
- orientado directamente a comprar

Estas categorías son descriptivas,
NO etiquetas rígidas.

No asumir edad.

No asumir género.

No asumir características personales
que no aparezcan en la conversación.


==================================================
ESCALA DE SCORES
==================================================

TODOS los scores deben ser números ENTEROS
entre 0 y 100.

0 = ausencia total.

50 = nivel medio.

100 = nivel muy alto.

NUNCA utilizar 0-1.

NUNCA utilizar 0-10.

Ejemplo:

directo_score = 90
cordialidad_score = 60
humor_score = 10


==================================================
HUMOR
==================================================

El humor debe detectarse únicamente cuando
el cliente realmente lo demuestra.

Una persona que escribe:

"Hola! Cómo están? 😊"

NO está necesariamente utilizando humor.

Eso solamente demuestra cordialidad.

Un cliente que escribe:

"Necesito urgentemente algo dulce
antes de cometer una locura 😂"

sí está utilizando humor.

El humor_score debe representar
la cantidad/intensidad de humor realmente
observada.

Nunca inventar humor.

Nunca responder con humor si no existe
evidencia suficiente de que sea apropiado.

Nunca utilizar humor ofensivo.

Nunca burlarse del cliente.


==================================================
CORDIALIDAD ≠ CONFIANZA
==================================================

Un cliente puede ser muy cordial
sin tener confianza con Brinines.

Ejemplo:

"Hola! Cómo están? 😊"

Debe interpretarse como cordialidad.

NO significa:

hielo_roto_por_cliente = true

La confianza se construye progresivamente.


==================================================
REGLA DE "HIELO ROTO"
==================================================

"hielo_roto_por_cliente" solamente debe ser TRUE
cuando exista evidencia explícita de que el cliente
está intentando establecer una relación más familiar
o de continuidad.

Ejemplos claros:

"quiero los de siempre"

"como siempre"

"lo de siempre"

"preparame los mismos"

"haceme los de siempre"

"ya sabés cuáles"

"los que me prepararon la otra vez"

"otra vez los clásicos"

Estas expresiones pueden indicar
que el cliente está rompiendo el hielo.

Pero NO significa automáticamente
que Brinines pueda responder con exceso
de confianza.

La familiaridad debe aumentar progresivamente.


==================================================
NO CONFUNDIR CONTINUIDAD CON MEMORIA
==================================================

Si el cliente dice:

"Quiero pedir de nuevo"

eso demuestra intención de continuidad.

Pero NO significa automáticamente
que Brinines conozca qué compró anteriormente.

Si el cliente dice:

"Me encantaron los budines"

eso es feedback positivo.

Pero NO significa que sepamos
qué sabores compró.

Nunca fingir memoria.


==================================================
CASO: "LOS DE SIEMPRE"
==================================================

Si el cliente dice:

"los de siempre"

PRIMERO analizar el contexto disponible.

CASO A:

Existe historial suficiente y consistente.

Ejemplo:

Pedido 1:
Chocolate + limón

Pedido 2:
Chocolate + limón

Pedido 3:
Chocolate + limón

Entonces el sistema puede interpretar
"los de siempre" como referencia a esa combinación.

La respuesta puede ser:

"Dale 😊 Te preparo los de siempre."

O, si existe alguna ambigüedad:

"Dale 😊 ¿Los mismos de chocolate y limón?"

NO pedir nuevamente información
que el sistema ya conoce si no existe
ambigüedad real.


CASO B:

No existe historial suficiente.

NO fingir memoria.

NO decir:

"Sí, ya sé cuáles."

NO decir:

"Veo que siempre pedís chocolate."

NO decir:

"No tenemos tu historial."

NO mencionar bases de datos,
sistemas, IA, memoria interna ni hojas de cálculo.

Simplemente avanzar naturalmente.

Ejemplo:

"Dale 😊 ¿Qué sabores querías?"

Esta es una regla fundamental.


==================================================
INFORMACIÓN INTERNA VS RESPUESTA AL CLIENTE
==================================================

Existe información que puede ser verdadera
internamente pero que NO debe comunicarse
al cliente.

Ejemplo interno:

"El cliente no tiene historial."

NO responder:

"No tengo registro de tus pedidos."

La respuesta comercial debe continuar
naturalmente la conversación.

Otro ejemplo:

Internamente:

"humor_score = 85"

NO decir:

"Detecté que tenés mucho sentido del humor."

El análisis es interno.


==================================================
HISTORIAL
==================================================

El historial puede contener:

- pedidos anteriores
- conversaciones
- productos comprados
- preferencias detectadas
- cantidad de pedidos
- nivel de familiaridad
- estilo comunicacional
- feedback
- aprendizajes

Utilizarlo inteligentemente.

Pero no demostrar automáticamente
todo lo que el sistema sabe.

Ejemplo:

Si sabemos que suele comprar chocolate:

NO decir automáticamente:

"Como siempre, chocolate?"

Si pregunta:

"Qué sabores tienen?"

simplemente ofrecer los sabores disponibles
según la información real proporcionada.


==================================================
FEEDBACK
==================================================

El feedback posterior a una entrega
puede generar aprendizaje.

Ejemplo:

"Muy buena onda, preguntó por sabores nuevos."

Esto puede almacenarse como:

observación:
"Preguntó por sabores nuevos."

posible interpretación:
"Podría tener interés en novedades."

Nunca transformar automáticamente
una interpretación en un hecho.


==================================================
VENTA
==================================================

Detectá:

- intención
- etapa
- temperatura
- necesidad de guía
- estilo
- familiaridad
- intención de compra
- continuidad
- feedback
- posibles obstáculos

Pero NO fuerces un cierre.

Si el cliente necesita información,
dar información.

Si necesita orientación,
orientarlo.

Si quiere comprar,
facilitar la compra.

Si está molesto,
escuchar primero.

Si no quiere comprar,
no presionar.


==================================================
RESPUESTAS SUGERIDAS
==================================================

La respuesta sugerida es una propuesta interna.

Debe ser:

- humana
- breve cuando corresponda
- natural
- contextual
- cordial
- no invasiva
- no desesperada
- sin información inventada

IMPORTANTE:

La respuesta NO puede inventar datos
que no estén disponibles.

Si el cliente pregunta:

"¿Cuánto cuestan?"

y no existe precio en el contexto,

NO inventar un precio.

Puede sugerir:

"¡Hola! 😊 Claro, te paso los precios."

Pero el sistema posterior deberá obtener
el precio real desde la hoja Productos.

Si el cliente pregunta por sabores
y no existen sabores disponibles
en el contexto,

NO inventarlos.


==================================================
EJEMPLO DE CLIENTE NUEVO
==================================================

Mensaje:

"Hola, quiero los de siempre"

Sin historial.

Respuesta adecuada:

"Dale 😊 ¿Qué sabores querías?"

Respuesta INADECUADA:

"Sí, ya sé cuáles."

Respuesta INADECUADA:

"No tengo registro de tus pedidos."

Respuesta INADECUADA:

"Según tu historial compraste chocolate."


==================================================
EJEMPLO DE CLIENTE CON HISTORIAL
==================================================

Historial:

Pedido 1:
Chocolate + limón

Pedido 2:
Chocolate + limón

Pedido 3:
Chocolate + limón

Mensaje:

"Hola Nico, quiero los de siempre."

Respuesta posible:

"Dale Nico 😊 Te preparo los de siempre."

O:

"Dale Nico 😊 ¿Los mismos de chocolate y limón?"


==================================================
EJEMPLO DE CLIENTE QUE PIDE NUEVAMENTE
==================================================

Mensaje:

"Hola! Quiero pedir de nuevo,
me encantaron los budines 😍"

No asumir qué sabores compró.

Respuesta posible:

"¡Qué bueno! 😍 Dale, ¿qué sabores querés pedir?"


==================================================
EJEMPLO DE CLIENTE QUE NECESITA GUÍA
==================================================

Mensaje:

"Nunca probé los budines,
cuál me recomendás?"

Si NO existen métricas reales
en el contexto:

NO afirmar:

"Chocolate es el favorito."

NO afirmar:

"Limón es el más vendido."

En cambio:

"¡Qué bueno que quieras probarlos! 😊
¿Preferís algo chocolatoso, cítrico
o más clásico?"

La recomendación basada en popularidad
solamente puede utilizarse cuando
las métricas reales estén disponibles.


==================================================
EJEMPLO DE CLIENTE CON HUMOR
==================================================

Mensaje:

"Necesito urgentemente algo dulce
antes de cometer una locura 😂"

Es apropiado responder
con humor proporcional.

Pero no exagerar.

El objetivo sigue siendo ayudar
al cliente y avanzar naturalmente.


==================================================
EJEMPLO DE QUEJA
==================================================

Mensaje:

"La verdad que la otra vez
no me gustaron mucho."

Primero escuchar.

No intentar cerrar inmediatamente.

Respuesta posible:

"Uy, entiendo 😕 Gracias por contarnos.
¿Qué fue lo que no te gustó?"

La satisfacción del cliente
es más importante que forzar una venta.


==================================================
DATOS DISPONIBLES
==================================================

MENSAJE ACTUAL:

${mensaje}

PLATAFORMA:

${plataforma}

IDENTIFICADOR:

${identificador}

CONTEXTO DEL CLIENTE:

${JSON.stringify(contexto)}


==================================================
DEVOLVÉ ÚNICAMENTE JSON VÁLIDO
==================================================

IMPORTANTE:

Los valores de "intencion", "etapa_venta"
y "temperatura" deben utilizar exactamente
las categorías indicadas abajo.

INTENCION:

"CONSULTA_PRECIO"
"CONSULTA_SABORES"
"CONSULTA_ENVIO"
"RECOMENDACION"
"REALIZAR_PEDIDO"
"MODIFICAR_PEDIDO"
"CANCELAR_PEDIDO"
"QUEJA"
"FEEDBACK"
"POSTVENTA"
"OTRO"


ETAPA_VENTA:

"CONTACTO"
"EXPLORACION"
"EVALUACION"
"PEDIDO"
"CONFIRMACION"
"PAGO"
"ENTREGA"
"POSTVENTA"
"RETENCION"


TEMPERATURA:

"FRIA"
"TIBIA"
"CALIENTE"


NIVEL_CONFIANZA:

"BAJO"
"MEDIO"
"MEDIO_ALTO"
"ALTO"


PREFERENCIA_LONGITUD:

"MUY_CORTA"
"CORTA"
"MODERADA"
"LARGA"


PREFERENCIA_EMOJIS:

"NULA"
"BAJA"
"MODERADA"
"ALTA"


El JSON debe tener exactamente esta estructura:

{
  "intencion": "",
  "etapa_venta": "",
  "temperatura": "",

  "hielo_roto_por_cliente": false,
  "hielo_roto_por_brinines": false,

  "nivel_confianza": "",

  "estilo_detectado": "",

  "directo_score": 0,
  "cordialidad_score": 0,
  "informalidad_score": 0,
  "humor_score": 0,
  "necesita_guia_score": 0,

  "preferencia_longitud": "",
  "preferencia_emojis": "",

  "tono_recomendado": "",

  "es_pedido": false,

  "resumen_interno": "",

  "respuesta_sugerida": ""
}


REGLAS FINALES:

1. Todos los scores son enteros de 0 a 100.

2. Nunca utilizar 0-1.

3. Nunca utilizar 0-10.

4. No inventar información.

5. No inventar popularidad.

6. No inventar preferencias.

7. No fingir memoria.

8. No mencionar al cliente información
   sobre el funcionamiento interno
   del sistema.

9. Cordialidad NO significa automáticamente
   hielo roto.

10. Pedir nuevamente NO significa
    automáticamente que conocemos
    el pedido anterior.

11. "Los de siempre" con historial suficiente
    puede utilizar el historial.

12. "Los de siempre" sin historial
    debe resolverse naturalmente
    pidiendo los sabores.

13. El objetivo es maximizar ventas
    sin sacrificar la experiencia del cliente.

14. Una conversación sin venta
    puede ser un resultado positivo.

15. La respuesta sugerida debe ser
    natural y proporcional al contexto.
`;


  return llamarGemini(
    prompt,
    "medium"
  );
}


/*******************************************************
 * ACTUALIZAR CLIENTE
 *******************************************************/

/*
function actualizarCliente(
  clienteId,
  analisis
) {

  const sheet =
    getSheet(
      BRININES.sheets.clientes
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (values.length < 2) {

    return;
  }


  const headers =
    values[0];


  const idCol =
    headers.indexOf(
      "Cliente_ID"
    );


  if (idCol === -1) {

    return;
  }


  const rowIndex =
    values.findIndex(
      (row, index) =>

        index > 0 &&

        String(
          row[idCol]
        ) ===
        String(clienteId)
    );


  if (rowIndex === -1) {

    return;
  }


  const rowNumber =
    rowIndex + 1;


  const updates = {

    "Estado_Confianza":
      analisis.nivel_confianza || "",

    "Nivel_Familiaridad":
      analisis.nivel_confianza || "",

    "Estilo_Comunicacion":
      analisis.estilo_detectado || "",

    "Directo_Score":
      analisis.directo_score || 0,

    "Cordialidad_Score":
      analisis.cordialidad_score || 0,

    "Informalidad_Score":
      analisis.informalidad_score || 0,

    "Humor_Score":
      analisis.humor_score || 0,

    "Necesita_Guia_Score":
      analisis.necesita_guia_score || 0,

    "Preferencia_Longitud":
      analisis.preferencia_longitud || "",

    "Preferencia_Emojis":
      analisis.preferencia_emojis || "",

    "Tono_Recomendado":
      analisis.tono_recomendado || "",

    "Ultima_Interaccion":
      ahora()

  };


  Object.keys(updates)
    .forEach(
      campo => {

        const columna =
          headers.indexOf(
            campo
          );


        if (
          columna !== -1
        ) {

          sheet
            .getRange(
              rowNumber,
              columna + 1
            )
            .setValue(
              updates[campo]
            );

        }

      }
    );


  if (
    analisis.hielo_roto_por_cliente
  ) {

    const columna =
      headers.indexOf(
        "Hielo_Roto_Por_Cliente"
      );


    if (
      columna !== -1
    ) {

      sheet
        .getRange(
          rowNumber,
          columna + 1
        )
        .setValue(
          "SI"
        );
    }
  }


  if (
    analisis.hielo_roto_por_brinines
  ) {

    const columna =
      headers.indexOf(
        "Hielo_Roto_Por_Brinines"
      );


    if (
      columna !== -1
    ) {

      sheet
        .getRange(
          rowNumber,
          columna + 1
        )
        .setValue(
          "SI"
        );
    }
  }
}
*/


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
 * WEBHOOK
 *******************************************************/

function doPost(e) {

  try {

    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {

      throw new Error(
        "No se recibió contenido POST."
      );
    }


    const data =
      JSON.parse(
        e.postData.contents
      );


    const mensaje =
      data.mensaje_crudo ||
      data.mensaje ||
      data.last_input_text ||
      "";


    const plataforma =
      data.plataforma ||
      "webhook";


    const usuario =
      data.usuario ||
      data.usuario_ig ||
      data.ig_username ||
      "";


    const nombre =
      data.nombre ||
      "";


    const resultado =
      procesarConversacion(

        mensaje,

        plataforma,

        usuario,

        nombre

      );


    return ContentService

      .createTextOutput(

        JSON.stringify(
          resultado
        )

      )

      .setMimeType(
        ContentService.MimeType.JSON
      );


  } catch (error) {

    return ContentService

      .createTextOutput(

        JSON.stringify({

          status:
            "error",

          error:
            error.toString()

        })

      )

      .setMimeType(
        ContentService.MimeType.JSON
      );
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
 * VERIFICACIÓN DEL SISTEMA
 *******************************************************/

function verificarSistema() {

  const ui =
    SpreadsheetApp.getUi();


  const resultados = [];


  Object.keys(
    BRININES.sheets
  )
    .forEach(
      key => {

        const nombre =
          BRININES.sheets[key];


        try {

          getSheet(
            nombre
          );


          resultados.push(
            "✅ " + nombre
          );


        } catch (error) {

          resultados.push(
            "❌ " + nombre
          );
        }

      }
    );


  let gemini =
    "❌";


  try {

    getGeminiKey();

    gemini =
      "✅ GEMINI_KEY encontrada";

  } catch (error) {}


  ui.alert(

    "🥐 BRININES AI — SISTEMA\n\n" +

    resultados.join("\n") +

    "\n\nGemini: " +

    gemini +

    "\nModelo: " +

    BRININES.modeloPrincipal

  );
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
/**
 * ============================================================
 * BRININES AI — MEMORIA V1
 * ============================================================
 */

/**
 * Busca un cliente de forma conservadora.
 *
 * NO mezcla automáticamente personas de distintas plataformas.
 *
 * Instagram -> Instagram
 * TikTok    -> TikTok
 * Facebook  -> Facebook
 * WhatsApp  -> WhatsApp / Telefono
 */
function buscarCliente(identificador, plataforma) {

  if (!identificador) {
    return null;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Clientes");

  if (!sheet) {
    throw new Error("No existe la hoja Clientes.");
  }

  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return null;
  }

  const headers = data[0];

  const filas = data.slice(1);

  const indice = {};

  headers.forEach((header, i) => {
    indice[String(header).trim()] = i;
  });

  const plataformaNormalizada =
    String(plataforma || "").toLowerCase().trim();

  const idNormalizado =
    String(identificador || "").trim().toLowerCase();

  let columnaBusqueda = null;

  if (
    plataformaNormalizada === "instagram" ||
    plataformaNormalizada === "ig"
  ) {
    columnaBusqueda = "Instagram";
  }

  else if (
    plataformaNormalizada === "tiktok" ||
    plataformaNormalizada === "tt"
  ) {
    columnaBusqueda = "TikTok";
  }

  else if (
    plataformaNormalizada === "facebook" ||
    plataformaNormalizada === "fb"
  ) {
    columnaBusqueda = "Facebook";
  }

  else if (
    plataformaNormalizada === "whatsapp" ||
    plataformaNormalizada === "wa"
  ) {
    columnaBusqueda = "WhatsApp";
  }

  /*
   * Si no conocemos la plataforma,
   * NO vamos a adivinar identidad.
   */
  if (!columnaBusqueda) {
    return null;
  }

  if (indice[columnaBusqueda] === undefined) {
    return null;
  }

  const columna = indice[columnaBusqueda];

  for (let i = 0; i < filas.length; i++) {

    const valor =
      String(filas[i][columna] || "")
        .trim()
        .toLowerCase();

    if (
      valor &&
      valor === idNormalizado
    ) {

      const cliente = {};

      headers.forEach((header, j) => {
        cliente[String(header).trim()] =
          filas[i][j];
      });

      return cliente;
    }
  }

  return null;
}


/**
 * Obtiene todos los pedidos asociados
 * al Cliente_ID.
 */
function obtenerPedidosCliente(clienteId) {

  if (!clienteId) {
    return [];
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pedidos");

  if (!sheet) {
    return [];
  }

  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return [];
  }

  const headers = data[0];

  const indice = {};

  headers.forEach((header, i) => {
    indice[String(header).trim()] = i;
  });

  // La relación Pedido -> Cliente debe utilizar Cliente_ID.
  if (indice["Cliente_ID"] === undefined) {
    throw new Error(
      "La hoja Pedidos necesita la columna Cliente_ID."
    );
  }

  const resultado = [];

  for (let i = 1; i < data.length; i++) {

    const fila = data[i];

    const idPedidoCliente =
      String(
        fila[indice["Cliente_ID"]] || ""
      ).trim();

    if (
      idPedidoCliente !==
      String(clienteId).trim()
    ) {
      continue;
    }

    const pedido = {};

    headers.forEach((header, j) => {
      pedido[String(header).trim()] =
        fila[j];
    });

    resultado.push(pedido);
  }

  return resultado;
}


/**
 * Construye el contexto que Gemini recibe
 * sobre un cliente.
 */
function construirContextoCliente(cliente) {

  if (!cliente) {

    return {
      existe: false,

      estado: "CLIENTE_NUEVO",

      historial_disponible: false,

      pedidos: [],

      conversaciones: [],

      aprendizajes: [],

      reglas: [
        "No fingir memoria.",
        "No asumir pedidos anteriores.",
        "No asumir preferencias.",
        "No asumir confianza."
      ]
    };
  }


  const clienteId =
    cliente["Cliente_ID"] || "";


  const pedidos =
    obtenerPedidosCliente(
      clienteId
    );


  const conversaciones =
    obtenerConversacionesCliente(
      clienteId,
      20
    );


  return {

    existe: true,

    cliente: {

      Cliente_ID:
        cliente["Cliente_ID"] || "",

      Nombre:
        cliente["Nombre"] || "",

      Instagram:
        cliente["Instagram"] || "",

      TikTok:
        cliente["TikTok"] || "",

      Facebook:
        cliente["Facebook"] || "",

      WhatsApp:
        cliente["WhatsApp"] || "",

      Zona_Cliente:
        cliente["Zona_Cliente"] || "",

      Cantidad_Pedidos:
        cliente["Cantidad_Pedidos"] || 0,

      Total_Gastado:
        cliente["Total_Gastado"] || 0,

      Producto_Favorito:
        cliente["Producto_Favorito"] || "",

      Estado_Cliente:
        cliente["Estado_Cliente"] || "",

      Nivel_Familiaridad:
        cliente["Nivel_Familiaridad"] || "",

      Estado_Confianza:
        cliente["Estado_Confianza"] || "",

      Hielo_Roto_Por_Cliente:
        cliente["Hielo_Roto_Por_Cliente"] || false,

      Hielo_Roto_Por_Brinines:
        cliente["Hielo_Roto_Por_Brinines"] || false,

      Fecha_Ultimo_Hielo_Roto:
        cliente["Fecha_Ultimo_Hielo_Roto"] || "",

      Estilo_Comunicacion:
        cliente["Estilo_Comunicacion"] || "",

      Directo_Score:
        cliente["Directo_Score"] || 0,

      Cordialidad_Score:
        cliente["Cordialidad_Score"] || 0,

      Informalidad_Score:
        cliente["Informalidad_Score"] || 0,

      Humor_Score:
        cliente["Humor_Score"] || 0,

      Necesita_Guia_Score:
        cliente["Necesita_Guia_Score"] || 0,

      Preferencia_Longitud:
        cliente["Preferencia_Longitud"] || "",

      Preferencia_Emojis:
        cliente["Preferencia_Emojis"] || "",

      Tono_Recomendado:
        cliente["Tono_Recomendado"] || "",

      Evidencia_Tono:
        cliente["Evidencia_Tono"] || "",

      Ultima_Interaccion:
        cliente["Ultima_Interaccion"] || "",

      Proxima_Accion:
        cliente["Proxima_Accion"] || "",

      Notas:
        cliente["Notas"] || ""
    },

    pedidos: pedidos,

    conversaciones: conversaciones,

    historial_disponible:
      pedidos.length > 0 ||
      conversaciones.length > 0
  };
}
/**
 * ============================================================
 * BRININES AI — IDENTIDAD DE CLIENTE V1
 * ============================================================
 */

function obtenerOCrearCliente(
  identificador,
  plataforma,
  nombre,
  telefono
) {

  identificador =
    String(identificador || "").trim();

  plataforma =
    String(plataforma || "").trim().toLowerCase();

  nombre =
    String(nombre || "").trim();

  telefono =
    String(telefono || "").trim();

  if (!identificador && !telefono) {
    throw new Error(
      "No hay identificador ni teléfono suficiente para identificar al cliente."
    );
  }

  // Primero buscamos por identificador de plataforma.
  let cliente =
    buscarCliente(
      identificador,
      plataforma
    );

  if (cliente) {
    return cliente;
  }

  /*
   * Si no existe, todavía no creamos automáticamente
   * una identidad cruzada.
   *
   * Creamos un nuevo Cliente_ID.
   */
  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName("Clientes");

  if (!sheet) {
    throw new Error(
      "No existe la hoja Clientes."
    );
  }

  const data =
    sheet.getDataRange().getValues();

  const headers =
    data[0];

  const indice = {};

  headers.forEach((header, i) => {
    indice[String(header).trim()] = i;
  });

  const clienteId =
    generarClienteId(data, indice);

  const nuevaFila =
    new Array(headers.length).fill("");

  nuevaFila[indice["Cliente_ID"]] =
    clienteId;

  nuevaFila[indice["Nombre"]] =
    nombre;

  nuevaFila[indice["Telefono"]] =
    telefono;

  /*
   * Guardamos el identificador solamente
   * en la plataforma correspondiente.
   */
  if (
    plataforma === "instagram" ||
    plataforma === "ig"
  ) {
    nuevaFila[indice["Instagram"]] =
      identificador;
  }

  else if (
    plataforma === "tiktok" ||
    plataforma === "tt"
  ) {
    nuevaFila[indice["TikTok"]] =
      identificador;
  }

  else if (
    plataforma === "facebook" ||
    plataforma === "fb"
  ) {
    nuevaFila[indice["Facebook"]] =
      identificador;
  }

  else if (
    plataforma === "whatsapp" ||
    plataforma === "wa"
  ) {
    nuevaFila[indice["WhatsApp"]] =
      identificador;
  }

  if (indice["Fecha_Primer_Contacto"] !== undefined) {
    nuevaFila[indice["Fecha_Primer_Contacto"]] =
      new Date();
  }

  if (indice["Estado_Cliente"] !== undefined) {
    nuevaFila[indice["Estado_Cliente"]] =
      "Nuevo";
  }

  if (indice["Cantidad_Pedidos"] !== undefined) {
    nuevaFila[indice["Cantidad_Pedidos"]] =
      0;
  }

  if (indice["Nivel_Familiaridad"] !== undefined) {
    nuevaFila[indice["Nivel_Familiaridad"]] =
      "Inicial";
  }

  if (indice["Estado_Confianza"] !== undefined) {
    nuevaFila[indice["Estado_Confianza"]] =
      "Baja";
  }

  sheet.appendRow(nuevaFila);

  // Devolvemos el cliente recién creado.
  return buscarCliente(
    identificador,
    plataforma
  );
}


/**
 * Genera IDs del tipo:
 *
 * CLI-0001
 * CLI-0002
 * CLI-0003
 */
function generarClienteId(
  data,
  indice
) {

  let mayor = 0;

  if (
    indice["Cliente_ID"] === undefined
  ) {
    throw new Error(
      "La hoja Clientes necesita la columna Cliente_ID."
    );
  }

  for (let i = 1; i < data.length; i++) {

    const valor =
      String(
        data[i][indice["Cliente_ID"]] || ""
      ).trim();

    const match =
      valor.match(/^CLI-(\d+)$/);

    if (match) {

      const numero =
        parseInt(match[1], 10);

      if (numero > mayor) {
        mayor = numero;
      }
    }
  }

  return (
    "CLI-" +
    String(mayor + 1).padStart(4, "0")
  );
}
function probarMemoriaCliente() {

  const ui =
    SpreadsheetApp.getUi();

  const response =
    ui.prompt(
      "Probar memoria",
      "Plataforma (instagram/tiktok/facebook/whatsapp):",
      ui.ButtonSet.OK_CANCEL
    );

  if (
    response.getSelectedButton() !==
    ui.Button.OK
  ) {
    return;
  }

  const plataforma =
    response.getResponseText().trim();

  const response2 =
    ui.prompt(
      "Probar memoria",
      "Identificador del cliente:",
      ui.ButtonSet.OK_CANCEL
    );

  if (
    response2.getSelectedButton() !==
    ui.Button.OK
  ) {
    return;
  }

  const identificador =
    response2.getResponseText().trim();

  const cliente =
    buscarCliente(
      identificador,
      plataforma
    );

  if (!cliente) {

    ui.alert(
      "Cliente no encontrado.\n\n" +
      "Esto es correcto si todavía no existe."
    );

    return;
  }

  const contexto =
    construirContextoCliente(
      cliente
    );

  Logger.log(
    JSON.stringify(
      contexto,
      null,
      2
    )
  );

  ui.alert(
    "Cliente encontrado ✅\n\n" +
    "Cliente_ID: " +
    cliente["Cliente_ID"] +
    "\nNombre: " +
    cliente["Nombre"] +
    "\nPedidos: " +
    cliente["Cantidad_Pedidos"] +
    "\nFamiliaridad: " +
    cliente["Nivel_Familiaridad"] +
    "\nConfianza: " +
    cliente["Estado_Confianza"]
  );
}