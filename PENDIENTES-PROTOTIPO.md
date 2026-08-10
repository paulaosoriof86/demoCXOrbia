# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_KEEPER_SOURCE_GATE_STOP_PRE_PROVIDER_FALSE_POSITIVE__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__NO_REQUEST__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-SOURCE-GATE-PREPROVIDER-STOP-RETRY-20260810.md`;
4. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-KEEPER-PREPROVIDER-STOP-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 340/HOLD=0;
- Auth DEV 228, Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial cerrados;
- 20/20 superficies Phase A source-side;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`.

## 3. P0 vivo

`C6 AUTH DUPLICATE KEEPER SOURCE-GATE FALSE-POSITIVE ROOTFIX → ONE READ FOCAL`.

La adjudicación anterior dejó cinco pares congelados. El último bloque no alcanzó provider porque el gate source-only buscaba por substring `creationTime`/`lastSignInTime` y chocaba con flags negativos de seguridad.

```text
providerReadsCurrentBlock=0
providerRequestEmitted=false
providerWorkflowCreated=false
sourceGate/tool transitorios=removed
```

## 4. No hacer

- no reconstruir 340 identidades;
- no repetir PREWRITE ni Activation;
- no repair ni nuevo smoke con la autorización consumida;
- no compensar duplicados desde frontend;
- no relajar roles/tenant/project/shopper scope;
- no nuevo proyecto, rama o PR;
- no deploy, merge ni producción sin autorización específica.

## 5. Ruta corta

Corregir solo la aserción temporal del source gate. Con PASS, realizar una única lectura provider de los mismos diez candidate fingerprints. Si keeper/retire queda inequívoco, recién entonces solicitar un repair Auth mínimo separado con snapshot/readback/rollback; después, un smoke acumulativo read-only y gate de cutover.

## 6. Seguridad

El bloque más reciente terminó pre-provider con cero reads/writes, cero deploy, cero merge y producción intacta.
