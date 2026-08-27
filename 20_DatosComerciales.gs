/*******************************************************
 * DATA ACCESS LAYER - DATOS COMERCIALES
 *******************************************************/

const CACHE_KEY_COMERCIAL = "contexto_comercial_v1";
const CACHE_TTL_SECONDS = 300;

function obtenerContextoComercial() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY_COMERCIAL);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn("Cache corrupto, regenerando contexto comercial");
    }
  }

  const contexto = {
    productos: leerProductosDisponibles(),
    envios: leerEnviosDisponibles(),
    pagos: leerPagosDisponibles(),
    promociones: leerPromocionesVigentes(),
    config: leerConfigComercial(),
    _timestamp: Date.now()
  };

  cache.put(CACHE_KEY_COMERCIAL, JSON.stringify(contexto), CACHE_TTL_SECONDS);
  return contexto;
}

function invalidarCacheComercial() {
  CacheService.getScriptCache().remove(CACHE_KEY_COMERCIAL);
}

function leerProductosDisponibles() {
  try {
    const rows = leerTabla(BRININES.sheets.productos);
    if (!rows || rows.length === 0) return [];

    return rows
      .filter(r => {
        const disp = r.Disponible;
        return disp === true || disp === "TRUE" || disp === "true" || disp === "1" || disp === 1;
      })
      .map(r => ({
        id: String(r.Producto_ID || "").trim(),
        sabor: String(r.Sabor || "").trim(),
        precio: toNumber(r.Precio_Unitario, 0),
        costo: toNumber(r.Costo_Unitario, null),
        disponible: true,
        stock: toNumber(r.Stock, -1),
        categoria: String(r.Categoria || "").trim(),
        descripcion: String(r.Descripcion || "").trim(),
        orden: toNumber(r.Orden_Menu, 999)
      }))
      .filter(p => p.id && p.sabor);
  } catch (e) {
    logSistema("LEER_PRODUCTOS", "ERROR", "", e.toString(), "DATA_ACCESS");
    throw new Error("Error leyendo Productos: " + e.toString());
  }
}

function leerEnviosDisponibles() {
  try {
    const rows = leerTabla(BRININES.sheets.envios);
    if (!rows || rows.length === 0) return [];

    return rows
      .filter(r => {
        const disp = r.Disponible;
        return disp === true || disp === "TRUE" || disp === "true" || disp === "1" || disp === 1;
      })
      .map(r => ({
        id: String(r.Envio_ID || "").trim(),
        zona: String(r.Zona || "").trim(),
        costo: toNumber(r.Costo, 0),
        tiempo: String(r.Tiempo_Estimado || "").trim(),
        minimoGratis: toNumber(r.Minimo_Gratis, null),
        condiciones: String(r.Condiciones || "").trim()
      }))
      .filter(e => e.id && e.zona);
  } catch (e) {
    logSistema("LEER_ENVIOS", "ERROR", "", e.toString(), "DATA_ACCESS");
    throw new Error("Error leyendo Envios: " + e.toString());
  }
}

function leerPagosDisponibles() {
  try {
    const rows = leerTabla(BRININES.sheets.pagos);
    if (!rows || rows.length === 0) return [];

    return rows
      .filter(r => {
        const disp = r.Disponible;
        return disp === true || disp === "TRUE" || disp === "true" || disp === "1" || disp === 1;
      })
      .map(r => ({
        id: String(r.Pago_ID || "").trim(),
        medio: String(r.Medio || "").trim(),
        comision: toNumber(r.Comision_Pct, 0),
        instrucciones: String(r.Instrucciones || "").trim(),
        orden: toNumber(r.Orden_Menu, 999)
      }))
      .filter(p => p.id && p.medio);
  } catch (e) {
    logSistema("LEER_PAGOS", "ERROR", "", e.toString(), "DATA_ACCESS");
    throw new Error("Error leyendo Pagos: " + e.toString());
  }
}

function leerPromocionesVigentes() {
  try {
    const rows = leerTabla(BRININES.sheets.promociones);
    if (!rows || rows.length === 0) return [];

    const ahora = new Date();
    return rows
      .filter(r => {
        const act = r.Activa;
        if (act !== true && act !== "TRUE" && act !== "true" && act !== "1" && act !== 1) return false;
        if (r.Fecha_Inicio && new Date(r.Fecha_Inicio) > ahora) return false;
        if (r.Fecha_Fin && new Date(r.Fecha_Fin) < ahora) return false;
        return true;
      })
      .map(r => {
        let condicion = {};
        try {
          condicion = r.Condicion_JSON ? JSON.parse(r.Condicion_JSON) : {};
        } catch (e) {
          console.warn("Condicion_JSON inválido en promo " + r.Promo_ID + ": " + e.toString());
        }
        return {
          id: String(r.Promo_ID || "").trim(),
          nombre: String(r.Nombre || "").trim(),
          tipo: String(r.Tipo || "").trim(),
          valor: toNumber(r.Valor, 0),
          condicion: condicion
        };
      })
      .filter(p => p.id && p.nombre && p.tipo);
  } catch (e) {
    logSistema("LEER_PROMOCIONES", "ERROR", "", e.toString(), "DATA_ACCESS");
    throw new Error("Error leyendo Promociones: " + e.toString());
  }
}

function leerConfigComercial() {
  try {
    const rows = leerTabla(BRININES.sheets.config);
    if (!rows || rows.length === 0) return {};

    const obj = {};
    rows.forEach(r => {
      const clave = String(r.Clave || "").trim();
      if (!clave) return;
      let val = r.Valor;
      const tipo = String(r.Tipo || "").trim().toLowerCase();
      if (tipo === "boolean") {
        val = val === true || val === "true" || val === "TRUE" || val === "1" || val === 1;
      } else if (tipo === "number") {
        val = toNumber(val, 0);
      } else {
        val = String(val || "").trim();
      }
      obj[clave] = val;
    });
    return obj;
  } catch (e) {
    logSistema("LEER_CONFIG", "ERROR", "", e.toString(), "DATA_ACCESS");
    throw new Error("Error leyendo Config: " + e.toString());
  }
}

function toNumber(val, defaultVal) {
  if (val === null || val === undefined || val === "") return defaultVal;
  const n = Number(val);
  return isNaN(n) ? defaultVal : n;
}

function setupMockDataComercial() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();

  const config = ss.getSheetByName("Config") || ss.insertSheet("Config");
  config.clear();
  config.getRange(1, 1, 1, 3).setValues([["Clave", "Valor", "Tipo"]]);
  [
    ["retiro_disponible", "true", "boolean"],
    ["horario_atencion", "Lun-Sab 9:00-21:00 / Dom 10:00-14:00", "string"],
    ["telefono_local", "3815-123456", "string"],
    ["direccion_local", "Av. Alem 450, S.M. de Tucuman", "string"],
    ["tiempo_preparacion_min", "30", "number"],
    ["_MOCK_DATA", "true", "boolean"]
  ].forEach(r => config.appendRow(r));

  const prod = ss.getSheetByName("Productos") || ss.insertSheet("Productos");
  prod.clear();
  prod.getRange(1, 1, 1, 10).setValues([[
    "Producto_ID", "Sabor", "Precio_Unitario", "Costo_Unitario",
    "Disponible", "Stock", "Categoria", "Descripcion", "Orden_Menu", "Fecha_Actualizacion"
  ]]);
  [
    ["PROD-CHO", "Chocolate", 4500, 2200, true, 50, "Clasicos", "MOCK: Budin chocolate 70%", 1, now],
    ["PROD-LIM", "Limon", 4200, 2000, true, 30, "Clasicos", "MOCK: Budin limon glaseado", 2, now],
    ["PROD-MAR", "Marroqui", 4800, 2500, true, 20, "Clasicos", "MOCK: Choco, nueces, pasas", 3, now],
    ["PROD-NAR", "Naranja", 4300, 2100, true, 25, "Clasicos", "MOCK: Naranja chips choco", 4, now],
    ["PROD-VAI", "Vainilla", 4000, 1900, true, 40, "Clasicos", "MOCK: Vainilla clasico", 5, now],
    ["PROD-CHC", "Chocochip", 4700, 2400, true, 15, "Especiales", "MOCK: Chips semi-amargos", 6, now],
    ["PROD-FRU", "Frutos Rojos", 5000, 2800, true, 10, "Especiales", "MOCK: Arandanos, frambuesas", 7, now],
    ["PROD-DDL", "Dulce de Leche", 4600, 2300, true, 35, "Clasicos", "MOCK: Dulce leche repostero", 8, now],
    ["PROD-CNA", "Choco-Naranja", 4900, 2600, true, 12, "Estacionales", "MOCK: Edicion limitada", 9, now],
    ["PROD-SAZ", "Sin Azucar", 5200, 3000, true, 8, "Especiales", "MOCK: Stevia, apto diabeticos", 10, now]
  ].forEach(r => prod.appendRow(r));

  const env = ss.getSheetByName("Envios") || ss.insertSheet("Envios");
  env.clear();
  env.getRange(1, 1, 1, 7).setValues([[
    "Envio_ID", "Zona", "Costo", "Disponible", "Tiempo_Estimado", "Minimo_Gratis", "Condiciones"
  ]]);
  [
    ["ENV-CEN", "CENTRO", 800, true, "30-45 min", 6000, "MOCK"],
    ["ENV-FUE", "FUERA_CENTRO", 1500, true, "45-60 min", 8000, "MOCK"],
    ["ENV-TAL", "OTRA_LAS_TALITAS", 2000, true, "60-90 min", 10000, "MOCK"],
    ["ENV-YER", "OTRA_YERBA_BUENA", 1800, false, "", "", "MOCK: Sin cobertura temporal"],
    ["ENV-TAF", "OTRA_TAFI_VIEJO", 2200, true, "90-120 min", 12000, "MOCK"]
  ].forEach(r => env.appendRow(r));

  const pag = ss.getSheetByName("Pagos") || ss.insertSheet("Pagos");
  pag.clear();
  pag.getRange(1, 1, 1, 6).setValues([[
    "Pago_ID", "Medio", "Disponible", "Comision_Pct", "Instrucciones", "Orden_Menu"
  ]]);
  [
    ["PAG-EFE", "EFECTIVO", true, 0, "Pago al recibir", 1],
    ["PAG-TRA", "TRANSFERENCIA", true, 0, "MOCK: Alias pendiente", 2],
    ["PAG-MP", "MERCADOPAGO", false, 3.5, "", 3],
    ["PAG-TAR", "TARJETA", false, 0, "", 4]
  ].forEach(r => pag.appendRow(r));

  const prom = ss.getSheetByName("Promociones") || ss.insertSheet("Promociones");
  prom.clear();
  prom.getRange(1, 1, 1, 8).setValues([[
    "Promo_ID", "Nombre", "Tipo", "Valor", "Condicion_JSON", "Activa", "Fecha_Inicio", "Fecha_Fin"
  ]]);
  [
    ["PROMO-ENV-CEN", "MOCK: Envio Gratis Centro >$6000", "ENVIO_GRATIS", 100,
     '{"zonas":["CENTRO"],"min_total":6000}', true, now, ""],
    ["PROMO-2X1-MAR", "MOCK: Martes 2x1 Clasicos", "2X1", 100,
     '{"dias":["Martes"],"categoria":"Clasicos"}', true, now, ""],
    ["PROMO-SAZ-15", "MOCK: Lanzamiento Sin Azucar 15%", "DESCUENTO_PORCENTUAL", 15,
     '{"productos":["PROD-SAZ"]}', true, now, ""]
  ].forEach(r => prom.appendRow(r));

  const ped = ss.getSheetByName("Pedidos") || ss.insertSheet("Pedidos");
  ped.clear();
  ped.getRange(1, 1, 1, 13).setValues([[
    "Pedido_ID", "Cliente_ID", "Fecha_Hora", "Items_JSON",
    "Subtotal", "Envio_Zona", "Envio_Costo", "Descuento_Promos",
    "Total", "Medio_Pago", "Estado", "Tipo_Entrega", "Notas"
  ]]);

  invalidarCacheComercial();
  SpreadsheetApp.getUi().alert("MOCK DATA COMERCIAL CARGADO (identificado con 'MOCK:')");
}

function test_DataAccessLayer() {
  const ctx = obtenerContextoComercial();
  const tests = [];

  tests.push({ name: "productos count", pass: ctx.productos.length === 10, actual: ctx.productos.length, expected: 10 });
  tests.push({ name: "envios count", pass: ctx.envios.length === 5, actual: ctx.envios.length, expected: 5 });
  tests.push({ name: "pagos activos count", pass: ctx.pagos.filter(p => p.disponible).length === 2, actual: ctx.pagos.filter(p => p.disponible).length, expected: 2 });
  tests.push({ name: "promociones activas count", pass: ctx.promociones.length === 3, actual: ctx.promociones.length, expected: 3 });
  tests.push({ name: "config retiro_disponible boolean", pass: ctx.config.retiro_disponible === true, actual: ctx.config.retiro_disponible, expected: true });
  tests.push({ name: "config tiempo_preparacion_min number", pass: typeof ctx.config.tiempo_preparacion_min === "number", actual: typeof ctx.config.tiempo_preparacion_min, expected: "number" });

  const prodChocolate = ctx.productos.find(p => p.sabor === "Chocolate");
  tests.push({ name: "producto chocolate precio", pass: prodChocolate && prodChocolate.precio === 4500, actual: prodChocolate?.precio, expected: 4500 });
  tests.push({ name: "producto chocolate stock", pass: prodChocolate && prodChocolate.stock === 50, actual: prodChocolate?.stock, expected: 50 });

  const envioCentro = ctx.envios.find(e => e.zona === "CENTRO");
  tests.push({ name: "envio centro costo", pass: envioCentro && envioCentro.costo === 800, actual: envioCentro?.costo, expected: 800 });
  tests.push({ name: "envio centro minimoGratis", pass: envioCentro && envioCentro.minimoGratis === 6000, actual: envioCentro?.minimoGratis, expected: 6000 });

  const envioTalitas = ctx.envios.find(e => e.zona === "OTRA_LAS_TALITAS");
  tests.push({ name: "envio otra_las_talitas existe", pass: !!envioTalitas, actual: !!envioTalitas, expected: true });

  const pagoEfectivo = ctx.pagos.find(p => p.medio === "EFECTIVO");
  tests.push({ name: "pago efectivo disponible", pass: pagoEfectivo && pagoEfectivo.disponible === true, actual: pagoEfectivo?.disponible, expected: true });

  const pagoTransferencia = ctx.pagos.find(p => p.medio === "TRANSFERENCIA");
  tests.push({ name: "pago transferencia disponible", pass: pagoTransferencia && pagoTransferencia.disponible === true, actual: pagoTransferencia?.disponible, expected: true });

  const pagoMP = ctx.pagos.find(p => p.medio === "MERCADOPAGO");
  tests.push({ name: "pago mercadopago inactivo", pass: pagoMP && pagoMP.disponible === false, actual: pagoMP?.disponible, expected: false });

  const promoEnvio = ctx.promociones.find(p => p.id === "PROMO-ENV-CEN");
  tests.push({ name: "promo envio gratis condicion", pass: promoEnvio && promoEnvio.condicion.zonas?.includes("CENTRO"), actual: promoEnvio?.condicion, expected: "zonas includes CENTRO" });

  tests.push({ name: "cache key existe en contexto", pass: typeof ctx._timestamp === "number", actual: typeof ctx._timestamp, expected: "number" });
  
  const ctx2 = obtenerContextoComercial();
  tests.push({ name: "cache hit - mismo timestamp", pass: ctx2._timestamp === ctx._timestamp, actual: ctx2._timestamp, expected: ctx._timestamp });
  
  invalidarCacheComercial();
  const ctx3 = obtenerContextoComercial();
  tests.push({ name: "cache invalidado - nuevo timestamp", pass: ctx3._timestamp !== ctx._timestamp, actual: ctx3._timestamp, expected: "diferente a " + ctx._timestamp });

  let allPass = true;
  tests.forEach(t => {
    if (!t.pass) {
      allPass = false;
      Logger.log("FAIL: " + t.name + " | expected: " + JSON.stringify(t.expected) + " | actual: " + JSON.stringify(t.actual));
    } else {
      Logger.log("PASS: " + t.name);
    }
  });
  Logger.log("=== DATA ACCESS TESTS: " + (allPass ? "ALL PASS" : "SOME FAILED") + " ===");
  return { allPass, tests };
}