# Field files admin actions contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de archivos de visita/evidencias desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-field-files-admin-actions-contract.mjs`

## Necesidad cubierta

El modulo de Archivos de visita / Evidencias debe permitir revisar y administrar requisitos de archivo sin activar Storage real ni cargas reales mientras el gate este apagado.

Debe permitir:

- buscar archivos por proyecto, visita, shopper, tipo y estado;
- marcar archivo requerido por regla de proyecto;
- revisar archivo recibido en modo preview;
- aprobar referencia de archivo;
- devolver con nota;
- marcar faltante;
- solicitar reemplazo;
- bloquear despues de revision.

## Acciones permitidas

- `search_files`
- `mark_required`
- `review_file`
- `approve_file_ref`
- `return_with_note`
- `mark_missing`
- `replace_request`
- `lock_after_review`

## Estados requeridos

- `not_required`
- `required`
- `uploaded_preview`
- `review_required`
- `approved_ref`
- `returned`
- `missing`
- `replace_requested`
- `locked`

## Tipos de archivo previstos

- `photo`
- `video`
- `audio`
- `document`
- `form_attachment`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto, visita y archivo cuando aplique.
- No se permiten acciones globales sobre todos los archivos.
- Preview no equivale a archivo real en Storage.
- Aprobar referencia no debe activar almacenamiento real si el gate esta apagado.
- Devolver o solicitar reemplazo requiere razon y auditoria.
- Archivos faltantes pueden bloquear revision de visita o liquidacion segun regla de proyecto.
- No se deben subir datos sensibles ni archivos reales al repo.

## Pendiente para Claude

Claude debe incorporar en Archivos/Evidencias:

- buscador por visita, shopper, tipo y estado;
- filtros por requerido, recibido, faltante, en revision, devuelto y aprobado;
- accion para marcar requerido;
- accion para revisar referencia;
- accion para aprobar, devolver o solicitar reemplazo;
- razon obligatoria;
- historial/auditoria visible;
- copy claro diferenciando preview, referencia aprobada y Storage real;
- bloqueo visible si Storage real no esta autorizado.

## Relacion con Phase A

Impacta:

- visitas realizadas;
- validacion previa a cuestionario/submitido cuando aplique;
- beneficios/liquidaciones si la evidencia es requisito de pago;
- rutas de Academia y manuales por proyecto;
- notificaciones de faltantes o devoluciones.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes que requieran archivos de visita, evidencias, documentos o adjuntos por proyecto.

### Exclusivo cliente

No contiene archivos reales ni reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Visitas, Evidencias, Admin, Shopper, Beneficios y Notificaciones.

### Academia

Impacto directo en manuales, rutas por rol y contenido de requisitos por proyecto.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin Storage real, sin imports, sin cargas reales y sin datos sensibles.
