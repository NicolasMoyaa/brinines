/*******************************************************
 * CALCULADORA DE PEDIDOS - REGLAS DE NEGOCIO PURAS
 *******************************************************/

function matchProductos(productosDetectados, catalogo) {
  if (!productosDetectados || !Array.isArray(productosDetectados)) return [];
  if (!catalogo || !Array.isArray(catalogo)) throw new Error("Catalogo invalido: debe ser array");

  return productosDetectados.map((det, idx) => {
    const saborBuscado = String(det?.sabor || "").trim().toLowerCase();
    const cantidad = toInt(det?.cantidad, 0);
    if (!saborBuscado) throw new Error("Producto en posicion " + idx + " sin sabor");
    if (cantidad <= 0) throw new Error("Cantidad invalida para " + saborBuscado + ": " + cantidad);

    const match = catalogo.find(p =>
      String(p.sabor || "").trim().toLowerCase() === saborBuscado
    );
    if (!match) throw new Error("Producto no encontrado en catalogo: " + det.sabor);
    if (!match.disponible) throw new Error("Producto no disponible: " + det.sabor);

    return {
      producto_id: match.id,
      sabor: match.sabor,
      precio: toNumber(match.precio, 0),
      cantidad: cantidad,
      stock_disponible: toNumber(match.stock, -1)
    };
  });
}

function validarStock(items, catalogo) {
  if (!items || !Array.isArray(items)) return { ok: true, faltantes: [] };
  const faltantes = [];
  items.forEach(item => {
    if (item.stock_disponible >= 0 && item.stock_disponible < item.cantidad) {
      faltantes.push(item.sabor + " (stock: " + item.stock_disponible + ", pedido: " + item.cantidad + ")");
    }
  });
  return { ok: faltantes.length === 0, faltantes };
}

function calcularSubtotal(items) {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, i) => sum + toNumber(i.precio, 0) * toInt(i.cantidad, 0), 0);
}

function calcularEnvio(zona, subtotal, envios) {
  if (!envios || !Array.isArray(envios)) throw new Error("Envios invalido: debe ser array");
  const zonaNorm = String(zona || "").trim();
  const envio = envios.find(e => String(e.zona || "").trim() === zonaNorm);
  if (!envio) throw new Error("Zona sin tarifa de envio configurada: " + zonaNorm);

  const costoBase = toNumber(envio.costo, 0);
  const minimoGratis = toNumber(envio.minimoGratis, null);
  const gratis = minimoGratis !== null && subtotal >= minimoGratis;

  return {
    zona: zonaNorm,
    costo: gratis ? 0 : costoBase,
    gratis: gratis,
    tiempo: String(envio.tiempo || "").trim(),
    minimoGratis: minimoGratis
  };
}

function evaluarPromociones(subtotal, items, zona, medioPago, promociones, catalogo) {
  if (!promociones || !Array.isArray(promociones)) return { descuento_total: 0, promos_aplicadas: [] };
  if (!catalogo || !Array.isArray(catalogo)) throw new Error("Catalogo requerido para evaluar promociones");

  let descuentoTotal = 0;
  const aplicadas = [];

  promociones.forEach(promo => {
    const cond = promo.condicion || {};
    let aplica = true;

    if (cond.zonas && Array.isArray(cond.zonas) && !cond.zonas.includes(zona)) aplica = false;
    if (cond.min_total && subtotal < toNumber(cond.min_total, 0)) aplica = false;

    if (cond.dias && Array.isArray(cond.dias)) {
      const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long" });
      if (!cond.dias.includes(hoy)) aplica = false;
    }

    if (cond.categoria) {
      const catBuscada = String(cond.categoria).trim();
      const tieneCategoria = items.some(item => {
        const prod = catalogo.find(p => p.id === item.producto_id);
        return prod && String(prod.categoria || "").trim() === catBuscada;
      });
      if (!tieneCategoria) aplica = false;
    }

    if (cond.productos && Array.isArray(cond.productos)) {
      const tieneProducto = items.some(item => cond.productos.includes(item.producto_id));
      if (!tieneProducto) aplica = false;
    }

    if (cond.medio_pago && String(cond.medio_pago).trim() !== String(medioPago || "").trim()) aplica = false;

    if (aplica) {
      let descuento = 0;
      switch (promo.tipo) {
        case "DESCUENTO_PORCENTUAL":
          descuento = Math.round(subtotal * (toNumber(promo.valor, 0) / 100));
          break;
        case "DESCUENTO_MONTO":
          descuento = Math.min(toNumber(promo.valor, 0), subtotal);
          break;
        case "ENVIO_GRATIS":
          break;
        case "2X1":
          const items2x1 = items.filter(item => {
            const prod = catalogo.find(p => p.id === item.producto_id);
            return prod && (cond.categoria ? String(prod.categoria || "").trim() === String(cond.categoria).trim() : true) &&
                   (cond.productos ? cond.productos.includes(item.producto_id) : true);
          });
          if (items2x1.length > 0) {
            const precios = items2x1.map(i => toNumber(i.precio, 0) * toInt(i.cantidad, 0));
            precios.sort((a, b) => a - b);
            descuento = precios[0];
          }
          break;
        case "PRODUCTO_GRATIS":
          const itemsGratis = items.filter(item => cond.productos?.includes(item.producto_id));
          if (itemsGratis.length > 0) {
            descuento = itemsGratis.reduce((sum, i) => sum + toNumber(i.precio, 0) * toInt(i.cantidad, 0), 0);
          }
          break;
      }

      if (descuento > 0) {
        descuentoTotal += descuento;
        aplicadas.push({ id: promo.id, nombre: promo.nombre, descuento: descuento });
      }
    }
  });

  return { descuento_total: descuentoTotal, promos_aplicadas: aplicadas };
}

function calcularTotal(subtotal, envioCosto, descuentoTotal) {
  return Math.max(0, toNumber(subtotal, 0) + toNumber(envioCosto, 0) - toNumber(descuentoTotal, 0));
}

function calcularPedidoCompleto(analisisGemini, contextoComercial, catalogoProductos) {
  const productosDetectados = analisisGemini?.productos_detectados || [];
  if (productosDetectados.length === 0) throw new Error("No hay productos detectados para calcular pedido");

  const items = matchProductos(productosDetectados, catalogoProductos);

  const stockCheck = validarStock(items, catalogoProductos);
  if (!stockCheck.ok) throw new Error("Stock insuficiente: " + stockCheck.faltantes.join(", "));

  const subtotal = calcularSubtotal(items);

  const zona = String(analisisGemini?.zona_mencionada || "").trim() ||
               String(contextoComercial?.cliente?.zona || "").trim() ||
               "CENTRO";
  const zonaNormalizada = normalizarZonaComercial(zona);

  const envio = calcularEnvio(zonaNormalizada, subtotal, contextoComercial.envios);

  const medioPago = analisisGemini?.medio_pago_mencionado || null;

  const promoResult = evaluarPromociones(subtotal, items, zonaNormalizada, medioPago, contextoComercial.promociones, catalogoProductos);

  const total = calcularTotal(subtotal, envio.costo, promoResult.descuento_total);

  return {
    items: items,
    subtotal: subtotal,
    envio: { zona: envio.zona, costo: envio.costo, gratis: envio.gratis, tiempo: envio.tiempo },
    promociones: promoResult.promos_aplicadas,
    descuento_total: promoResult.descuento_total,
    total: total,
    medio_pago_sugerido: medioPago
  };
}

function toNumber(val, defaultVal) {
  if (val === null || val === undefined || val === "") return defaultVal;
  const n = Number(val);
  return isNaN(n) ? defaultVal : n;
}

function toInt(val, defaultVal) {
  const n = toNumber(val, defaultVal);
  return Math.floor(n);
}

function normalizarZonaComercial(zonaTexto) {
  if (!zonaTexto) return "CENTRO";
  const texto = String(zonaTexto).trim().toUpperCase();
  if (texto.includes("CENTRO") && !texto.includes("FUERA")) return "CENTRO";
  if (texto.includes("FUERA") && texto.includes("CENTRO")) return "FUERA_CENTRO";

  const normalizado = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, "_");

  return "OTRA_" + normalizado;
}

function test_Calculator() {
  const mockCatalogo = [
    { id: "PROD-CHO", sabor: "Chocolate", precio: 4500, stock: 50, disponible: true, categoria: "Clasicos" },
    { id: "PROD-LIM", sabor: "Limon", precio: 4200, stock: 30, disponible: true, categoria: "Clasicos" },
    { id: "PROD-SAZ", sabor: "Sin Azucar", precio: 5200, stock: 8, disponible: true, categoria: "Especiales" }
  ];
  const mockEnvios = [
    { id: "ENV-CEN", zona: "CENTRO", costo: 800, minimoGratis: 6000 },
    { id: "ENV-FUE", zona: "FUERA_CENTRO", costo: 1500, minimoGratis: 8000 },
    { id: "ENV-TAL", zona: "OTRA_LAS_TALITAS", costo: 2000, minimoGratis: 10000 }
  ];
  const mockPromos = [
    { id: "PROMO-1", tipo: "DESCUENTO_PORCENTUAL", valor: 15, condicion: { productos: ["PROD-SAZ"] } },
    { id: "PROMO-2", tipo: "DESCUENTO_MONTO", valor: 500, condicion: { min_total: 10000 } },
    { id: "PROMO-3", tipo: "ENVIO_GRATIS", valor: 100, condicion: { zonas: ["CENTRO"], min_total: 6000 } },
    { id: "PROMO-4", tipo: "2X1", valor: 100, condicion: { categoria: "Clasicos", dias: ["Martes"] } }
  ];

  const tests = [];

  try {
    const items = matchProductos([{ sabor: "Chocolate", cantidad: 3 }, { sabor: "Limon", cantidad: 2 }], mockCatalogo);
    tests.push({ name: "matchProductos correcto", pass: items.length === 2 && items[0].precio === 4500 && items[0].cantidad === 3 && items[1].precio === 4200 && items[1].cantidad === 2 });
  } catch (e) { tests.push({ name: "matchProductos correcto", pass: false, error: e.toString() }); }

  try {
    matchProductos([{ sabor: "Inexistente", cantidad: 1 }], mockCatalogo);
    tests.push({ name: "matchProductos inexistente lanza error", pass: false });
  } catch (e) { tests.push({ name: "matchProductos inexistente lanza error", pass: true }); }

  const itemsStock = [{ sabor: "Chocolate", precio: 4500, cantidad: 10, stock_disponible: 50 }, { sabor: "Limon", precio: 4200, cantidad: 40, stock_disponible: 30 }];
  tests.push({ name: "validarStock ok", pass: validarStock(itemsStock, mockCatalogo).ok === true });
  tests.push({ name: "validarStock insuficiente", pass: validarStock([{ ...itemsStock[1], cantidad: 40 }], mockCatalogo).ok === false });

  const itemsSubtotal = [{ precio: 4500, cantidad: 3 }, { precio: 4200, cantidad: 2 }];
  tests.push({ name: "calcularSubtotal", pass: calcularSubtotal(itemsSubtotal) === 21900 });

  tests.push({ name: "calcularEnvio CENTRO gratis >6000", pass: calcularEnvio("CENTRO", 7000, mockEnvios).costo === 0 && calcularEnvio("CENTRO", 7000, mockEnvios).gratis === true });
  tests.push({ name: "calcularEnvio CENTRO cobra <6000", pass: calcularEnvio("CENTRO", 5000, mockEnvios).costo === 800 && calcularEnvio("CENTRO", 5000, mockEnvios).gratis === false });
  tests.push({ name: "calcularEnvio FUERA_CENTRO", pass: calcularEnvio("FUERA_CENTRO", 5000, mockEnvios).costo === 1500 });
  tests.push({ name: "calcularEnvio OTRA_LAS_TALITAS", pass: calcularEnvio("OTRA_LAS_TALITAS", 5000, mockEnvios).costo === 2000 });

  try { calcularEnvio("ZONA_INEXISTENTE", 5000, mockEnvios); tests.push({ name: "calcularEnvio zona inexistente error", pass: false }); }
  catch (e) { tests.push({ name: "calcularEnvio zona inexistente error", pass: true }); }

  tests.push({ name: "evaluarPromociones DESCUENTO_PORCENTUAL", pass: evaluarPromociones(21900, [{ producto_id: "PROD-SAZ", precio: 5200, cantidad: 1 }], "CENTRO", null, mockPromos, mockCatalogo).descuento_total === 780 });
  tests.push({ name: "evaluarPromociones DESCUENTO_MONTO", pass: evaluarPromociones(15000, itemsSubtotal, "CENTRO", null, mockPromos, mockCatalogo).descuento_total === 500 });
  tests.push({ name: "evaluarPromociones sin promo", pass: evaluarPromociones(5000, itemsSubtotal, "CENTRO", null, [], mockCatalogo).descuento_total === 0 });

  tests.push({ name: "calcularTotal basico", pass: calcularTotal(21900, 800, 0) === 22700 });
  tests.push({ name: "calcularTotal con descuento", pass: calcularTotal(21900, 800, 500) === 22200 });
  tests.push({ name: "calcularTotal no negativo", pass: calcularTotal(100, 0, 500) === 0 });

  try {
    const ctx = { envios: mockEnvios, promociones: mockPromos };
    const analisis = { productos_detectados: [{ sabor: "Chocolate", cantidad: 3 }, { sabor: "Limon", cantidad: 2 }], zona_mencionada: "Las Talitas", medio_pago_mencionado: null };
    const resultado = calcularPedidoCompleto(analisis, ctx, mockCatalogo);
    tests.push({ name: "calcularPedidoCompleto OTRA_LAS_TALITAS", pass: resultado.envio.zona === "OTRA_LAS_TALITAS" && resultado.envio.costo === 2000 && resultado.total === 23900 });
  } catch (e) { tests.push({ name: "calcularPedidoCompleto OTRA_LAS_TALITAS", pass: false, error: e.toString() }); }

  try {
    const ctx = { envios: mockEnvios, promociones: mockPromos };
    const analisis = { productos_detectados: [{ sabor: "Sin Azucar", cantidad: 1 }], zona_mencionada: "CENTRO", medio_pago_mencionado: null };
    const resultado = calcularPedidoCompleto(analisis, ctx, mockCatalogo);
    tests.push({ name: "calcularPedidoCompleto promo porcentual", pass: resultado.descuento_total === 780 && resultado.total === 5200 - 780 });
  } catch (e) { tests.push({ name: "calcularPedidoCompleto promo porcentual", pass: false, error: e.toString() }); }

  let allPass = true;
  tests.forEach(t => {
    if (!t.pass) { allPass = false; Logger.log("FAIL: " + t.name + (t.error ? " | " + t.error : "")); }
    else Logger.log("PASS: " + t.name);
  });
  Logger.log("=== CALCULATOR TESTS: " + (allPass ? "ALL PASS" : "SOME FAILED") + " ===");
  return { allPass, tests };
}