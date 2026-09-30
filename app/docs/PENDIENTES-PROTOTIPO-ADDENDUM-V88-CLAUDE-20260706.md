# Pendientes prototipo addendum V88 Claude - CXOrbia TyA

Fecha: 2026-07-06
Fuente: auditoria de `Prototype development request CXOrbia V88.zip`

## Decision

V88 no cierra los 301 items y no queda como source lock final.

## P0 - Textos honestos de integraciones reales

Claude debe corregir, sin redisenar ni tocar backend:

- `app/modules/postulaciones.js`
  - Reemplazar `Aprobada · WhatsApp enviado al shopper`.
  - Reemplazar `Aprobada · WhatsApp enviado`.
  - Reemplazar `Nueva fecha autorizada · shopper notificado · HR sincronizada`.
  - Reemplazar `Fecha original conservada · shopper notificado`.
  - Reemplazar `Asignacion actualizada · HR sincronizada`.
  - Los textos deben decir `notificacion preparada`, `WhatsApp Web/fallback manual`, `pendiente confirmacion`, `se reflejara en HR cuando el sync backend este activo` o equivalente honesto.

- `app/modules/dashboard.js`
  - Reemplazar `Correo enviado a ... (Make/Outlook)`.
  - Reemplazar `WhatsApp enviado (Make)`.
  - Debe quedar como borrador/preparado/fallback/pendiente backend.

- `app/core/automations.js`
  - Cambiar `HR actualizada` y `sincronizado a la HR` por estados pendientes/preparados.
  - Mantener `Cuestionario realizado`, no volver a `enviado`.

- `app/modules/automatizaciones.js`
  - Revisar textos de `Registro de disparos (Make)`, `Payload de prueba enviado`, `Disparo enviado a Make`, `alertas enviadas`.
  - Mientras no exista backend/gate activo, debe decir `evento registrado`, `payload preparado`, `pendiente backend`, `simulacion` o `preview`.

- Otros residuos heredados a revisar si Claude toca esos archivos:
  - `app/modules/cuestionario-shopper.js`: `marca la visita como cuestionario enviado`.
  - `app/core/manuales-data.js`: `cuestionario enviado` y `WhatsApp al shopper`.
  - `app/modules/reservas.js`: `shopper notificado`.
  - `app/modules/finanzas.js`: `sincronizados`, `sincronizadas`, `Liquidacion corregida · sincronizada` si no proviene de backend real.
  - `app/modules/correo.js`: `Correo enviado` solo debe mostrarse si hay cuenta/proveedor real conectado; si no, borrador o pendiente.
  - `app/modules/academia.js`: revisar lecciones que prometen notificacion automatica, Make activo, Google Sheets doble via, portal en vivo o pago automatico sin gate.

## P1 - Academia: IDs duplicados

V88 agrega contenido util, pero con IDs duplicados:

- `id:'a_backend'` aparece dos veces:
  - nuevo curso "Capacidades de backend: que esta preparado";
  - curso existente "Backend tecnico: Firebase, Gemini, Make y Storage".

- `id:'a_ops'` aparece dos veces:
  - curso existente "Dashboard y gestion operativa";
  - nuevo curso "Equipo operativo: asignacion, conflictos y fuera de rango".

Claude debe cambiar los IDs nuevos a valores unicos y verificar que la lista abra el curso correcto, sin mezclar progreso ni editar el curso equivocado.

Sugeridos:

- `a_backend_prepared`
- `a_ops_conflicts_route`

## P1 - Academia: ruta operativa ops no queda realmente cerrada

La ruta nueva fue agregada, pero por duplicidad de `a_ops` puede quedar inaccesible desde el renderer. No declarar #301 cerrado hasta validar navegacion real del curso nuevo.

## P1 - Academia: coherencia de estados preparados

El nuevo curso de backend dice correctamente `preparado / pendiente backend`, pero otras lecciones siguen prometiendo ejecucion real. Debe hacerse un pase de coherencia en Academia:

- WhatsApp/correo: preparado, borrador o fallback manual.
- HR/Google Sheets: lectura/escritura pendiente backend si gate apagado.
- Make: evento preparado/registrado; no disparo real si gate apagado.
- Portal cliente/en vivo: solo si dato existe; de lo contrario preview o pendiente fuente.
- Pagos: pago real solo tras cruce financiero backend.

## P2 - Documentacion interna del prototipo

V88 no actualiza documentos internos del ZIP para reflejar la decision de auditoria ni el estado real de #299/#300/#301. Claude debe actualizar su changelog/documentacion de prototipo en la siguiente candidata.

## Validacion esperada de la siguiente candidata

- JS check limpio.
- Sin IDs duplicados en cursos/lecciones de Academia.
- Al hacer clic en cada curso nuevo se abre ese curso, no el anterior con el mismo ID.
- Busqueda global sin `WhatsApp enviado`, `shopper notificado`, `HR sincronizada`, `Correo enviado`, `cuestionario enviado` en textos operativos donde no haya proveedor/gate real.
- No tocar `tools/migration`, `app/contracts`, gates backend ni integraciones reales.
- No declarar produccion, source lock o backlog 100% cerrado sin auditoria posterior.
