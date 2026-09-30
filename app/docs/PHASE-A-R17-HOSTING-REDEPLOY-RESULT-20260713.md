# Phase A — resultado redeploy Hosting DEV visible TyA R17

Fecha: 2026-07-13

## Decisión

`PASS_HOSTING_DEV_VISIBLE_TYA_R17_REMOTE_VERIFIED`

## Ambiente

- Firebase project: `cxorbia-backend-dev`;
- Hosting target: `cxorbia-dev`;
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r17=visible`;
- build: `tya-visible-r17-source-safe`;
- commit desplegado: `cf4c845722e2bbe2b401b2b332ff9f4d2f6cb803`.

## Redeploy

Run `29285177647`: SUCCESS.

Todos los pasos pasaron:

- autorización exacta;
- source lock V110;
- predeploy;
- drift;
- build HR source-safe;
- binding visible R17;
- smoke local visible y 13 rutas;
- credencial DEV sanitizada;
- Firebase Hosting access;
- deploy Hosting-only;
- proof remoto;
- smoke remoto;
- cleanup de credencial.

Artifact:

- `visible-tya-r17-hosting-redeploy-report`;
- digest `sha256:756049ce4eb22e279b21f93a74e98e88541a262eb2937cb3141868a006acf9d4`.

## Verificación remota independiente

Run `29285540738`: SUCCESS.

- proof exacto del commit desplegado;
- login TyA / GT / HN;
- sin badge Demo comercial;
- proyecto raíz Cinépolis;
- 14 periodos únicos;
- JUL 2026 activo;
- 616 visitas históricas;
- 44 visitas del periodo activo;
- 210 shoppers source-safe;
- 0 proyectos demo genéricos;
- 13/13 rutas críticas;
- 0 blockers, warnings, errores de consola o página;
- imported y production false.

Artifact:

- `phase-a-remote-visible-tya-r17-smoke-report`;
- digest `sha256:8b849b2248c2d277a2b8434035d4e2679818a89f7a630b0615fdd8fe1277b1f7`.

## Fail-closed preservado

- Intento 1 `29284644200`: bloqueado por drift antes de provider/deploy.
- Intento 2 `29284794416`: bloqueado por semántica heredada proyecto/periodo antes de credencial/provider/deploy.
- Ambos dejaron cero writes y cero deploy.

## Cleanup

- marcador de autorización de una sola ejecución: eliminado;
- workflow de deploy de una sola ejecución: eliminado;
- drift gate: permite sus rutas históricas únicamente mientras permanezcan eliminadas;
- remote smoke canónico: restaurado manual-only y parametrizable.

## Hallazgos no bloqueantes

- `Admin Demo` sigue como identidad temporal hasta Auth real.
- `Mi Día` puede mostrar calendario de junio mientras el periodo activo es JUL 2026; pendiente P1 Claude/prototipo.
- gap shoppers 210/213 continúa en revisión.

## Gates preservados

- Firestore writes: HOLD;
- Auth writes: HOLD;
- Storage writes: HOLD;
- imports: HOLD;
- rules/Functions: HOLD;
- Make/Gemini: HOLD;
- pagos: HOLD;
- producción: HOLD.

## Clasificación

- **Reusable CXOrbia:** deploy Hosting-only con proof exacto, smoke visible y cleanup de autorización temporal.
- **Exclusivo cliente:** TyA/Cinépolis y conteos.
- **Claude/prototipo:** P1 calendario Mi Día vs periodo; identidad temporal hasta Auth.
- **Academia:** validar ambiente, fuente, proyecto y periodo.
- **Sin impacto Claude:** credenciales temporales, hashes, workflows y gates.
