# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 15:05 -06:00  
**Estado:** `C6_LIVE_USER_ADMIN_RUNTIME_SCOPE_CORRECTED__PROOF_PENDING__PHASE_A_88`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`. El wiring source `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` ya estaba implementado para Staff.

Se corrigió además la causa raíz que bloqueaba el proof remoto: el workflow seleccionaba Staff + Shopper + Client y el runtime wrapper exigía las tres personas aunque el action autorizado `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF` es únicamente Staff/admin.

La corrección queda action-scoped:

- selector dinámico: Staff-only únicamente para el action exacto;
- workflow: no selecciona Client ni exige Shopper/Client en ese action;
- runtime wrapper: paridad + autenticación Staff/admin + reload/new-tab únicamente para ese action;
- fuera del action, la lógica genérica Staff+Shopper+Client permanece sin cambio funcional.

**Phase A certificado: 88% | restante: 12%.** El delta técnico no suma porcentaje hasta certificar el runtime DEV remoto.

## Frontend / Claude

- No generar nueva candidata.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- Esta corrección no modificó `app/modules`, `app/core`, adapters de UI ni copy.
- Los faltantes heredados PDF/XLSX/PPTX de `app/modules/cliente-extra.js` siguen separados de C6 y no son causa del proof Staff.
- Si el runtime Staff produce una diferencia visual reproducible, documentarla por archivo/módulo; no rediseñar.

## Siguiente acción exacta

Rearmar el request one-shot contra el HEAD corregido y ejecutar el mismo único Hosting DEV ya autorizado para:

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF → M7 → M8 → M9 → M10`.

Hosting DEV consumido en esta corrección: `0/1`.

## Academia

Sin cambio de contenido en esta corrección. Cuando el runtime Staff certifique administración/roles reales, revisar manuales, cursos, rutas por rol, permisos, errores frecuentes y notificaciones relacionadas con acceso y administración.
