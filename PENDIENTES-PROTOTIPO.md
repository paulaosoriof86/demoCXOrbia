# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PROVIDER__NO_RUNTIME_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- Auth 228 + Activation/readback/rollback PASS;
- SKIP13, multi-Auth, HashConfig y direct runner;
- HR viva M6: 34 GT + 10 HN = 44;
- referencias empresariales A/B/C/D;
- scope inicial: `TYA_COMPLETE` para los cuatro;
- projectIds actuales source-safe resueltos a `[cinepolis]` sin wildcard;
- target claims/digests source-safe A/B/C/D;
- contrato live-user-admin v1.1;
- backend executable source materializado.

## 2. Regla de alcance de usuarios — ya definida

Cada alta debe exigir:

```text
TyA completo
or
Proyectos específicos
```

Y el usuario autorizado debe poder modificar ese alcance posteriormente.

Criterio:

```text
create -> scope obligatorio
edit -> scope editable
SPECIFIC_PROJECTS -> multiselect desde inventario vivo
TYA_COMPLETE -> projectIds exactos, no wildcard
nuevo proyecto + TYA_COMPLETE existente -> scopeReviewRequired hasta confirmar
save -> claims + tenant user doc + audit + readback
```

No hardcodear `cinepolis` en la UI: es únicamente el projectId canónico actual demostrado.

## 3. Backend source ya preparado

```text
backend/runtime/hr-live-service/user-admin.mjs
backend/runtime/hr-live-service/server.mjs
backend/runtime/hr-live-service/package.json
backend/runtime/hr-live-service/Dockerfile
firebase.json
backend/contracts/c6-live-user-admin-v1.json
tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs
```

No hay deploy ni writes provider.

## 4. Pendiente vivo inmediato

1. ejecutar terminalmente `tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs` contra el checkout vivo;
2. únicamente con PASS, construir PREWRITE focal A-D + bootstrap adicional con snapshot y rollback dry-run;
3. autorización específica para Auth/Firestore writes;
4. readback/rollback;
5. wiring localizado de `app/modules/configuracion.js#usuarios` al adapter vivo;
6. M7 smoke acumulativo multirol contra HR viva;
7. M8 validación humana;
8. M9 cutover autorizado;
9. M10 post-smoke/freeze.

No falta información empresarial para el punto 1.

## 5. Métrica estable

```text
M4=5/5 COMPLETE
M5=2/8 COMPLETE
M6=5/5 COMPLETE
```

**Avance certificado: 82%. Restante: 18%.**

## 6. No hacer

- no volver a pedir owners/scopes/HR;
- no hardcodear staff, emails o projectIds en UI;
- no wildcard de proyectos;
- no reabrir Auth histórico;
- no nueva candidata/rama/PR;
- no rediseñar Usuarios & Permisos;
- no provider/Auth/Firestore writes antes del gate y autorización;
- no deploy/merge/producción sin gate correspondiente.