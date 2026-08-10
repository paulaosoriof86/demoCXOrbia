# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_OWNERSHIP_RECONCILIATION_HUMAN_DECISION_REQUIRED_4__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__ZERO_DATA_WRITES__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md`;
4. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-OWNERSHIP-SOURCE-SAFE-HUMAN-DECISION-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 340/HOLD=0;
- Auth DEV 228, Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial;
- duplicate-keeper source rootfix PASS;
- provider one-read anterior consumido, sin segunda lectura;
- `fd891...` cerrado sin acceso TyA efectivo;
- 20/20 superficies Phase A source-side;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`.

## 3. Pendiente vivo

`C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE — NO PROVIDER / NO REPAIR`.

La reconciliación source-safe vigente cerró:

```text
1acdcb3782b7cf351056 = HUMAN_OWNERSHIP_DECISION_REQUIRED
2c4d19f2b066835473d3 = HUMAN_OWNERSHIP_DECISION_REQUIRED
54225792eeb65f6739c0 = HUMAN_OWNERSHIP_DECISION_REQUIRED
ae2f920fe6d9ce1fdd82 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

A–C: ninguno de los candidates corresponde al staff canónico importado; no existe ancla para elegir entre los dos históricos de cada par.

D: ambos candidates son históricos; el Cliente canónico actual es otro principal ya materializado/validado. No existe ancla para escoger uno de los históricos como keeper.

## 4. No hacer

- no repetir provider para obtener los mismos discriminadores;
- no reconstruir 340 identidades;
- no PREWRITE/Activation;
- no repair Auth sin decisión humana inequívoca;
- no nuevo smoke;
- no compensar desde frontend ni relajar RBAC;
- no usar antigüedad, orden, nombre, email/UID/shopperId crudos o visual como desempate;
- no nuevo proyecto/rama/PR;
- no deploy, merge ni producción.

## 5. Ruta corta

Capturar únicamente una decisión humana de ownership/disposition para los cuatro grupos. Después, si la decisión implica una acción técnica inequívoca, preparar un repair focal separado con snapshot/readback/rollback. Si la decisión determina que un par debe conservarse solo como histórico porque existe un principal canónico externo, preparar solo la disposición correspondiente.

## 6. Seguridad

Bloque de reconciliación vigente: providerReads0, Auth/IAM/Firestore/HR/Rules/Storage writes0, deploy0, merge=false, production=false.
