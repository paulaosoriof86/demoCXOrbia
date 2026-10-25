# Prompt Claude prototipo generico full backend flujos academia

Estoy trabajando el prototipo generico CXOrbia. No uses nombres reales de tenant, cliente o proyecto como parte fija del prototipo. No reinicies metodologia.

Lee antes de tocar codigo:

1. `app/docs/CLAUDE-PACKAGE-PROTOTIPO-GENERICO-FULL-BACKEND-FLOWS-ACADEMIA-20260709.md`
2. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-GENERICO-FULL-BACKEND-FLOWS-ACADEMIA-20260709.md`
3. `app/docs/ACADEMIA-IMPACT-GENERICO-FULL-BACKEND-FLOWS-ACADEMIA-20260709.md`
4. `app/docs/CLAUDE-PACKAGE-PROTOTIPO-GENERICO-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`
5. `app/docs/BASELINE-AUDITADA-CONTINUIDAD-V91-INCREMENTAL-CXORBIA-20260708.md`
6. `app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`

Objetivo: corregir prototipo para que tenant, proyecto, periodo, paises, monedas, branding, favicon/PWA, fuente viva, cuestionarios, certificaciones, pagos, integraciones, Auth/roles, reviewQueue y auditEvents sean configurables y replicables.

No hardcodees nombres, periodos, paises, logos, URLs de fuentes ni monedas. Todo debe salir de configuracion.

Corrige P0:

- project selector solo proyectos;
- period selector solo periodos del proyecto;
- sidebar/dashboard comparten periodo;
- KPIs/listas filtran por periodo;
- source viva configurable y masked;
- nuevos tenants y proyectos manuales;
- brand config en login/topbar/sidebar/favicon/PWA;
- PWA detecta dispositivo/navegador;
- banderas/monedas desde configuracion;
- shoppers completos solo con Auth/roles;
- integraciones/pagos/import/IA como gate-off si no activos;
- Academia actualizada.

Entrega ZIP/candidata, resumen de cambios, validacion GO/NO GO y pendientes restantes.