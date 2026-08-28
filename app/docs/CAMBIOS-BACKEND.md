# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-27  
**Estado:** `F8_HUMAN_OWNER_ROUTE_OBSERVED__SECURE_EXECUTION_BRIDGE_HOLD__PHASE_A_100__PROD_READINESS_95`

## 2026-08-27 — F8 · Owner humano observado; carril seguro de ejecución aún no disponible

### Resultado

Se continuó sin trasladar ejecución manual a Paula y sin reabrir R24/Corte 4/F7.

La evidencia visual de Google Cloud Console sobre el proyecto exacto `cxorbia-backend-dev` demuestra una identidad humana con rol `Propietario` / `roles/owner`. Esto cierra la hipótesis anterior de que no existía ninguna ruta administrativa externa.

No se persiste en el repositorio el identificador de la persona/cuenta. Tampoco se declara todavía `resourcemanager.projects.setIamPolicy` como permiso efectivo probado: debe verificarse desde una sesión autenticada antes de cualquier grant.

### Diagnóstico focalizado del mecanismo

Se revisó únicamente si ya existía un puente seguro y reutilizable para evitar intervención manual:

- búsqueda repo de `workload_identity_provider`: sin resultado;
- búsqueda repo de `google-github-actions/auth`: sin resultado;
- búsqueda repo de `id-token`: sin resultado;
- universo vivo de workflows: sin ruta OIDC/WIF demostrada;
- conector GCP/Firebase/IAM disponible en esta sesión: no existe.

Conclusión: la ruta humana Owner **existe**, pero el mecanismo actual no puede usar esa sesión de forma automatizada. Crear WIF, service account, credencial o IAM binding sería una nueva mutación provider y no está autorizado.

### Evidencia nueva

`app/docs/evidence/RC15-F8-HUMAN-OWNER-IAM-ROUTE-LATEST.json`.

Decisión: `PASS_HUMAN_ADMIN_ROUTE_OBSERVED__HOLD_SECURE_EXECUTION_BRIDGE`.

Clasificación: `EXTERNAL_ADMIN_ROUTE_OBSERVED__MECHANISM_BRIDGE_UNAVAILABLE`; `productP0Proven=false`.

### Estado seguro

PHASE_A=`100/100`; PRODUCTION_REAL_READINESS=`95/100`; release F6 intacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; deploy/rebuild/reimport/merge=`0`.

El intento temporal IAM anterior permanece consumido y no se reejecuta. No se creó workflow, rama, PR, credencial, cuenta de servicio, WIF ni binding IAM.

### Incidencia de tooling y reconciliación

Durante la escritura documental se creó por error un archivo transitorio `app/docs/CONTINUITY-NOOP.txt` mediante una llamada incorrecta al conector. La incidencia fue detectada inmediatamente y el archivo fue eliminado del árbol vivo en el commit de reconciliación. Readback actual del path=`404/Not Found`; no existe residuo funcional ni provider-side effect. Los commits transitorios permanecen únicamente en el historial Git y no alteraron backend, runtime, release ni producción.

### Archivos sincronizados

- `backend/config/cxorbia-phase-a-continuity-lock.json`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md`;
- `app/docs/evidence/RC15-F8-HUMAN-OWNER-IAM-ROUTE-LATEST.json`;
- `app/docs/RESUMEN-PARA-CLAUDE.md`;
- `app/docs/PENDIENTES-PROTOTIPO.md`;
- `app/docs/CAMBIOS-BACKEND.md`.

### Clasificación obligatoria

- **Reusable CXOrbia:** separar identidad humana Owner de credencial CI; no convertir una sesión humana en secreto; preferir puente federado/seguro y capability test antes de mutación.
- **Exclusivo cliente:** frontera administrativa del proyecto `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio UI; no nueva candidata, rediseño ni reauditoría frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** IAM/provider control-plane, release lock y evidencia.

## Siguiente bloque exacto

`F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`.

No acción manual solicitada a Paula en este corte. No provider mutation autorizada. El master plan V1.1 permanece congelado; F8→F9→F10 no cambia.

## 2026-08-27 — F8 · antecedentes preservados

El intento single-use previo run `33118612042` confirmó que la credencial DEV automatizada carece de `resourcemanager.projects.setIamPolicy`; grantAttempted=false, metadata readback=false, providerWrites=0. La autorización está consumida y replay=false.

La evidencia de ruta Owner no revive esa autorización ni autoriza grant, deploy o cutover.
