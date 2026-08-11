# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-PASS-20260811.md`;
4. `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json`;
5. `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json`;
6. `backend/contracts/c6-live-user-admin-v1.json`;
7. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y módulos Phase A;
- Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig y direct runner;
- M4 owners/scopes iniciales (`TYA_COMPLETE` para los cuatro);
- HR viva M6;
- static live-user-admin source gate;
- provider snapshot focal: **PASS y consumido una sola vez**.

## 3. Backend / provider state

Provider snapshot PASS:

```text
AuthPopulation=228
A=REUSE_EXISTING_CANONICAL owner-bound; no role uniqueness
B=CREATE_NEW_EPHEMERAL
C=CREATE_NEW_EPHEMERAL
D=CREATE_NEW_EPHEMERAL
R4 canonical Cliente=preserved exact
AuthWriteBudget=14
FirestoreWriteBudget=16
RollbackDryRun=PASS
```

No hubo provider writes. El siguiente gate es autorización exacta de repair/bootstrap.

## 4. Tarea Claude/prototipo localizada — Usuarios & Permisos

**No crear pantalla nueva y no rediseñar.** Trabajar únicamente sobre `app/modules/configuracion.js#usuarios` cuando el repair/bootstrap backend quede ejecutado y el adapter vivo tenga autorización/runtime correspondiente.

Cambios funcionales requeridos:

1. sustituir `localStorage` como autoridad por el adapter vivo autorizado;
2. en alta, exigir `Alcance de proyectos`: `TyA completo` o `Proyectos específicos`;
3. `Proyectos específicos` usa multiselección desde inventario vivo;
4. en edición permitir cambiar alcance y rol mediante backend;
5. no mostrar claims, fingerprints, provider email ni UIDs técnicos;
6. mostrar `scopeReviewRequired` como aviso humano/accionable;
7. mantener alta, edición, deshabilitación y reactivación; no hard delete por defecto;
8. hacer readback después de guardar; no fingir éxito local.

`TYA_COMPLETE` se expande a projectIds exactos; no hardcodear `cinepolis` ni otro projectId en UI.

## 5. Incidente técnico sin impacto frontend

El primer request provider abortó antes de cualquier provider read por un nested-heredoc defectuoso del workflow. Se corrigió el mismo workflow, sin crear uno nuevo; el segundo request realizó la primera y única observación efectiva y terminó PASS. No requiere acción Claude.

## 6. HR

M6 permanece COMPLETE. M7 validará consumo runtime final; no remapear ni pedir enlace.

## 7. Métrica

**Avance certificado: 84%. Restante: 16%.**

```text
M4=5/5 COMPLETE
M5=4/8 COMPLETE
M6=5/5 COMPLETE
```

## 8. Siguiente bloque backend

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION`.

Claude no debe adelantarse al repair/bootstrap ni crear fallback paralelo. El wiring se aplica únicamente cuando el backend quede ejecutado/readback PASS y tenga gate/autorización correspondiente.
