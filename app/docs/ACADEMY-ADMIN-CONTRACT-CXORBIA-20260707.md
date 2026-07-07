# Academy admin contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de Academia desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-academy-admin-actions-contract.mjs`

## Necesidad cubierta

Academia debe ser administrable y sincronizada con reglas de proyecto, certificaciones, manuales, rutas por rol, notificaciones y requisitos operativos.

Debe permitir:

- buscar contenido por proyecto, tipo, regla, rol y estado;
- mapear contenido a regla de proyecto;
- marcar contenido faltante;
- enviar contenido a revision humana;
- aprobar contenido;
- publicar en preview sin produccion real;
- pausar contenido;
- restaurar contenido cuando aplique.

## Acciones permitidas

- `search_content`
- `map_content_to_rule`
- `mark_content_missing`
- `send_to_review`
- `approve_content`
- `publish_preview`
- `pause_content`
- `restore_content`

## Estados requeridos

- `draft`
- `mapped`
- `missing`
- `review_required`
- `approved`
- `preview_published`
- `paused`
- `restored`
- `blocked_gate`

## Tipos de contenido previstos

- `manual`
- `guide`
- `certification`
- `question_bank`
- `role_route`
- `notification_template`
- `project_rule`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto, contenido y regla cuando aplique.
- No se permiten acciones globales sobre todo Academia.
- Publicar preview no equivale a publicacion productiva real.
- Contenido que afecte certificaciones debe pasar por revision humana.
- Si cambia una regla de proyecto, Academia debe reflejar impacto en manual, ruta, certificacion o notificacion.
- Contenido faltante debe quedar visible para admin y no ocultarse.
- No se debe generar banco de preguntas o certificacion final sin revision humana.

## Pendiente para Claude

Claude debe incorporar en Academia:

- buscador por proyecto, tipo, regla, rol y estado;
- vista de contenido faltante;
- accion para mapear contenido a regla;
- accion para enviar a revision;
- accion para aprobar, pausar o restaurar;
- badges de estado y gate;
- historial/auditoria visible;
- copy claro diferenciando borrador, revision, preview y publicado real;
- consistencia con Certificaciones, Notificaciones, Visitas, Evidencias y Beneficios.

## Relacion con Phase A

Impacta directamente:

- certificaciones ya presentadas;
- certificaciones solicitadas puntualmente;
- excepciones individuales;
- manuales por proyecto;
- rutas por rol shopper/admin;
- notificaciones operativas;
- reglas de visitas, evidencias y beneficios.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con Academia por proyecto, certificaciones, manuales y rutas por rol.

### Exclusivo cliente

No contiene contenido exclusivo del cliente actual.

### Claude/prototipo

Impacto directo en UI de Academia y en modulos conectados.

### Academia

Impacto directo y principal.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin publicacion real, sin Gemini real y sin datos sensibles.
