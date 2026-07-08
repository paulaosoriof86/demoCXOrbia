# Cambios - Empalme controlado V91 Batch 5 Academia Crear con IA estable

Fecha: 2026-07-08  
Bloque: handler estable para Crear con IA en Academia  
Estado: completado parcial, seguro y documentado.

## Archivos creados

1. `app/modules/academia-create-ai-stable.js`
   - Tipo: patch frontend incremental.
   - Proposito: conectar el boton `#acadNew` a un flujo estable de crear curso con IA preview.
   - Estado: preview-only/localStorage.
   - No usa Gemini real.
   - No publica real.
   - No activa backend.

2. `app/docs/EMPALME-CONTROLADO-V91-BATCH5-ACADEMIA-CREAR-IA-STABLE-CXORBIA-20260708.md`
   - Documento funcional del bloque.

3. `app/docs/CAMBIOS-EMPALME-CONTROLADO-V91-BATCH5-ACADEMIA-CREAR-IA-STABLE-20260708.md`
   - Bitacora puntual.

## Archivo actualizado

1. `app/index.html`
   - Se agrego `<script src="modules/academia-create-ai-stable.js"></script>` despues de `modules/academia-admin-actions.js`.

## Decision tecnica

Se resolvio el riesgo del boton `Crear con IA` con patch incremental en lugar de reemplazar `academia.js` completo.

El patch crea cursos custom locales en estado `in_review`, con audit trail, motivo obligatorio y copy honesto sobre Gemini/backend pendientes.

## Pendientes derivados

- Smoke visual completo de Academia.
- Profundizacion de Academia por rol/manual/checklist/glosario.
- Acciones equivalentes para manuales/checklists/glosario.
- Consolidar patches dentro de `academia.js` si se vuelve estable y mejora mantenibilidad.
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
