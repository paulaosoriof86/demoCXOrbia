# CAMBIOS BACKEND — addendum Operational Readiness R9

Fecha: 2026-07-11

## Baseline

- Paquete frontend recibido: V105.
- Identidad interna empalmada: V106.
- Backend preservado: R5.
- Plan materialización preservado: R6, 1,418 create-only.
- Executor preservado: R8, hard-disabled para dev-clean.

## Archivos creados

### Contrato y configuración

- `backend/contracts/phase-a-operational-readiness-r9-v1.json`
  - Define cuatro carriles de readiness y decisiones fail-closed.
  - Nunca autoriza materialización.

- `backend/config/phase-a-operational-readiness-r9.source-safe.json`
  - Vincula V105/V106 + R5/R6/R8 con los conteos reales source-safe TyA.
  - Declara rutas de evidencia y fuentes estables requeridas.

### Herramientas

- `tools/release/tya-phase-a-operational-readiness-r9.mjs`
  - Construye reporte GO/HOLD sanitizado.
  - Verifica baseline, target limpio, import dry-run y smoke.
  - No invoca proveedores ni escribe datos.

- `tools/release/tya-phase-a-operational-readiness-r9-validate.mjs`
  - Tres pruebas fail-closed.
  - Resultado local: 3 PASS / 0 FAIL.

### CI

- `.github/workflows/cxorbia-phase-a-operational-readiness-r9.yml`
  - Ejecuta validación y reporte actual.
  - Permisos `contents: read`.
  - No credenciales, no provider calls, no writes.

### Documentación

- `app/docs/PHASE-A-OPERATIONAL-READINESS-R9-20260711.md`.
- Este addendum.
- Addenda R9 de Claude, pendientes, Academia y tracker.

## Qué cambió operativamente

Antes, los siguientes pasos estaban distribuidos entre documentos y scripts. R9 los une en una única decisión reproducible:

- baseline source-safe real;
- base DEV nueva/vacía;
- pagos/certificaciones limpios;
- smoke post-empalme.

El gate actual queda en HOLD por evidencia/fuentes faltantes, sin invalidar el carril TyA ya listo.

## Qué no se tocó

- `/app/modules`;
- `/app/core` del prototipo;
- snapshot/adapters/reconciliadores TyA;
- plan R6;
- executor R8;
- Firebase/Auth/Storage/Make/Gemini;
- datos reales crudos;
- producción.

## Impacto frontend

No requiere cambio inmediato. Claude debe reflejar posteriormente los cuatro carriles y sus estados honestos, sin presentar revisión humana como conexión/importación/materialización.

## Riesgos y bloqueos

- Firebase DEV limpia no se presume: requiere reporte read-only autorizado.
- Pagos y certificaciones no se inventan: requieren exports sanitizados.
- Smoke no se presume por auditoría estática: requiere artefacto reproducible.
- R9 no puede elevarse por sí mismo a permiso de escritura.

## Estado seguro

0 writes, 0 imports, 0 pagos, 0 providers, 0 deploy, 0 producción.
