# Pendientes Claude addendum - CRM external folder refs preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para CRM external folder refs. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes CRM / documentos

1. No decir carpeta creada si solo hay referencia.
2. No decir proveedor conectado si gate esta apagado.
3. No decir sincronizado si no hay proveedor real.
4. Mostrar estados:
   - ref preview;
   - provider pending;
   - permission review;
   - blocked private link;
   - manual review.
5. No exponer URL privada, link firmado, token, contenido documental ni adjuntos.

## Pendientes entidades

1. Vincular folder ref a `crmEntityId`.
2. Soportar entidades: visita, postulacion, asignacion, liquidacion, payment batch, academy item, support case.
3. No deducir por nombre visual.
4. Mostrar revision manual si la relacion es ambigua.

## Pendientes permisos

1. Separar admin/ops.
2. Separar finance restricted.
3. Separar shopper own only.
4. Separar client read-only summary.
5. Separar superadmin only.

## Pendientes Academia

1. Curso Ops: document traceability y folder refs.
2. Curso Admin: CRM entities y permission review.
3. Curso Finanzas: referencias restringidas sin banco/cuenta cruda.
4. Curso Cliente: lectura de resumen permitido.
5. Curso Superadmin: provider gates y OAuth/API futuro.
6. Manual CRM folder references.
7. Manual document privacy.
8. Checklist antes de vincular carpeta.
9. Checklist antes de exponer referencia a rol.
10. Glosario de CRM folder refs.

## No corresponde a Claude

- Implementar validator backend.
- Activar OAuth/API/proveedor real.
- Leer documentos reales.
- Escribir Firestore/Storage.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: textos honestos y no exponer links/documentos privados.

P1: estados de CRM folder refs y permisos por rol.

P2: Academia profunda con manuales, checklists y glosario.
