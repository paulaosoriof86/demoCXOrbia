# Phase A module readiness matrix TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Evitar reprocesos al conectar la fuente/base operativa de TyA. Cada modulo critico debe tener readiness verificable antes de cualquier conexion real, import real, Auth real, Firestore write, provider writeback o produccion.

Este bloque no conecta base real, no activa Auth, no escribe Firestore, no importa datos, no toca frontend y no toca produccion.

## Archivos agregados

- `backend/contracts/phase-a-module-readiness-matrix-v1.json`
- `backend/config/phase-a-module-readiness-matrix.source-safe.json`
- `tools/release/tya-module-readiness-matrix-validate.mjs`

## Por que es urgente

En TyA se han repetido errores de cosas ya conocidas: proyecto/periodo, lectura HR, usuarios/roles, certificaciones, liquidaciones, cursos y rutas operativas. Desde este bloque, no basta con que algo este documentado: cada modulo debe pasar una matriz verificable.

## Modulos cubiertos

- tenant/proyecto/periodo;
- HR/source;
- usuarios/personas/roles/scopes;
- shoppers/perfiles protegidos;
- visitas/asignaciones;
- postulaciones/agendamiento/reprogramacion/cancelacion;
- Academia/cursos/manuales;
- certificaciones/carryover;
- liquidaciones/pagos;
- notificaciones/outbox;
- reviewQueue/conflictos;
- auditEvents;
- gates de integraciones;
- branding/PWA;
- switch CX.data/backend.

## Regla anti-reproceso

Antes de conectar datos reales, cada modulo debe tener:

- ruta de configuracion;
- contrato backend;
- politica source-safe;
- politica protegida/Auth si aplica;
- reviewQueue si puede haber conflicto;
- auditEvents para acciones criticas;
- impacto Claude/prototipo documentado;
- impacto Academia si corresponde;
- separacion TyA especifico vs reusable CXOrbia.

## Comando seguro

```bash
node tools/release/tya-module-readiness-matrix-validate.mjs --out .tmp/module-readiness
```

El comando genera reporte JSON/MD y no llama Firebase, no llama Firestore, no llama Auth, no escribe datos, no importa y no despliega reglas.

## Impacto Phase A TyA

Este bloque obliga a que TyA no vuelva a conectarse de forma incompleta. Si un modulo no esta listo, el gate debe fallar antes de conectar base/fuente real.

## Impacto reusable CXOrbia

La misma matriz aplica a nuevos tenants/proyectos: ningun cliente nuevo deberia conectarse a datos reales sin validar proyecto, periodo, source, usuarios, cursos, certificaciones, pagos, reviewQueue y auditEvents.

## Impacto Claude/prototipo

Claude debe reflejar esto como patron generico:

- configuracion por tenant/proyecto;
- proyecto separado de periodo;
- source/HR enmascarado;
- usuarios/personas/roles/scopes configurables;
- cursos y certificaciones configurables;
- readiness/gates visibles y honestos;
- no simular integraciones reales;
- no hardcodear TyA.

## Impacto Academia

Academia debe explicar que cada modulo tiene readiness antes de conexion real y que los gates evitan reprocesos, sobrescrituras silenciosas y exposicion de datos.

## Estado seguro

Contrato/config/script validador solamente. No base real, no Auth real, no Firestore write, no import, no produccion, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
