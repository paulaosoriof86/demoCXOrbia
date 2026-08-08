# Prompt Claude prototipo generico HR viva configurabilidad PWA

Estoy trabajando en el prototipo generico de CXOrbia, no en un tenant especifico. No debes contaminar el prototipo con nombres reales de cliente, proyecto, HR, paises o datos operativos.

Lee antes de tocar codigo:

1. `app/docs/CLAUDE-PACKAGE-PROTOTIPO-GENERICO-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`
2. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-GENERICO-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`
3. `app/docs/ACADEMIA-IMPACT-GENERICO-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`
4. `app/docs/BASELINE-AUDITADA-CONTINUIDAD-V91-INCREMENTAL-CXORBIA-20260708.md`
5. `app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`

Objetivo: corregir el prototipo para que todo sea configurable y reusable:

- tenant config;
- project config;
- period config;
- country/currency config;
- brand config;
- HR/source config;
- questionnaire config;
- certification config;
- payment/liquidation config;
- integration gates.

Corrige P0:

- project selector no debe listar periodos;
- period selector debe filtrar KPIs y listas;
- sidebar/dashboard comparten periodo;
- acumulado historico solo por opcion explicita;
- HR/source visible en configuracion del proyecto como masked/reference;
- branding propaga logo, favicon, manifest PWA, topbar, sidebar, login y portal cliente;
- instalacion PWA detecta dispositivo/navegador;
- banderas salen de paises configurados;
- login no duplica titulo;
- preview publico no expone datos sensibles;
- shoppers completos requieren Auth/roles.

No hardcodees un cliente, proyecto, pais, periodo, logo, HR o moneda. Usa datos demo genericos y configurables.

Entrega:

- candidata ZIP;
- lista de archivos modificados;
- que resolviste;
- que queda pendiente;
- como validaste;
- actualizacion de pendientes/Academia/resumen.