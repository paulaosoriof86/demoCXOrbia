# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- Auth 228 + Activation/readback/rollback PASS;
- SKIP13, MultiAuth, HashConfig y direct runner;
- M4 owners/scopes iniciales: `TYA_COMPLETE` para los cuatro;
- HR viva M6: 34 GT + 10 HN = 44;
- live-user-admin contract + executable source;
- static live-user-admin gate PASS;
- provider snapshot focal PASS y consumido una sola vez;
- write budget exacto + rollback dry-run congelados.

## 2. Provider snapshot cerrado

```text
AuthPopulation=228
AuthListObservations=1
FirestoreDocumentReads=2
A=REUSE_EXISTING_CANONICAL owner-bound
B=CREATE_NEW_EPHEMERAL
C=CREATE_NEW_EPHEMERAL
D=CREATE_NEW_EPHEMERAL
R4 canonical Cliente=preserved exact
historicalEnabled=8
```

Budget:

```text
Auth creates=3
claims=3
disables=8
Auth total=14
Auth deletes=0
userDocs=4
auditLogs=12
Firestore total=16
Firestore deletes=0
rollbackDryRun=PASS
```

No repetir provider snapshot.

## 3. Regla de alcance de usuarios — cerrada

Cada alta exige `TyA completo` o `Proyectos específicos`; editable después. `SPECIFIC_PROJECTS` usa inventario vivo; `TYA_COMPLETE` usa projectIds exactos, sin wildcard, y requiere revisión explícita ante proyecto nuevo.

## 4. Pendiente vivo inmediato

1. autorización exacta `C6 STAFF REPAIR/BOOTSTRAP` con budget Auth=14 / Firestore=16 y cero deletes;
2. ejecución focal create-before-retire + readback + rollback evidence;
3. wiring localizado de `app/modules/configuracion.js#usuarios` al adapter vivo;
4. M7 smoke acumulativo multirol contra HR viva;
5. M8 validación humana;
6. M9 cutover autorizado;
7. M10 post-smoke/freeze.

No falta nueva información empresarial para solicitar la autorización del punto 1.

## 5. Métrica estable

```text
M4=5/5 COMPLETE
M5=4/8 COMPLETE
M6=5/5 COMPLETE
```

**Avance certificado: 84%. Restante: 16%.**

## 6. No hacer

- no volver a pedir owners/scopes/HR;
- no repetir static gate ni provider snapshot;
- no hardcodear staff, emails o projectIds en UI;
- no wildcard de proyectos;
- no reabrir Auth histórico/340 identidades;
- no nueva candidata/rama/PR;
- no rediseñar Usuarios & Permisos;
- no Auth/Firestore writes sin autorización exacta;
- no deletes;
- no deploy/merge/producción sin gate correspondiente.
