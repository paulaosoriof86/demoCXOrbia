# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-STATIC-PASS-PREWRITE-READY-20260811.md`;
4. `app/docs/evidence/C6-LIVE-USER-ADMIN-STATIC-GATE-LATEST.json`;
5. `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json`;
6. `backend/contracts/c6-live-user-admin-v1.json`;
7. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo y módulos Phase A;
- Auth 228, Activation/readback/rollback, SKIP13, multi-Auth, HashConfig y direct runner;
- HR viva M6;
- owners y scopes iniciales: `TYA_COMPLETE` para los cuatro;
- static source gate live-user-admin: **PASS terminal**.

## 3. Backend ya preparado y validado source-only

Existe source executable para administración viva de usuarios:

```text
backend/runtime/hr-live-service/user-admin.mjs
```

Routing/packaging source preparado en `server.mjs`, `package.json`, `Dockerfile` y `firebase.json`.

El gate terminal se ejecutó en el checkout vivo mediante el runner read-only existente:

```text
runId=31513528713
jobId=93852916856
PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
```

No se habilitó perfil provider/browser y no hubo deploy.

## 4. Tarea Claude/prototipo localizada — Usuarios & Permisos

**No crear pantalla nueva y no rediseñar.** Trabajar únicamente sobre `app/modules/configuracion.js#usuarios` cuando backend tenga autorización/runtime correspondiente.

Cambios requeridos:

1. sustituir `localStorage` como autoridad por el adapter vivo autorizado;
2. en alta, exigir `Alcance de proyectos`: `TyA completo` o `Proyectos específicos`;
3. `Proyectos específicos` usa multiselección desde inventario vivo;
4. en edición permitir cambiar alcance y rol mediante backend;
5. no mostrar claims, fingerprints, provider email ni UIDs técnicos;
6. mostrar `scopeReviewRequired` como aviso humano/accionable;
7. mantener alta, edición, deshabilitación y reactivación; no hard delete por defecto;
8. hacer readback después de guardar; no fingir éxito local.

`TYA_COMPLETE` se expande a projectIds exactos; no hardcodear `cinepolis` ni otro projectId en UI.

## 5. Prewrite backend

`backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json` distingue target D adicional de Operaciones del histórico `R4_CLIENT_HISTORICAL`. El cap viejo Auth=14 no se reutiliza; el cap final se congela después del provider snapshot read-only.

Esto es backend/seguridad y **no cambia la UI**.

## 6. HR

M6 permanece COMPLETE. M7 validará consumo runtime final; no remapear ni pedir enlace.

## 7. Métrica

**Avance certificado: 83%. Restante: 17%.**

```text
M4=5/5 COMPLETE
M5=3/8 COMPLETE
M6=5/5 COMPLETE
```

## 8. Siguiente bloque backend

`C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY`.

Claude no debe adelantarse a un runtime no desplegado ni crear fallback paralelo. El wiring se aplica únicamente cuando backend tenga gate/autorización correspondiente.