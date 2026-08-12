# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 13:42 -06:00  
**Estado:** `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_SOURCE_IMPLEMENTED__RUNTIME_PROOF_PENDING__PHASE_A_88`

## Bloque actual

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_LOCALIZED`.

Se cerró el hueco source entre el principal Firebase/claims y la membresía canónica materializada por Exact Write V2, sin reabrir Staff ni repetir provider writes.

### Archivos creados/modificados

- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js`: adapter DEV read-only que reconcilia `Firebase principal + claims → tenants/tya/users/{uid} → CX.session/RBAC` para Staff.
- `app/index-backend-dev.html`: agrega únicamente la carga del adapter después de `backend-browser-auth.js` y antes de `backend-firebase.js`.

### Validaciones source implementadas

Para Staff (`super/admin/ops/coordinador`) el adapter exige, de forma fail-closed: usuario Firebase autenticado; tenant `tya`; namespace `staff`; rol exacto; membership activa; `TYA_COMPLETE`; projectIds exactos; claimsDigest exacto y providerUidFingerprint exacto.

Solo después publica en sesión el estado sanitizado de membership/scope. No expone `visibleLogin`, UID ni secretos. Ante mismatch limpia sesión, cierra Auth y bloquea el recorrido.

## Causa raíz cerrada a nivel source

El runtime previo validaba Firebase Auth + custom claims y usaba ese contexto directamente para lecturas/RBAC. Las Rules ya permitían al usuario leer su propio `tenants/{tenant}/users/{uid}`, y Exact Write V2 ya había creado/readback los cuatro user docs canónicos; faltaba consumir esa membresía en el recorrido humano.

## Gates observados sobre el commit de wiring

PASS automáticos relevantes: Visual Smoke, Operational Readiness R9, Auth Pre-activation Route Action Gate, DEV Auth Firestore Readiness, Firebase DEV Clean-State Read-Only Gate, READONLY_POST_GATES_RUNNER, Live Execution Checkpoint, Source Safe Runtime Guard y Period History Integrity.

El fallo R18A inspeccionado no proviene del wiring: corresponde a pendientes frontend heredados en `app/modules/cliente-extra.js` (`pdf_print_flow_missing`, `xlsx_export_missing`, `pptx_export_missing`).

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12%. Delta certificado de esta iteración: +0%.**

El source del wiring está implementado, pero no se suma porcentaje hasta demostrar en runtime DEV `Auth → membership → RBAC → consumo frontend`.

## No reabrir

Exact Write V2, private handoff, D rebase, snapshot `31518927950`, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF` sobre el build que contiene este source. Requiere Hosting DEV; este documento no autoriza deploy.

Después: `M7 → M8 → M9 → M10`.

## Clasificación

- **Reusable CXOrbia:** reconciliación fail-closed claims + membership + RBAC antes de consumo backend.
- **Exclusivo cliente:** tenant `tya`, proyecto `cinepolis`, entitlement `TYA_COMPLETE` y Staff canónico A-D.
- **Claude/prototipo:** cero módulos UI modificados; exports PDF/XLSX/PPTX de Cliente siguen como pendiente frontend heredado.
- **Academia:** no cambia contenido aún; al certificar runtime se revisan rutas/manuales de administración y permisos por rol.
- **Sin impacto Claude:** validación digest/fingerprint y membership gate read-only.

## Estado seguro

Source-only/read-only. Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes: 0. Deploy/merge/producción: 0/false/false.