# Resultados de Pruebas de Validación - 2026-08-26_00-23-02

## Configuración
- **Modelo**: gemini-3.1-flash-lite (configurado en 00_Config.gs)
- **Script ID**: 1pS7EOaBRZRoxkKpg9KJ3KVY96iN8rFb_UcxfMr_Eb0LmcXIYB42YlqnP
- **Función de prueba**: ejecutarPruebasValidacion() en Code.js
- **Cliente de prueba**: usuario_prueba_validacion (aislado)
- **Plataforma**: alidacion`n
## 10 Pruebas a Ejecutar
1. Hola, quiero los de siempre
2. Nunca probé los budines, cuál me recomendás?
3. Hola! Cómo están? 😊 Quería consultar qué sabores tienen disponibles.
4. Hola! Quiero pedir de nuevo, me encantaron los budines 😍
5. Cuánto sale el de chocolate?
6. Tenés de limón?
7. Quiero 3 de chocolate y 2 de limón
8. Cuánto sale el envío?
9. Quiero pedir para mañana
10. No me gustaron, estaban secos

## Instrucciones de Ejecución
1. Abrir Apps Script: clasp open-script o https://script.google.com/d/1pS7EOaBRZRoxkKpg9KJ3KVY96iN8rFb_UcxfMr_Eb0LmcXIYB42YlqnP/edit
2. En el editor, seleccionar la función ejecutarPruebasValidacion en el dropdown
3. Click en **Ejecutar** (▶️)
4. Ver logs en **Ejecuciones** o **Ver > Registros de ejecución**
5. Resultados también se guardan en hojas: Resultados_Pruebas y Resumen_Pruebas

## Resultados Esperados por Prueba
| # | Mensaje | Intención Esperada | Etapa Esperada | Notas |
|---|---------|-------------------|----------------|-------|
| 1 | Hola, quiero los de siempre | REALIZAR_PEDIDO / OTRO | PEDIDO / EXPLORACION | Debe detectar continuidad, pedir sabores si no hay historial |
| 2 | Nunca probé los budines, cuál me recomendás? | RECOMENDACION | EXPLORACION | Debe ofrecer guía sin inventar popularidad |
| 3 | Hola! Cómo están? 😊 Quería consultar qué sabores... | CONSULTA_SABORES | EXPLORACION | Cordial, consulta informativa |
| 4 | Hola! Quiero pedir de nuevo, me encantaron los budines 😍 | REALIZAR_PEDIDO | PEDIDO | Feedback positivo + intención de compra, NO asumir sabores |
| 5 | Cuánto sale el de chocolate? | CONSULTA_PRECIO | EVALUACION | Consulta precio específico |
| 6 | Tenés de limón? | CONSULTA_SABORES | EXPLORACION | Consulta disponibilidad |
| 7 | Quiero 3 de chocolate y 2 de limón | REALIZAR_PEDIDO | PEDIDO | Pedido concreto, es_pedido=true |
| 8 | Cuánto sale el envío? | CONSULTA_ENVIO | EVALUACION | Consulta logística |
| 9 | Quiero pedir para mañana | REALIZAR_PEDIDO | PEDIDO | Pedido con fecha |
| 10 | No me gustaron, estaban secos | QUEJA / FEEDBACK | POSTVENTA / RETENCION | Queja, debe escuchar primero |

## Campos a Registrar por Prueba
- Número de prueba
- Mensaje exacto enviado
- Análisis JSON completo devuelto por la IA
- respuesta_sugerida
- Intención detectada
- Etapa de venta
- Temperatura
- Nivel de confianza
- Estilo detectado
- Scores de comunicación (directo, cordialidad, informalidad, humor, necesita_guia)
- hielo_roto_por_cliente
- hielo_roto_por_brinines
- es_pedido
- resumen_interno

---\n
**NOTA**: clasp run falla con error backend NOT_FOUND. Ejecutar manualmente desde Apps Script UI.

