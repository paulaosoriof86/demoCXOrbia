# Notifications admin actions contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de notificaciones desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-notifications-admin-actions-contract.mjs`

## Necesidad cubierta

El modulo de Notificaciones debe permitir administrar avisos operativos sin activar canales reales mientras los gates esten apagados.

Debe permitir:

- buscar notificaciones por proyecto, canal, modulo, estado y rol destino;
- previsualizar notificacion;
- aprobar notificacion para preview o gate controlado;
- pausar notificacion;
- reactivar notificacion;
- marcar revision requerida;
- reenviar solo si el gate lo permite.

## Acciones permitidas

- `search_notifications`
- `preview_notification`
- `approve_notification`
- `pause_notification`
- `resume_notification`
- `mark_review_required`
- `resend_if_allowed`

## Estados requeridos

- `draft`
- `preview`
- `pending_review`
- `approved`
- `paused`
- `sent_preview_only`
- `blocked_gate`
- `failed_review`

## Canales previstos

- `in_app`
- `email`
- `whatsapp`
- `sms`
- `webhook`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto y notificacion cuando aplique.
- No se permiten acciones globales sobre todas las notificaciones.
- Todo envio externo queda bloqueado si el gate no esta activo.
- Preview no equivale a envio real.
- Reenvio requiere gate compatible y auditoria.
- Notificaciones relacionadas con Academia deben actualizarse si cambia curso, certificacion, manual o ruta.
- Notificaciones de beneficios/liquidaciones deben separar visita realizada, cuestionario, submitido y liquidacion.

## Pendiente para Claude

Claude debe incorporar en Notificaciones:

- buscador por modulo, canal, estado y rol destino;
- preview claro del texto;
- estados de gate visibles;
- accion para aprobar, pausar o reactivar;
- razon obligatoria para pausa/reactivacion;
- historial/auditoria visible;
- copy claro diferenciando preview de envio real;
- evitar botones que prometan correo, WhatsApp, SMS o webhook real sin gate activo.

## Relacion con Academia

Impacta directamente:

- certificaciones solicitadas;
- certificaciones aceptadas por historico;
- excepciones individuales;
- rutas de curso;
- manuales actualizados;
- recordatorios internos para admin/shopper.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con notificaciones por modulo, rol y gate.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Notificaciones, Academia, Certificaciones y flujos admin/shopper.

### Academia

Impacto directo en mensajes relacionados con cursos, manuales, certificaciones y rutas por rol.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin envios reales, sin sincronizacion real y sin datos sensibles.
