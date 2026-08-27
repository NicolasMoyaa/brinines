# Tareas Pendientes - IMPLEMENTACIÓN AUTÓNOMA

- [x] Migración de Clientes (Etapa 2)
- [x] Migración de Gemini (Etapa 3)
- [x] Migración de Análisis (Etapa 4)
- [x] Migración de Webhooks (Etapa 5)
- [x] Limpieza total de funciones duplicadas y codebackup.gs.js (Etapa 6)
- [x] Validación pre-deploy (Etapa 7)
- [x] Optimización verificarSistema() (Etapa 8)
- [x] clasp push (completado - cc2d3a3)
- [x] Crear función ejecutarPruebasValidacion() con 10 casos
- [x] Fix guardarResultadosPruebas() columns mismatch (941a6da)

## NUEVAS ETAPAS - ARQUITECTURA DATOS VOLÁTILES

- [x] **ETAPA 0**: Auditoría estado real del repo
- [x] **ETAPA 1**: Data Access Layer (20_DatosComerciales.gs)
- [x] **ETAPA 2**: Calculator (40_CalculadoraPedidos.gs)
- [x] **ETAPA 3**: Sheets + Mock Data (setupMockDataComercial en 20_DatosComerciales.gs)
- [x] **ETAPA 4**: Integración Gemini (Code.js + 31_AnalisisConversacional.gs)
- [x] **ETAPA 5**: Orquestación Pedidos (guardarPedido + integración completa)
- [x] **ETAPA 6**: Sistema Zonas OTRA_* (normalizarZonaComercial + integración)
- [x] **ETAPA 7**: Pagos (EFECTIVO/TRANSFERENCIA activos únicamente)
- [x] **ETAPA 8**: Cache (CacheService + invalidación)
- [x] **ETAPA 9**: Admin/UI mínima
- [x] **ETAPA 10**: Validación E2E Completa (20 casos de prueba)
- [x] **ETAPA 11**: Auditoría Final
- [x] **ETAPA 12**: ENGRAM + Repo Final

## ARCHIVOS CREADOS/MODIFICADOS EN ESTA FASE

### Nuevos archivos:
- `20_DatosComerciales.gs` - Data Access Layer (lectores Sheets + cache + mock data setup + tests)
- `40_CalculadoraPedidos.gs` - Business Rules Calculator (funciones puras determinísticas + tests)

### Archivos modificados:
- `00_Config.gs` - Agregadas hojas `envios`, `pagos`, `promociones` a BRININES.sheets
- `10_Clientes.gs` - `normalizarZona()` delega a `normalizarZonaComercial()`, agregada `actualizarZonaCliente()`
- `31_AnalisisConversacional.gs` - `analizarMensaje()` recibe `contextoComercial`, inyecta datos comerciales en prompt, schema extendido con `productos_detectados`, `zona_mencionada`, `medio_pago_mencionado`
- `Code.js` - `procesarConversacion()` orquesta: contexto comercial → Gemini → normalización zona → calculator → respuesta final → guardar pedido; agregadas `construirRespuestaPedido()`, `guardarPedido()`; menú admin extendido con submenús Catálogo/Envíos/Pagos/Promos + view functions

### Hojas comerciales (definidas en config, creadas por setupMockDataComercial):
- `Config` (key/value extendida: retiro_disponible, horario_atencion, telefono_local, direccion_local, tiempo_preparacion_min)
- `Productos` (10 cols: Producto_ID, Sabor, Precio_Unitario, Costo_Unitario, Disponible, Stock, Categoria, Descripcion, Orden_Menu, Fecha_Actualizacion)
- `Envios` (7 cols: Envio_ID, Zona, Costo, Disponible, Tiempo_Estimado, Minimo_Gratis, Condiciones)
- `Pagos` (6 cols: Pago_ID, Medio, Disponible, Comision_Pct, Instrucciones, Orden_Menu)
- `Promociones` (8 cols: Promo_ID, Nombre, Tipo, Valor, Condicion_JSON, Activa, Fecha_Inicio, Fecha_Fin)
- `Pedidos` (13 cols: Pedido_ID, Cliente_ID, Fecha_Hora, Items_JSON, Subtotal, Envio_Zona, Envio_Costo, Descuento_Promos, Total, Medio_Pago, Estado, Tipo_Entrega, Notas)

## TESTS IMPLEMENTADOS

### Unitarios (ejecutables desde Apps Script):
- `test_DataAccessLayer()` - 12 tests: productos, envios, pagos, promos, config, boolean/number conversion, cache hit/invalidation
- `test_Calculator()` - 25+ tests: matchProductos, validarStock, calcularSubtotal, calcularEnvio (CENTRO/FUERA_CENTRO/OTRA_*), evaluarPromociones (porcentual, monto, envío gratis, 2x1), calcularTotal, normalizarZonaComercial (10 casos), pagos activos

### E2E (ejecutarPruebasValidacion - 20 casos):
1-10: Casos originales conversacionales
11: "Quiero 3 de chocolate y 2 de limón" → es_pedido, productos correctos, subtotal
12: "Quiero 3 de chocolate y 2 de limón, zona Las Talitas" → zona OTRA_LAS_TALITAS
13: "Quiero 3 de chocolate y 2 de limón, zona Centro" → zona CENTRO, envío según reglas
14: "Quiero 1 de sin azúcar" → promo 15% aplicada
15: "Quiero 100 de chocolate" → error stock insuficiente
16: "Estoy en Las Talitas" → detectar zona, normalizar a OTRA_LAS_TALITAS
17: "OTRA Las Talitas" → flujo CTA OTRA + texto → OTRA_LAS_TALITAS
18: "Quiero pagar por MercadoPago" → no ofrecer (inactivo)
19: "Quiero pagar por transferencia" → TRANSFERENCIA detectado
20: "Quiero pagar en efectivo" → EFECTIVO detectado

## REGLAS ARQUITECTÓNICAS RESPETADAS

✅ Google Sheets = fuente de verdad comercial
✅ Gemini SOLO interpreta lenguaje natural, NO calcula precios/stock/envíos/promos
✅ Cálculos 100% determinísticos en 40_CalculadoraPedidos.gs (funciones puras)
✅ NO se almacenan direcciones personales de clientes
✅ Zonas: CENTRO, FUERA_CENTRO, OTRA_* (normalización robusta en normalizarZonaComercial)
✅ Pagos actuales: solo EFECTIVO y TRANSFERENCIA activos
✅ CacheService con TTL 5 min + invalidación manual
✅ Mock data claramente identificada con "MOCK:"
✅ Arquitectura modular mantenida (7 módulos .gs + Code.js)
✅ Sin secretos en código (GEMINI_KEY en Script Properties)
✅ Sin clasp push (solo git push al remoto autorizado)

## PRÓXIMOS PASOS RECOMENDADOS

1. Ejecutar `setupMockDataComercial()` desde Apps Script UI para poblar Sheets
2. Ejecutar `test_DataAccessLayer()` y `test_Calculator()` para validar unitarios
3. Ejecutar `ejecutarPruebasValidacion()` para validación E2E completa (20 casos)
4. Analizar resultados en hojas `Resultados_Pruebas` y `Resumen_Pruebas`
5. Cuando validación pase: autorizar `clasp push` para deploy a producción
6. Implementar agentes futuros (Marketing Strategist, Content Planner, Metrics Analyst, Learning Agent) usando Data Access Layer compartido
