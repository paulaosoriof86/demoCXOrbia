# ADDENDUM V87 — Phase A (correcciones auditoría V83)

Fecha: 2026-07-04 · Base: V86 · Alcance: solo frontend/prototipo.

## Qué se resolvió (P0)

### Textos honestos
- `modules/academia.js`
  - Flujo corregido: la liquidación candidata nace **después** de `cuestionario realizado → revisión → submitido`, NO al marcar realizada.
  - "cuestionario enviado" → "realizado/completado" (3 apariciones).
- `modules/postulaciones.js`
  - Botón "Sincronizar HR" tenía botón sin handler → handler honesto: "lectura preparada · sync real por backend cuando el gate esté activo (pendiente backend)".
  - Asignación manual ya usaba "se reflejará en HR cuando el sync esté activo (pendiente backend)".

### Contrato de revisión (`modules/revision-admin.js`)
- `revisionStore.set`: alias `status = estado` (compatibilidad backend).
- La llamada `R.set(...)` pasa `projectId: p.id`.
- Se guarda `hrRowId` (de `v.hrRowId || v.rowId || v.extId`).
- "Cuestionario: enviado" → "realizado/completado".

## Contenido profundo de Academia (V85–V86, conservado)
- Curso Admin "Glosario y checklists operativos": glosario clickeable (`sourceSafe`, `sourceVisitRef`, `sourcePaymentRef`, `manual_review_required`, `held_for_conflict`, `batchId/paymentItemId/movementId`) + checklists reales (`.acad-check`).
- Curso Admin "Finanzas: liquidaciones, movimientos y beneficios": flujo del dinero, movimientos (fuente/pagador, beneficiario, CxC/CxP), conceptos configurables Boleto/Combo por tenant/proyecto, datos sensibles con `sourcePaymentRef`.
- Formato de marca CXOrbia (estilo Orbit) aplicado: el bloque `<style>` plano dentro de `academia.js` fue reemplazado por estilos ricos (secciones numeradas, flows en tarjetas, cards con ícono, checklists, glosario).

## Archivos tocados
- `modules/academia.js` (flujo + textos + estilos de marca + 2 cursos nuevos)
- `modules/revision-admin.js` (status/projectId/hrRowId + texto)
- `modules/postulaciones.js` (handler honesto syncHR)
- `styles/layout.css` (estilos de marca acad-*)

## Qué queda pendiente (P1)
- Rutas por rol completas: shopper (agenda/reprog/realizada/cuestionario/beneficios/privacidad), ops (assignment sync/conflictos/fuera de rango), cliente (lectura de estados), superadmin/aliado (config por tenant).
- Cursos: assignment-sync/conflictos, visit-lifecycle/reservas, datos sensibles por rol.
- Checklists interactivos persistentes (hoy son visuales; interactividad/persistencia pendiente).
- Notificación propia de Academia + acceso persistente en topbar.

## Confirmación de seguridad
- Sin tocar `tools/migration`, `app/contracts`, gates de producción.
- Sin activar Firestore/Auth/Storage/Make/Gemini/WhatsApp/correo/pagos/import reales.
- Sin deploy. Sin credenciales. Sin URLs privadas persistidas. Sin datos sensibles expuestos.
- Sintaxis JS OK; `index.html` sin scripts faltantes ni duplicados.
