# Pendientes prototipo addendum - Auditoria V83

Fecha: 2026-07-04

## Estado general

V83 modifica solo `modules/academia.js` y `styles/layout.css`. No corrige los pendientes operativos principales de V82 ni los nuevos bloques backend de assignment sync/conflicts y visit lifecycle/reservas.

## Pendientes P0

### Cuestionario shopper

- Archivo: `modules/cuestionario-shopper.js`.
- Pendiente: cambiar texto externo `marca la visita como cuestionario enviado` por `marca el cuestionario como realizado/completado`.

### Revision admin

- Archivo: `modules/revision-admin.js`.
- Pendientes:
  - cambiar `Cuestionario: enviado/pendiente` por realizado/completado/pendiente;
  - agregar alias `status=estado`;
  - pasar `projectId:p.id` a `R.set`;
  - guardar `hrRowId:v.hrRowId||v.rowId||v.extId||''`.

### Mis visitas

- Archivo: `modules/misvisitas.js`.
- Pendiente: quitar textos que prometen sincronizacion de hoja de ruta y movimiento de liquidacion como hecho real.
- Usar: preparado, preview, pendiente backend, pendiente HR sync.

### Postulaciones

- Archivo: `modules/postulaciones.js`.
- Pendiente: quitar toasts `HR sincronizada`.
- Usar: pendiente HR sync, se reflejara en HR cuando el sync este activo, pendiente backend.

### Academia

- Archivo: `modules/academia.js`.
- Pendientes:
  - conservar mejoras V83;
  - corregir que visita realizada/cuestionario realizado no genera liquidacion candidata automaticamente;
  - cambiar `cuestionario enviado` por realizado/completado;
  - cambiar textos de sincronizacion automatica/WhatsApp/push/HR real;
  - agregar datos sensibles por rol;
  - agregar assignment sync/conflicts;
  - agregar visit lifecycle/reservas;
  - hacer checklists interactivos o documentar explicitamente como pendiente.

## Pendientes P1

- Topbar/acceso persistente de Academia o alternativa documentada.
- Notificaciones propias de Academia.
- Glosario consolidado clickeable.
- Rutas por rol: Shopper, Ops, Admin, Cliente, Superadmin/aliado.
- Curso de liquidaciones/Cinepolis Boleto/Combo.
- Curso de datos sensibles/source-safe.
- Curso de assignment sync/conflicts.
- Curso de visit lifecycle/reservas.

## No corresponde a Claude

- Modificar `tools/migration`.
- Modificar `app/contracts`.
- Activar Firestore/HR/Storage/Make/Gemini/correo/WhatsApp reales.
- Procesar datos reales o sensibles.

## Decision

Pedir V84 correctiva sobre V83. V83 no es source lock final.
