# CX.data adapter acceptance checklist V78 TyA

Fecha: 2026-07-04

## Proposito

Definir los criterios de aceptacion para el futuro adapter backend de `CX.data`, manteniendo intacto el prototipo V78.

## Criterios obligatorios

1. Los modulos actuales no cambian sus llamadas a `CX.data`.
2. El adapter conserva las mismas respuestas esperadas por el frontend.
3. El selector de fuente debe poder indicar demo/local/backend DEV.
4. El estado visual debe indicar preview si viene de DEV staging.
5. Los datos deben estar segmentados por tenant y proyecto.
6. No se mezclan datos demo con datos preview.
7. No se habilitan acciones reales de comunicacion desde preview.
8. No se habilitan pagos finales desde preview.
9. No se suben evidencias desde preview.
10. No se usa produccion.

## Modulos que no se tocan desde backend

- Dashboard.
- Visitas.
- Postulaciones.
- Shoppers.
- Finanzas.
- Automatizaciones.
- Integraciones.
- Novedades.
- SaaS Console.

## Criterio de salida

El adapter solo pasa a implementacion cuando exista revision de contrato, source lock V78 vigente y autorizacion tecnica especifica para el punto unico de conexion.

## Estado

- Checklist documental.
- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
