# Resumen para Claude - Addendum restricciones y ficha de postulacion Phase A

Fecha: 2026-07-04

## Bloque backend completado

Se complemento Phase A para separar reglas especificas de Cinepolis de restricciones configurables por proyecto.

## Archivos creados

- `app/contracts/project-visit-restrictions-postulation-card-phase-a.tya.contract.json`
- `tools/migration/tya-project-visit-restrictions-validator.mjs`
- `app/docs/PROJECT-VISIT-RESTRICTIONS-POSTULATION-CARD-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-RESTRICCIONES-FICHA-POSTULACION-TYA-20260704.md`

## Para prototipo

Cuando Claude recupere capacidad, revisar la ficha de postulacion.

Debe mostrar antes de postular:

- honorario;
- reembolso;
- escenario;
- resumen del proyecto;
- restricciones de perfil shopper;
- frecuencia o ultima visita;
- restricciones de fecha, horario, dias o franja;
- si la restriccion es requisito del cliente o medicion interna;
- certificacion/documentos/evidencias requeridas;
- advertencias de elegibilidad.

Cinepolis mantiene WK/WKND y quincena como configuracion especifica de ese proyecto, no como regla global.

## Para backend

No aplicar penalizaciones automaticas hasta tener contrato de scoring/ranking aprobado por Paula.

## Para Academia

Actualizar manuales y cursos de ficha de postulacion, restricciones, elegibilidad, requisito cliente vs medicion interna.

## Estado seguro

Sin cambios frontend, sin runtime, sin Firestore real, sin HR real, sin Make real, sin deploy y sin produccion.
