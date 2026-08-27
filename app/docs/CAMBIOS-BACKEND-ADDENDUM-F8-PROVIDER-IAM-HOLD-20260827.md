# CAMBIOS-BACKEND — ADDENDUM F8 PROVIDER SECURITY / IAM HOLD

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-PROVIDER-SECURITY-IAM-HOLD-01`  
**MASTER_PLAN:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1` `1.1.0` `FROZEN`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Objetivo del bloque

Cerrar causalmente F7-P1-002/F8 provider security readback sin reabrir fases cerradas, sin tocar el release congelado y sin provider mutation no autorizada.

## Qué se hizo

1. Se reparó `tools/qa/tya-f8-provider-security-quota-readonly.mjs` para separar nombres de secreto crudo de metadata derivada (`*_SHA256`, `*_HASH`, `*_FINGERPRINT`, `*_EXPIRES_AT`, `*_EXPIRY`, etc.).
2. El run `33117362096` ejecutó nuevamente el predeploy read-only existente sobre HEAD `08ac5d8b4d2ad4a3eb1b8d01dd18bdc8c22526ec`.
3. Shopper volvió a pasar: identidad exacta, 6 visitas propias, 15 períodos, 660 visitas, 214 shoppers, sin duplicados y con gate legal visible/no automatizado.
4. Provider readback confirmó Cloud Run exacto en `cxorbia-live-hr-dev-00013-rns`, IAM legible, Service Usage 4/4 ENABLED y quota readbacks 4/4 PASS sin overrides.
5. La falsa alarma de variables de entorno quedó cerrada: `plaintextSensitiveKeyCount=0`; `CXORBIA_DEV_VISUAL_PROFILE_TOKEN_SHA256` y `CXORBIA_DEV_VISUAL_PROFILE_TOKEN_EXPIRES_AT` son metadata derivada y no secreto crudo.
6. Quedó un único bloqueo reproducible: Secret Manager API está ENABLED, pero la única credencial DEV disponible carece de `secretmanager.secrets.list`; las dos rutas de credencial alterna históricas no están presentes en Actions.
7. Se verificó que no se leyó ni exportó ningún payload de Secret Manager.
8. Se congeló el STOP como `MECHANISM_P0_STOP_PROVIDER_IAM_READ_CAPABILITY`, `productP0Proven=false`, y se dejó provider mutation sin autorización.

## Evidencia

- run: `33117362096`;
- job: `98675327470`;
- artifact: `9665056200`;
- artifact digest: `sha256:7fb13d6565df3fa8af147e1121b39bf1dff5098947d8734fcc3fb1fdc0303517`;
- canonical evidence: `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`.

## Archivos creados/tocados

- `tools/qa/tya-f8-provider-security-quota-readonly.mjs` — clasificación segura de metadata derivada y fail-closed para secretos reales.
- `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json` — evidencia canónica del HOLD IAM.
- `backend/config/cxorbia-phase-a-continuity-lock.json` — schema `3.9.0`, cursor F8 IAM HOLD.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` — autoridad/cursor actualizado.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — checkpoint actualizado.
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md` — release congelado preservado.
- `app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md` — readiness preservado en 95/100.
- `RESUMEN-PARA-CLAUDE.md` — sin cambio frontend; bloqueo IAM no corresponde a Claude.
- `PENDIENTES-PROTOTIPO.md` — único bloqueo inmediato y secuencia posterior.
- este addendum — registro obligatorio del bloque.

Cambios previos del mismo subbloque también ajustaron el workflow predeploy existente para evaluar rutas de credencial ya existentes; no se creó workflow, rama ni PR nuevo.

## Seguridad / presupuesto

- provider reads: sí, únicamente los autorizados de precheck;
- provider writes: 0;
- Firestore/Auth/HR/Storage/Rules/pagos/Make/Gemini/data writes: 0;
- deploys/rebuilds/reimports: 0;
- merge: false;
- secret values read/exported: false;
- release F6: sin cambios.

## Frontera de autorización

Para cerrar el único HOLD se necesita autorización explícita de Paula para una mutación IAM temporal y mínima: otorgar `roles/secretmanager.viewer` al principal DEV de precheck, ejecutar el readback de metadata y revocar inmediatamente el rol. El alcance autorizado no debe incluir `secretmanager.versions.access` ni lectura de payloads.

## Clasificación obligatoria

- **Reusable CXOrbia:** patrón de precheck provider con capability aggregation, clasificación de metadata derivada y IAM temporal de mínimo privilegio.
- **Exclusivo TyA:** proyecto `cxorbia-backend-dev`, servicio `cxorbia-live-hr-dev` y credencial DEV asociada.
- **Claude/prototipo:** sin cambio UI, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional; gate legal humano preservado.
- **Sin impacto Claude:** security harness, IAM capability, evidence, continuity y docs.

## Siguiente exacto

`WAIT_FOR_EXPLICIT_F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_AUTHORIZATION`.
