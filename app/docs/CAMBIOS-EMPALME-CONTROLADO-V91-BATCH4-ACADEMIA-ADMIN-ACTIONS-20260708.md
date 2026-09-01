# Cambios - Empalme controlado V91 Batch 4 Academia admin actions

Fecha: 2026-07-08  
Bloque: acciones visibles de administracion en Academia  
Estado: completado parcial, seguro y documentado.

## Archivos creados

1. `app/modules/academia-admin-actions.js`
   - Tipo: patch frontend incremental.
   - Proposito: agregar acciones visibles de administracion a tarjetas de cursos sin reemplazar `academia.js` completo.
   - Acciones: editar, duplicar, versionar, cambiar estado, archivar, auditoria local y restaurar archivados.
   - Estado: preview-only/localStorage.

2. `app/docs/EMPALME-CONTROLADO-V91-BATCH4-ACADEMIA-ADMIN-ACTIONS-CXORBIA-20260708.md`
   - Documento funcional del bloque.

3. `app/docs/CAMBIOS-EMPALME-CONTROLADO-V91-BATCH4-ACADEMIA-ADMIN-ACTIONS-20260708.md`
   - Bitacora puntual.

## Archivo actualizado

1. `app/index.html`
   - Se agrego `<script src="modules/academia-admin-actions.js"></script>` inmediatamente despues de `modules/academia.js`.

## Decision tecnica

Se uso patch incremental porque la prioridad era resolver el blocker visual de administrabilidad de Academia sin reescribir un modulo grande ni aceptar regresiones por empalme ciego.

El patch se carga despues de `academia.js`, envuelve `CX.modules.aprendizaje` e inyecta acciones tras cada render.

## Pendientes derivados

- Smoke visual de Academia.
- Verificar boton Crear con IA original.
- Profundizacion de Academia por rol/manual/checklist/glosario.
- Consolidar patch dentro de `academia.js` cuando sea estable y si mejora mantenibilidad.
- Mantener documentado para Claude como mejora local replicable.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
