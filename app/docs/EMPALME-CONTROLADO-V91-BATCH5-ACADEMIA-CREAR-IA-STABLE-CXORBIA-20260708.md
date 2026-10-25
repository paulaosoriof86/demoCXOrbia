# Empalme controlado V91 - Batch 5 Academia Crear con IA estable

Fecha: 2026-07-08  
Fuente: auditoria forense V91 + baseline incremental V91  
Estado: patch visible incremental, no produccion.

## 1. Objetivo

Resolver el blocker detectado en auditoria V91: el boton `Crear con IA` de Academia parecia no estar cableado de forma estable.

Este batch trabaja sobre V91 como baseline incremental y no reemplaza `academia.js` completo.

## 2. Archivos creados

- `app/modules/academia-create-ai-stable.js`
- `app/docs/EMPALME-CONTROLADO-V91-BATCH5-ACADEMIA-CREAR-IA-STABLE-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-EMPALME-CONTROLADO-V91-BATCH5-ACADEMIA-CREAR-IA-STABLE-20260708.md`

## 3. Archivos actualizados

- `app/index.html`

## 4. Que se agrego

Se agrego un handler estable para `#acadNew`.

El nuevo flujo abre un modal de `Crear curso con IA (preview)` con:

- tema del curso;
- nivel;
- proyecto/categoria;
- audiencia;
- objetivo;
- motivo obligatorio.

Al confirmar, crea un curso custom local en estado `in_review`, con:

- `custom=true`;
- `_source='ai_draft_preview'`;
- `_status='in_review'`;
- `_version=1`;
- `_auditTrail` con motivo y auditRef;
- quiz/checklist inicial editable.

## 5. Copy honesto

El modal deja claro que:

- Gemini real no esta activo;
- esto crea un borrador local estructurado;
- requiere revision humana;
- no publica real;
- no activa backend/gate;
- no usa provider real.

## 6. Por que se uso patch

Se mantiene el enfoque incremental porque `academia.js` es grande y V91 no debe reescribirse a ciegas.

El patch:

- se carga despues de `academia.js` y `academia-admin-actions.js`;
- envuelve `CX.modules.aprendizaje`;
- conecta `#acadNew` si aparece en el render;
- observa cambios DOM para mantener el handler tras re-render;
- conserva el contenido actual de Academia.

## 7. Pendientes vivos despues del batch

1. Smoke visual completo de Academia.
2. Profundizacion de Academia por rol/manual/checklist/glosario.
3. Acciones equivalentes para manuales/checklists/glosario, no solo cursos.
4. Consolidar patches dentro de `academia.js` si despues mejora mantenibilidad.
5. Revisar source cleanup de copy P0 por modulo.

## 8. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron reusable para crear borradores Academia con IA preview y revision humana.
- Exclusivo cliente: no. No contiene datos TyA reales ni logica unica de cliente.
- Claude/prototipo: si. Es mejora local que Claude debe incorporar nativamente si recupera capacidad.
- Academia: si. Corrige creacion de borradores IA, pero la profundizacion sigue pendiente.
- Sin impacto Claude: no. Debe quedar en paquete Claude como mejora local y pendiente de consolidacion.

## 9. Estado seguro

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
