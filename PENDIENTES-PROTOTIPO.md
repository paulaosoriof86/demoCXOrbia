# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- Auth 228 + Activation/readback/rollback PASS;
- SKIP13, multi-Auth, HashConfig y direct runner;
- HR viva M6: 34 GT + 10 HN = 44;
- referencias empresariales A/B/C/D;
- scope inicial: `TYA_COMPLETE` para los cuatro;
- target claims/digests source-safe A/B/C/D;
- contrato live-user-admin v1.1;
- backend executable source materializado;
- **static live-user-admin source gate = PASS terminal**.

## 2. Evidencia static gate

```text
checkoutHead=9d16521ac67c7a9fa7cd6de393e778bc6a05876b
runId=31513528713
jobId=93852916856
decision=PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
blockers=[]
warnings=[]
```

El preflight obligatorio valida el gate live-user-admin y no habilitó perfil provider/browser.

## 3. Regla de alcance de usuarios — cerrada

Cada alta exige `TyA completo` o `Proyectos específicos`; el alcance es editable después. `SPECIFIC_PROJECTS` usa inventario vivo; `TYA_COMPLETE` usa projectIds exactos, sin wildcard, y requiere revisión explícita ante proyecto nuevo.

## 4. Prewrite focal source-only — preparado

Nuevo contrato:

```text
backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json
```

Distingue target D adicional de Operaciones del histórico `R4_CLIENT_HISTORICAL`, preserva disable-only/no-delete y deja snapshot/readback/rollback antes de cualquier write. El viejo cap Auth=14 no se reutiliza; el cap final queda pendiente del snapshot read-only.

## 5. Pendiente vivo inmediato

1. `C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY`;
2. congelar write budget exacto + rollback dry-run con PASS;
3. autorización específica de repair/bootstrap Auth/Firestore;
4. ejecución focal + readback/rollback;
5. wiring localizado de `app/modules/configuracion.js#usuarios` al adapter vivo;
6. M7 smoke acumulativo multirol contra HR viva;
7. M8 validación humana;
8. M9 cutover autorizado;
9. M10 post-smoke/freeze.

El snapshot debe detenerse antes de writes ante drift, colisión o input transitorio faltante; no reabre el universo 340.

## 6. Métrica estable

```text
M4=5/5 COMPLETE
M5=3/8 COMPLETE
M6=5/5 COMPLETE
```

**Avance certificado: 83%. Restante: 17%.**

## 7. No hacer

- no volver a pedir owners/scopes/HR;
- no repetir el static gate;
- no hardcodear staff, emails o projectIds en UI;
- no wildcard de proyectos;
- no reabrir Auth histórico/340 identidades;
- no nueva candidata/rama/PR;
- no rediseñar Usuarios & Permisos;
- no provider writes antes de snapshot/prewrite PASS y autorización específica;
- no deploy/merge/producción sin gate correspondiente.