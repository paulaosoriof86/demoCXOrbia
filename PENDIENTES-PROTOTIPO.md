# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Cerrado

Frontend acumulativo; Auth 228; Activation/readback/rollback; SKIP13; MultiAuth; HashConfig; direct runner; M4; HR M6; live-user-admin source + static gate; provider snapshot focal PASS; write budget + rollback dry-run.

## Provider snapshot

```text
AuthPopulation=228
A=REUSE_EXISTING_CANONICAL owner-bound
B/C/D=CREATE_NEW_EPHEMERAL
R4 canonical Cliente=preserved exact
historicalEnabled=8
AuthWriteBudget=14
FirestoreWriteBudget=16
RollbackDryRun=PASS
```

No repetir provider snapshot.

## Pendiente vivo

1. autorización exacta C6 STAFF REPAIR/BOOTSTRAP con Auth=14 / Firestore=16 / deletes=0;
2. ejecución focal create-before-retire + readback/rollback evidence;
3. wiring localizado Usuarios & Permisos;
4. M7 smoke acumulativo multirol con HR viva;
5. M8 validación humana;
6. M9 cutover;
7. M10 post-smoke/freeze.

No falta información empresarial para solicitar el punto 1.

## Métrica

**84% certificado; 16% restante. M5=4/8.**

## No hacer

No repetir owner/scope/HR/static/provider; no hardcode; no wildcard; no reabrir 340; no nueva rama/PR/candidata; no Auth/Firestore writes sin autorización exacta; no deletes; no deploy/merge/producción sin gate.