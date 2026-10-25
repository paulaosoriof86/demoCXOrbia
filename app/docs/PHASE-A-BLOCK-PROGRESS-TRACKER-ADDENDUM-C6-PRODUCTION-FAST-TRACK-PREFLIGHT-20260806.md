# PHASE A — Tracker addendum C6 fast-track de producción source-only

**Fecha:** 2026-08-06

| Bloque | Estado | Evidencia | Bloqueo siguiente |
|---|---|---|---|
| HR v4 | HOLD terminal | request `ac2032ec...`, sin run/job/checkpoint recuperado | reconciliar evidencia tardía |
| Identidad Shopper | PASS source-only | 340 filas, HOLD=0 | gate Auth write separado |
| Configuración limpia vigente | PASS auditada | proyecto, target, sitio, servicio, región, `app` y UTF-8 | preservada |
| Estrategia PROD | HOLD | gate source-only PASS sintaxis; contrato ausente | autorizar promoción existente o proyecto limpio separado |
| Smoke acumulativo | HOLD | no ejecutado | después de HR y Auth |
| Cutover | HOLD | sin autorización ni rollback final | último bloque |

## Gate de producción

```text
tool=tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs
decision=HOLD_PRODUCTION_STRATEGY_UNMATERIALIZED
allowed= PROMOTE_EXISTING_CLEAN_PROJECT | SEPARATE_CLEAN_PROD_PROJECT
```

El gate no impone una topología. Exige autorización expresa, configuración coherente y `legacyProjectReuseForBackend=false`.

## Avance real

Se dejó de esperar pasivamente: la configuración vigente quedó auditada y la siguiente decisión se redujo a una estrategia explícita y verificable de promoción, sin crear infraestructura ni desplegar por inferencia.

## Seguridad

Cero provider/HR/Firestore/Auth/Rules/Storage writes, deploy, merge o producción.
