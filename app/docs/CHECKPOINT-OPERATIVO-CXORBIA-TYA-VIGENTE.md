# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `CORTE6_AUTH_RBAC_READONLY_RECONCILED__MINIMAL_PROVIDER_DELTA_PREPARED_NO_EXECUTE__HOSTING_REDEPLOY_RESERVED_0OF1__NO_PRODUCTION`

## 1. Repositorio y destinos fijos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: `cxorbia-backend-dev` / target `cxorbia-dev` / `https://cxorbia-backend-dev.web.app`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- Sandbox C4: no destino.
- Prohibido crear nuevo Firebase, Hosting, rama o PR por rutina.

## 2. Baseline que no se reabre
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL DEV: 1,406/1,406 Firestore writes y 1,406/1,406 readback, mismatch 0.
- Materializado: foundation16 + perfiles125 + certificaciones77 + visitas616 + controles liquidación572.
- Corte 5 `CX.data`: P0 proyecto/periodo corregido; re-smoke PASS con source=firestore, fallback=false, projects=1, periods=14, visits=616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`.
- No repetir materialización ni los 1,406 writes.

## 3. Fuente operativa pendiente de agosto
- Fuente canónica vigente: junio 2025–julio 2026, 14 periodos, 616 visitas.
- Agosto HN continúa HOLD por inconsistencia país/tab.
- Agosto se atiende después del smoke Auth/Hosting mediante refresh de fuente y delta incremental; nunca se rematerializa el histórico completo.

## 4. Corte 6 — reconciliación Auth/RBAC read-only
Evidencia vigente: `app/docs/evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json`.

Resultado provider read-only/source-safe:
- 17 usuarios Auth; 17 activos con password provider.
- 13 con alcance TyA por reglas actuales.
- roles existentes: admin3, cliente2, ops2, shopper4, super3, externo1, missing role2.
- operator login ready: 7.
- client login ready: 0.
- shopper login ready: 0.
- 3 shoppers tienen `shopperId` que coincide exactamente con perfil Firestore.
- cliente: 2/2 tienen tenant TyA, pero 0/2 tienen `projectIds=['cinepolis']`.
- shopper: 4/4 tienen tenant TyA, 0/4 tienen proyecto canónico; solo 3/4 tienen perfil shopper exacto y son elegibles para normalización segura.
- scopes legacy observados: `tya` / `tya-piloto`; `tya` no es el proyecto canónico y `tya-piloto` es un proyecto DEV previo. El proyecto Phase A materializado es `cinepolis`.
- Auth writes=0, Rules deploy=0, Hosting deploy=0, PII exportada=0.

Decisión: los claims actuales NO alcanzan para cliente/shopper bajo `firestore.rules`; se requiere delta mínimo y acotado antes de visual real.

## 5. Runtime seguro preparado, aún no desplegado
Archivos backend/core preparados en rama viva:
- `app/core/backend-browser-auth.js`: login Firebase Email/Password interactivo con persistencia SESSION; deriva rol/tenant/proyecto/shopper desde custom claims; no guarda password/token/email/UID en localStorage.
- `app/index-backend-dev.html`: carga el gate Auth solo en el entrypoint DEV protegido.
- `app/core/backend-config-preview-dev.js`: elimina fallback de credencial persistida y exige Auth interactivo.
- `app/core/backend-firebase.js`: lecturas Firestore se acotan al principal autenticado; operador, cliente y shopper dejan de depender de listados globales no autorizados.
- `firestore.rules`: fuente preparada para que visita disponible shopper reconozca el campo canónico `status` y conserve compatibilidad con `estado` legacy.

No se tocó `app/index.html`, no se modificó ningún `app/modules/*` y no se publicaron credenciales.

## 6. Gate de ejecución preparado NO EXECUTE
- Request: `.github/cxorbia-firebase-requests/corte6-auth-rbac-activation.json`.
- Estado: `enabled=false`, `consumed=false`.
- Runner: `.github/workflows/cxorbia-corte6-auth-rbac-activation.yml`.
- Normalizador: `tools/release/cxorbia-corte6-auth-claims-normalize.mjs`.
- Selección fail-closed esperada: 2 cuentas cliente TyA + 3 cuentas shopper TyA con `shopperId` exacto; máximo 5 claim writes.
- No crear usuarios, no cambiar contraseñas, no borrar usuarios, no tocar cuentas no elegibles.
- Cambio de claims: reemplazar scope DEV stale `tya`/`tya-piloto` por `projectId='cinepolis'` y `projectIds=['cinepolis']`, preservando los demás claims.
- Rules: desplegar únicamente `firestore.rules` ya preparada.
- Firestore data writes=0; Hosting deploy=0 en este gate; Storage/HR=0; producción=0; merge=0.

Este gate permanece apagado hasta autorización expresa de Paula en la conversación actual.

## 7. Hosting DEV ya autorizado — NO volver a pedir autorización
`backend/config/phase-a-hosting-dev-execution-request-v1.json` conserva:
- mismo Hosting DEV existente;
- ejecución 0/1;
- `consumed=false`.

La autorización previa se reserva. Solo se consume después de PASS de Auth/RBAC y Rules; no se crea otro Hosting ni proyecto Firebase.

## 8. Siguiente bloque exacto
`AUTORIZAR CORTE6 DELTA MÍNIMO AUTH(5 máx)+FIRESTORE RULES → EJECUTAR/VERIFICAR READINESS → CONSUMIR REDEPLOY HOSTING DEV YA AUTORIZADO → SMOKE REAL ADMIN/OPS/SHOPPER/CLIENTE → CORRECCIÓN FOCAL SI EXISTE → FREEZE → REFRESH AGOSTO/RESOLVER HOLD → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

## 9. Claude / prototipo
- No nueva candidata y no intervención frontend por rutina.
- El selector local de rol no puede autorizar backend; producción debe usar identidad autenticada y claims.
- Solo abrir tarea Claude si el smoke posterior demuestra una diferencia UI reproducible y localizada.
- Backlog P1/P2 preservado: PDF sin gráfica, Excel sin formato final, reportKit/copy de fuentes.

## 10. Academia
Actualizar rutas/manuales para explicar:
- selección de rol ≠ autenticación;
- sesión Firebase + claims determinan acceso real;
- cliente/shopper requieren proyecto autorizado;
- shopper requiere vínculo exacto con `shopperId`;
- disponible se filtra por regla segura, no por selector local;
- errores de permisos pasan a revisión, nunca a ampliación silenciosa de acceso.

## 11. Clasificación
- `Reusable CXOrbia`: browser Auth gate, principal-scoped reads, normalización fail-closed de claims y compatibilidad canónica de estado.
- `Exclusivo cliente`: tenant `tya`, proyecto `cinepolis`, scopes legacy `tya`/`tya-piloto` y corte operativo de agosto.
- `Claude/prototipo`: sin cambio solicitado todavía; validar después del smoke.
- `Academia`: Auth/RBAC, scopes por proyecto y seguridad de visitas disponibles.
- `Sin impacto Claude`: runners, requests, evidencia source-safe y gates.

## 12. Estado seguro
En Corte 6 actual: Auth writes=0; Firestore data writes=0; Rules deploy=0; Hosting deploy=0; nuevo Hosting/proyecto=0; Storage/HR/legacy writes=0; pagos=0; Make/Gemini=0; merge=false; producción=false; PII cruda repo/artifacts=0.
