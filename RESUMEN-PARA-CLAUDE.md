# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Fuente vigente

Consultar índice, checkpoint, `SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-PASS-20260811.md`, evidencia provider snapshot y contratos live-user-admin/prewrite.

## No reabrir

Frontend acumulativo, Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig, direct runner, M4, HR M6, static gate y provider snapshot focal PASS.

## Estado backend

```text
A=REUSE_EXISTING_CANONICAL owner-bound
B/C/D=CREATE_NEW_EPHEMERAL
R4 canonical Cliente=preserved exact
AuthWriteBudget=14
FirestoreWriteBudget=16
RollbackDryRun=PASS
```

No hubo provider writes. Siguiente gate: autorización exacta repair/bootstrap.

## Tarea Claude/prototipo localizada

**No crear pantalla nueva y no rediseñar.** Trabajar únicamente sobre `app/modules/configuracion.js#usuarios` después del repair/bootstrap/readback PASS:

- sustituir localStorage como autoridad por adapter vivo;
- alta exige `TyA completo` o `Proyectos específicos`;
- scope editable y multiselect vivo;
- no exponer claims/fingerprints/provider IDs;
- mantener alta, edición, disable/reactivate y readback;
- no hardcodear `cinepolis` ni otro projectId.

## HR

M6 COMPLETE; M7 validará consumo runtime final. No remapear ni pedir enlace.

## Métrica

**84% certificado; 16% restante. M5=4/8.**

## Siguiente bloque backend

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION`.

Claude no se adelanta al runtime ni crea fallback paralelo.