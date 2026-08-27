# Estado Actual

- Commit base: 970b313
- Fixes realizados en esta sesión:
  * normalizarZonaComercial(): corregido OTRA_OTRA_, guiones, dobles underscores, prefijo OTRA
  * Tests de promociones: expectativas actualizadas a 3785 (stacking) y 11150 (stacking)
  * Test de stock: expectativa corregida a ok === false (stock insuficiente real)
  * itemsSubtotal: agregados campos producto_id
- Arquitectura modular: 7 módulos .gs + Code.js
- Estado: READY_FOR_MANUAL_VALIDATION
- Sin clasp push a producción
- GEMINI_KEY en Script Properties (seguro)
- Sin secretos en código