# CAMBIOS-BACKEND.md

## 2026-07-30 — Corte 6 Auth/RBAC: reconciliación read-only + delta mínimo preparado NO EXECUTE

Estado: `CORTE6_AUTH_RBAC_READONLY_RECONCILED__MINIMAL_PROVIDER_DELTA_PREPARED_NO_EXECUTE__HOSTING_REDEPLOY_RESERVED_0OF1__NO_PRODUCTION`.

### Archivos creados/tocados
- `tools/qa/cxorbia-auth-rbac-readonly-reconcile.mjs`: inventario Auth/RBAC source-safe, sin PII ni writes; refleja la semántica real de `firestore.rules`.
- `.github/workflows/cxorbia-canonical-backend-readonly-inventory.yml`: extiende el runner read-only existente para producir evidencia Corte 6.
- `.github/cxorbia-firebase-requests/canonical-backend-readonly-inventory.json`: nonce de lectura; providerWrites=0.
- `app/docs/evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json/.md`: evidencia sanitizada.
- `app/core/backend-browser-auth.js`: gate Firebase Auth interactivo solo para `index-backend-dev.html`, sesión SESSION, claims como autoridad, sin credenciales persistidas.
- `app/index-backend-dev.html`: carga el gate Auth antes del adapter Firebase; `app/index.html` no se tocó.
- `app/core/backend-config-preview-dev.js`: elimina fallback de email/password almacenado; exige Auth interactivo.
- `app/core/backend-firebase.js`: lecturas acotadas al principal autenticado; operador/cliente/shopper dejan de depender de queries globales no autorizadas.
- `firestore.rules`: compatibilidad de lectura shopper disponible con campo canónico `status` y legacy `estado`; fuente preparada, NO desplegada todavía.
- `tools/release/cxorbia-corte6-auth-claims-normalize.mjs`: normalización fail-closed de claims, dry-run por defecto.
- `.github/cxorbia-firebase-requests/corte6-auth-rbac-activation.json`: request de proveedor creado apagado (`enabled=false`).
- `.github/workflows/cxorbia-corte6-auth-rbac-activation.yml`: gate one-shot preparado; ejecuta static checks/dry-run y solo permite provider changes con autorización explícita vigente.
- checkpoint/índice/Claude/PENDIENTES/Academia/tracker/PR: reconciliación documental del corte.

### Evidencia Auth/RBAC read-only
- Auth users: 17; activos password: 17.
- Alcance TyA válido bajo reglas actuales: 13.
- Operador listo: 7.
- Cliente listo: 0/2; ambos tienen tenant TyA pero scopes de proyecto legacy `tya`/`tya-piloto`, no `cinepolis`.
- Shopper listo: 0/4; 3/4 tienen `shopperId` que coincide exactamente con perfil Firestore y son los únicos shoppers elegibles para normalización automática.
- `projectIds` canónico requerido por reglas actuales: `cinepolis`.
- Auth/Firestore/Rules/Hosting writes durante diagnóstico: 0/0/0/0.
- PII/identidades exportadas: 0.

### Delta mínimo de proveedor preparado, todavía NO autorizado/NO ejecutado
1. Máximo 5 updates de custom claims sobre usuarios existentes: 2 cliente TyA + 3 shopper TyA con perfil exacto.
2. Para esos targets únicamente: reemplazar scope de proyecto stale `tya`/`tya-piloto` por `projectId='cinepolis'`, `projectIds=['cinepolis']`; preservar resto de claims.
3. No crear usuarios, no cambiar contraseñas, no borrar cuentas y no tocar el cuarto shopper sin perfil exacto.
4. Desplegar únicamente `firestore.rules` ya preparada para `status/estado` en visita disponible.
5. Firestore data writes=0; Hosting=0 en este gate; Storage/HR=0; producción=0; merge=0.

### Runtime/seguridad
- El selector local de rol deja de ser autoridad en el entrypoint backend DEV; Firebase Auth + claims determinan el principal real.
- Cliente/shopper cargan solo proyectos autorizados; shopper carga su perfil, visitas propias/disponibles y postulaciones propias mediante queries compatibles con reglas.
- El cambio preserva la interfaz `CX.data` y no modifica `app/modules/*`.
- No se publican password, token, email, UID ni secretos en repo/Hosting.

### Hosting
La autorización previa de redeploy al Hosting DEV existente sigue reservada 0/1 y no se vuelve a solicitar. Se consumirá solo después de PASS del gate Auth/RBAC.

### Clasificación
- **Reusable CXOrbia:** Firebase browser Auth gate, principal-scoped reads, claim normalization fail-closed, canonical/legacy status compatibility.
- **Exclusivo cliente:** tenant TyA, proyecto `cinepolis`, scopes stale `tya`/`tya-piloto`.
- **Claude/prototipo:** no intervención aún; smoke post-Hosting decidirá si existe P0 frontend localizado.
- **Academia:** identidad autenticada vs selector de rol, scopes de proyecto, shopperId y manejo de permisos.
- **Sin impacto Claude:** requests/runners/evidencia source-safe.

### Estado seguro
Auth writes=0; Firestore data writes=0; Rules deploy=0; Hosting deploy=0; Storage/HR/legacy writes=0; pagos=0; Make/Gemini=0; merge=false; producción=false.

### Siguiente bloque exacto
`AUTORIZACIÓN CORTE6 AUTH CLAIMS MÁX5 + FIRESTORE RULES → EJECUTAR/VERIFY READINESS → CONSUMIR HOSTING DEV YA AUTORIZADO → SMOKE REAL → FREEZE → AGOSTO DELTA`.

---

## 2026-07-30 — Corte 5 post-materialización: provider/identidad PASS + P0 CX.data period model

Estado histórico de inicio de Corte 5: `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__PROVIDER_COMPARE_IDENTITY_PASS__P0_C5_CXDATA_PERIOD_MODEL__RUNTIME_FIX_AUTH_PENDING__NO_PRODUCTION`.

### Archivos creados/tocados en ese bloque
- `tools/qa/tya-r17n-post-materialization-readonly-smoke.mjs`: wrapper del gate hardened.
- `tools/qa/tya-r17n-post-materialization-readonly-smoke-v2.mjs`: post-compare proveedor + identidad + smoke exacto CX.data, read-only.
- `.github/workflows/cxorbia-r17n-post-materialization-readonly.yml`: ejecución controlada read-only, sin contents write/provider write.
- `.github/cxorbia-firebase-requests/r17n-post-materialization-readonly.json`: request consumido/frozen después del diagnóstico.
- `app/docs/evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json`: evidencia sanitizada del P0.

### Resultado proveedor/identidad
- 1,406/1,406 rutas R17N presentes; 0 missing; 0 authorization drift; 0 `production=true`.
- parent `cinepolis`, 14 periodos, 616 visitas, 572 controles, 77 certificaciones, payments/lots 0/0.
- 208/208 referencias HR exactas; 194 perfiles canónicos únicos esperados; 616/616 visitas con shopper existente; placeholders demo 0.

### P0 histórico y resolución posterior
`P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH` fue localizado en `app/core/backend-firebase.js`: el adapter interpretaba project docs como periodos. Posteriormente quedó corregido y el re-smoke final pasó con `source=firestore`, `fallback=false`, projects=1, periods=14, visits=616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`.

---

## 2026-07-30 — R17N FINAL materialización DEV exacta PASS
- 1,406 Firestore writes autorizados y ejecutados.
- Readback 1,406/1,406; mismatch 0.
- Foundation16 + legacy profiles120 + HR profiles5 + certs77 + visits616 + liquidation controls572.
- HR identity 208/208; existing canonical 201/201 con nombre real visible.
- Tenant/update22/holds/agosto/deletes/pagos/Auth/Storage/HR/deploy/merge/producción excluidos.
- Evidencia: `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`.

## Histórico protegido
Los addenda previos permanecen como trazabilidad. Los estados de 210 refs/9 pendientes y R17N NO EXECUTE son históricos y no deben reactivarse. No reabrir Corte 3 ni repetir la materialización.
