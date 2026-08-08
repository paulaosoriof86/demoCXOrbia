# Academia impact - Synthetic fixtures manifest TyA

Fecha: 2026-07-05

## Proposito

Registrar el impacto en Academia del bloque de fixtures sinteticos y manifest local del synthetic input pack.

Academia debe explicar que un fixture sintetico es una muestra segura, artificial y controlada para probar contratos/validators. No representa datos reales, no prueba limpieza de HR real y no autoriza produccion.

## Roles impactados

- Superadmin
- Admin
- Ops/coordinador
- Finanzas
- Shopper
- Cliente final
- Consultora / aliado / socio
- Soporte

## Manuales a actualizar

1. Readiness y gates Phase A.
2. Validadores preview y fixtures sinteticos.
3. HR/plataforma assignment sync.
4. Agenda, reservas, `availableFrom`, franja y quincena.
5. Postulaciones dinamicas y `formVersion`.
6. Notification outbox y `outboxStatus`.
7. Mailbox por usuario y `mailboxId`.
8. CRM external folder refs, `crmEntityId` y `externalFolderRef`.
9. Shopper communication history.
10. Ranking/scoring como apoyo de revision, no decision automatica.
11. Liquidaciones, Boleto, Combo, lotes y movimientos individuales.

## Lecciones nuevas sugeridas

### Leccion 1 - Que es un fixture sintetico

Debe explicar:

- Es un input artificial para probar estructura.
- No contiene datos reales.
- No se usa para importar informacion operativa.
- No sustituye validacion posterior contra fuentes autorizadas.
- Puede producir review_required sin que exista error operativo.

### Leccion 2 - Como interpretar un validator preview

Debe explicar:

- `preview_ready` significa que la estructura paso una validacion local segura.
- `review_required` significa que un humano debe revisar contrato, fixture, scanner o regla.
- `blocked_missing_input` significa que falta fuente o fixture.
- `blocked_real_gate_off` significa que el bloqueo es intencional porque no hay autorizacion real.
- `blocked_sensitive_data` significa que el payload no debe avanzar.

### Leccion 3 - Diferencia entre preview y produccion

Debe explicar:

- Preview no envia correos ni WhatsApp.
- Preview no sincroniza HR.
- Preview no escribe Firestore.
- Preview no crea carpetas ni accede proveedores.
- Preview no paga ni mueve liquidaciones.
- Preview no ejecuta Gemini.

### Leccion 4 - Como usar readiness sin prometer de mas

Debe explicar por rol:

- Admin ve que falta por resolver.
- Ops sabe que se puede revisar sin tocar HR real.
- Finanzas entiende que pagos sinteticos no son pagos reales.
- Shopper no debe ver estados de envio/sync si no existen.
- Cliente solo debe ver resumen honesto, no detalles tecnicos internos.

## Checklists interactivos sugeridos

1. Antes de ejecutar un validator local.
2. Antes de interpretar `review_required` como bug.
3. Antes de pedir fuente real a Paula.
4. Antes de decir que algo esta conectado.
5. Antes de enviar a Claude una correccion UI.
6. Antes de cerrar readiness Phase A.

## Pendientes de contenido profundo

- Crear glosario: fixture, validator, manifest, runPlan, gate, sourceSafe, preview_ready, review_required, blocked_real_gate_off.
- Crear ruta por rol para admin/ops/finance.
- Crear ejemplo visual de un readiness item.
- Crear aviso: datos sinteticos no son datos reales.
- Conectar novedades/centro de actualizaciones cuando un validator cambia.

## Estado seguro

Documental. No activa runtime, produccion, deploy, merge, Firestore, HR, Storage, Make, Gemini, email, WhatsApp, pagos ni import real.
