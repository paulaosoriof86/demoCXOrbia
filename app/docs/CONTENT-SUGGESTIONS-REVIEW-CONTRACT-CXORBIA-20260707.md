# Content suggestions review contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se documento contrato reusable para revision humana de sugerencias de contenido antes de usarlas en Academia o certificaciones.

## Necesidad cubierta

Las sugerencias de contenido para preguntas, respuestas, manuales, rutas y notificaciones deben quedar siempre en preview y revision antes de publicarse.

Debe permitir:

- buscar sugerencias por proyecto, tipo, modulo, regla y estado;
- crear solicitud de sugerencia en preview;
- revisar sugerencia puntual;
- aprobar sugerencia puntual;
- rechazar sugerencia puntual;
- enviar a revision de Academia;
- congelar banco aprobado;
- pausar fuente de sugerencias si hay inconsistencias.

## Acciones permitidas

- `search_suggestions`
- `create_preview_request`
- `review_suggestion`
- `approve_suggestion`
- `reject_suggestion`
- `send_to_academy_review`
- `freeze_approved_bank`
- `pause_suggestion_source`

## Estados requeridos

- `draft`
- `preview_requested`
- `suggested`
- `review_required`
- `approved`
- `rejected`
- `academy_review`
- `frozen`
- `paused`
- `blocked_gate`

## Tipos de contenido previstos

- `question`
- `answer_option`
- `explanation`
- `certification_outline`
- `manual_summary`
- `notification_template`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto, modulo y sugerencia cuando aplique.
- No se permiten acciones globales sobre todas las sugerencias.
- Ninguna sugerencia se vuelve certificacion final sin revision humana.
- Ninguna sugerencia se publica como manual o ruta real sin gate.
- Aprobar sugerencia no equivale a publicar productivo.
- Congelar banco aprobado requiere revision previa.
- Rechazo o pausa requiere razon y auditoria.

## Pendiente para Claude

Claude debe incorporar en Academia / Certificaciones:

- buscador por proyecto, modulo, tipo y estado;
- vista de sugerencias en preview;
- acciones para aprobar, rechazar, enviar a revision o pausar;
- razon obligatoria;
- historial/auditoria visible;
- badge de contenido sugerido, revisado, aprobado, congelado o bloqueado;
- copy claro diferenciando sugerencia, revision, aprobacion y publicacion real.

## Relacion con Phase A

Impacta:

- bancos de preguntas;
- certificaciones por proyecto;
- manuales;
- rutas por rol;
- notificaciones;
- consistencia de Academia con reglas de visita, evidencia y beneficios.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes que usen sugerencias de contenido con revision humana.

### Exclusivo cliente

No contiene contenido exclusivo del cliente actual.

### Claude/prototipo

Impacto directo en UI de Academia, Certificaciones y Notificaciones.

### Academia

Impacto directo y principal.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin publicacion real, sin llamadas externas y sin datos sensibles.
