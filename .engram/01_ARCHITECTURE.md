# Arquitectura: Brinines AI

El sistema es un monolito refactorizado hacia una estructura modular en Apps Script.

## Componentes actuales:
- `00_Config.gs`: Variables globales, constantes de configuración y accesores de Sheets.
- `01_Utils.gs`: Utilidades transversales (Logging, IDs, Lectura de tablas).
- `Code.js`: (Core funcional) Núcleo de la lógica de negocio.
- `codebackup.gs.js`: (OBSOLETO) No utilizar.

## Flujo de trabajo:
- ChatGPT autoriza cambios.
- OpenCode verifica estado (Git/Code), ejecuta, verifica y commitea.
- Seguridad: Prohibido push sin autorización.
