# I3 — PAQUETE DE INTERVENCIÓN CODEX B2 (P0_PROVEN, ÚNICO OWNER)
**Estado:** READY_FOR_CODEX_NOT_EXECUTED · **Rama:** recovery/cxorbia-phase-a-20260831 · **producción:** NO TOCAR

## Entrada inmutable
Fuente candidata aprobable de entrada: `6814d1335ff7490976bf77164cee5b45333f1e50`
Tree: `611f3baf1594765db71688065157142a7dfe7d12`.
Ledger acumulativo V370 `CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V370_2026-10-12.json`; evidencia humana completa: `CXORBIA_I3_HUMAN_FOCAL_VISUAL_CHECKPOINT_2026-10-12.json` (blob `bd77d99966e4c4929af0e126e540e5e79d799b40`). Deben leerse sus 30 IDs, los 45 de 06-10, 18 de 08-10 y 274 VRM.

## Defecto y causa demostrada
- HF-20261012-04: `app/modules/shoppers.js` líneas 477–499 incluye `firstName` y `lastName` en patch Admin; `backend/runtime/cxorbia-shopper-command-provider-v1.mjs` en `durableProfileUpdate` niega HR-managed fields y emite `SHOPPER_HR_MANAGED_FIELDS_IMMUTABLE`. No desactivar esa protección.
- El proveedor distingue `displayFirstName/displayLastName` para self-scoped. **No asumir permiso Admin para cambiarlos**; demostrar un camino admin autorizado, exacto y auditable sin desbordar HR.
- HF-20261012-02: `app/adapters/tya-canonical-shopper-portal-v2.js` línea 123 usa sort ascendente. Beneficios ordena descendente y es PASS humano a preservar.
- HF-20261012-01: Mi Perfil muestra grupos sensibles extensos juntos. Requiere tarjetas breves con detalle independiente modal/grupo; contraste y RBAC.
- HF-20261012-03: fecha visible distinta en Mi Perfil y Mis Visitas. Antes de cambiar datos, demostrar revisión HR, visitId, hrRowId, fecha vigente, fecha pendiente y mismo snapshot. No inferir de capturas tomadas en distintos momentos.

## Alcance de escritura P0-proven autorizado
- `app/modules/shoppers.js` solamente patch, validación, visual/fallo detallado de Admin.
- `app/adapters/tya-canonical-shopper-portal-v2.js` solamente orden histórico descendente, tarjetas modales independientes y RBAC/contraste.
- `backend/runtime/cxorbia-shopper-command-provider-v1.mjs` solo si se prueba comando Admin de corrección permitido. Debe conservar `tenant/project/shopperId/uid/crosswalk`, provider ACK, idempotencia, no duplicidad y no escribir HR externa.
- `app/styles/layout.css` exclusivamente CSS scoped B2; no alterar global ni otros módulos.
- Pruebas focales en el directorio de tests existente. `app/core/shopper-credential-rule.js` y `app/adapters/cxorbia-shopper-admin-command-contract-v1.js` read-only salvo dueño EXACTO demostrado por test.

## Contratos de cierre
1. Nombre visible Admin autorizado, si permitido, conserva shopperId y todas las visitas; **si no existe capacidad autorizada, HOLD_OWNER_CAPABILITY** sin mensaje falso. El login visible/contraseña no cambia sin contrato especial, revalidación Auth y prueba de no colisión.
2. Guardar cambios permitidos con ACK remoto + readback Firestore + reload. No enviar campos HR-managed si no hubo edición real; edición HR permanece bloqueada.
3. Mi Perfil ordena última fecha primero (visit exact). Mi Beneficios conserva histórico newest-first y pagos ya aceptados.
4. Cuatro tarjetas compactas B2 (identidad, contacto, acceso, pago) muestran exclusivamente su categoría en modal; ocultan secretos y cumplen responsive 1440/390/320.
5. No regresiones en B1 Mi Día, B3 Mis Visitas, B4 Academia, B5 Beneficios, B7 Dashboard/Postulaciones, B8 Finanzas, GT/HN, HR live y fuente financiera.
6. Source SHA/Tree y blobs readback; suites fake provider y focal source PASS; después materializar una sola nueva source acumulativa en DEV por carril existente y E2E Admin+Shopper misma revisión. No I4 sin GO y autorización expresa.

## Anti-bucle
Una corrección queda en I3 y se registra por `HF-20261012-XX`, owner, antes/después SHA, test, validación DEV y decisión humana. No crear rama, candidata, overlay, workflow, reimportación, base ni Firebase nuevos. Único escritor de código Codex; este paquete NO constituye intervención ya ejecutada.
