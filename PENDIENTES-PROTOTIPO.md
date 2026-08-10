# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_HUMAN_OWNERSHIP_DECISION_CAPTURE_READY__PAULA_DECISION_REQUIRED__ZERO_PROVIDER_READS__ZERO_REPAIR__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md`;
4. `app/docs/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.md`;
5. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 340/HOLD=0;
- Auth DEV 228, Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial;
- provider one-read anterior consumido, sin segunda lectura;
- `fd891...` cerrado sin acceso TyA efectivo;
- ownership source-safe reconciliation cerrada;
- 20/20 superficies Phase A source-side;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`.

## 3. Pendiente vivo

La matriz de decisión humana está lista. Falta una disposición por grupo:

```text
1acdcb3782b7cf351056 = PAULA_DECISION_REQUIRED
2c4d19f2b066835473d3 = PAULA_DECISION_REQUIRED
54225792eeb65f6739c0 = PAULA_DECISION_REQUIRED
ae2f920fe6d9ce1fdd82 = PAULA_DECISION_REQUIRED
```

A–C: `KEEP_ONE_MEMBER` requiere que Paula seleccione el fingerprint exacto; `PRESERVE_BOTH_PENDING_OWNER_MAPPING` no requiere distinguir members; `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` requiere confirmar el principal canónico externo correcto.

D: existe un Cliente canónico externo ya validado; Paula puede aprobar `CANONICAL_EXTERNAL_KEEP_HISTORICAL_PAIR_NONCANONICAL_PENDING_RETIRE` sin seleccionar entre los dos históricos.

## 4. No hacer

- no provider read;
- no reconstrucción de 340 identidades;
- no PREWRITE/Activation;
- no repair Auth dentro de este bloque;
- no nuevo smoke;
- no compensar desde frontend ni relajar RBAC;
- no usar antigüedad, orden, nombre, email/UID/shopperId crudos o visual como desempate;
- no nuevo proyecto/rama/PR;
- no deploy, merge ni producción.

## 5. Ruta corta

Capturar las cuatro decisiones humanas. Solo después, si alguna implica cambio Auth inequívoco, solicitar un repair focal separado con snapshot/readback/idempotencia/rollback dry-run.

## 6. Seguridad

Bloque actual: providerReads0, Auth/IAM/Firestore/HR/Rules/Storage writes0, repair=false, deploy0, merge=false, production=false.
