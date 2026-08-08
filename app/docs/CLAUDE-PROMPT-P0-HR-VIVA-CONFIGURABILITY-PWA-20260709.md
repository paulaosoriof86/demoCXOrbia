# Prompt Claude P0 HR viva configurabilidad PWA TyA

Copia este prompt en Claude junto con el paquete descargable.

---

Estoy continuando CXOrbia TyA Phase A. No reinicies metodologia ni trabajes con una version anterior por memoria.

Repo: `paulaosoriof86/demoCXOrbia`.
PR vigente: #7 draft/open/no merge.
Rama: `docs-tya-v6-v71-audit`.
Base: `release/cxorbia-tya-rc-20260630`.
DEV URL de referencia: `https://cxorbia-backend-dev.web.app`.

Lee obligatoriamente estos archivos antes de modificar:

1. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`
2. `app/docs/ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
3. `app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
4. `app/docs/BASELINE-AUDITADA-CONTINUIDAD-V91-INCREMENTAL-CXORBIA-20260708.md`
5. `app/docs/P0-VISUAL-CONFIGURABILITY-NO-GO-TYA-20260709.md`
6. `app/docs/CLAUDE-PACKAGE-ACUMULADO-P0-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`
7. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`
8. `app/docs/ACADEMIA-IMPACT-HR-VIVA-CONFIGURABILITY-PWA-20260709.md`
9. `backend/config/tya-phase-a-platform-project-config.source-safe.json`
10. `backend/contracts/phase-a-tenant-project-config-from-platform-v1.json`

Objetivo P0: corregir configurabilidad visual y de estado sin parchar ni hardcodear.

Problemas actuales:

- Tenant debe ser TyA.
- Proyecto debe ser Cinépolis, no Cinépolis Junio/Julio.
- Selector de proyecto muestra periodos; debe mostrar solo proyectos.
- Selector de periodo en sidebar y dashboard no comparten estado.
- KPIs acumulan todos los periodos; deben filtrar por periodo salvo `Todos los periodos` elegido explicitamente.
- HR viva multihoja debe ser dato de configuracion del proyecto, visible masked/editable con gate.
- Logo del tenant/cliente no se propaga correctamente.
- Login tiene doble titulo y no muestra logo correcto del cliente/tenant.
- Favicon y PWA icons deben venir del branding del cliente/tenant con fallback CXOrbia.
- Instalacion PWA debe detectar dispositivo/navegador y mostrar CTA adecuada; no prometer instalacion silenciosa si no es posible.
- Banderas deben venir de paises configurados, no hardcodeadas.
- Shoppers completos requieren Auth/roles; no exponer datos personales en JS publico.

Reglas:

- No rediseñar desde cero.
- No romper modulos aprobados.
- No tocar backend real ni activar proveedores.
- No usar produccion.
- No exponer HR URL completa, workbook crudo o PII.
- Todo debe quedar reusable para nuevos proyectos TyA, nuevos tenants y futuros clientes CXOrbia.
- Documenta todo cambio en CAMBIOS/PENDIENTES/RESUMEN/Academia.

Criterios GO:

- Login un solo titulo, branding correcto y favicon/PWA correctos.
- Project selector solo proyectos.
- Period selector solo periodos.
- Sidebar/dashboard comparten periodo.
- KPIs y listas cambian al cambiar periodo.
- Configuracion del proyecto muestra HR source masked.
- Paises/banderas/monedas derivan de configuracion.
- Academia incluye tenant/proyecto/periodo, HR source, PWA/branding y Auth/roles.
- Sin promesas de Make/Gemini/pagos/import/produccion sin gate.

Entrega esperada:

- ZIP/candidata nueva.
- Resumen de archivos modificados.
- Qué resolviste.
- Qué queda pendiente.
- Qué no tocaste.
- Cómo validaste.

---
