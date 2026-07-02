# CXOrbia - Cambios backend V58 julio schema

Fecha: 2026-07-01

## Registro

Se creo documentacion backend para continuar la migracion de julio sin cargar datos reales todavia.

## Archivos creados

- `firebase/schema/cxorbia-v58-hr-projects-model.json`
- `firebase/client-write-tools/validate-cxorbia-v58-hr-projects-model.mjs`
- `PROMPT-EXTRACCION-LIMPIA-TYA.md`

## Proposito

Definir el modelo Firestore esperado para proyectos, periodos, HR, visitas, postulaciones, shoppers, estadisticas, notificaciones y responsables.

## Restricciones respetadas

- No se cargaron datos reales.
- No se hizo deploy.
- No se toco produccion.
- No se toco Orbit.
- No se tocaron helpers locales ni secretos.

## Proximo paso

Sincronizar el repo local, ejecutar el validador Node y luego preparar seed piloto ficticio alineado al schema antes de cargar datos reales TyA.
