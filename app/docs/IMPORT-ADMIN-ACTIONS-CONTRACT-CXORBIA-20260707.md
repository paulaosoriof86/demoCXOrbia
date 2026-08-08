# Import admin actions contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de importaciones desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-import-admin-actions-contract.mjs`

## Necesidad cubierta

El modulo de Importaciones debe permitir administrar cargas historicas y limpias sin ejecutar import real mientras el gate este apagado.

Debe permitir:

- buscar lotes por proyecto, entidad, estado y origen;
- previsualizar lote antes de cualquier escritura;
- revisar fila puntual;
- aprobar lote limpio;
- rechazar fila puntual;
- poner fila en espera de revision;
- resolver mapeo de campos;
- generar reporte de importacion.

## Acciones permitidas

- `search_batches`
- `preview_batch`
- `review_row`
- `approve_clean_batch`
- `reject_row`
- `hold_row`
- `resolve_mapping`
- `generate_report`

## Estados requeridos

- `draft`
- `preview_ready`
- `needs_review`
- `approved_clean`
- `row_rejected`
- `row_on_hold`
- `mapped`
- `report_ready`
- `blocked_gate`

## Entidades previstas

- `shopper`
- `visit`
- `assignment`
- `certification`
- `settlement`
- `project_config`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto, lote y fila cuando aplique.
- No se permiten acciones globales sobre todos los lotes.
- Preview no equivale a import real.
- Aprobar lote limpio no debe escribir datos si el gate esta apagado.
- Fila con conflicto debe ir a revision humana.
- Mapeo de campos debe quedar auditado.
- No se deben subir datos crudos sensibles al repo.
- Importaciones deben alimentar Phase A sin copiar base vieja ni arquitectura vieja.

## Pendiente para Claude

Claude debe incorporar en Importaciones:

- buscador por lote, entidad, origen y estado;
- vista preview antes de escritura;
- conteo de crear, actualizar, omitir y revisar;
- acciones puntuales por fila;
- razon obligatoria para rechazo o espera;
- historial/auditoria visible;
- copy claro diferenciando preview, aprobado y escrito real;
- bloqueo visible si import real no esta autorizado.

## Relacion con Phase A

Impacta:

- import historico completo como base de control;
- shoppers historicos desde fuente limpia;
- certificaciones ya presentadas;
- visitas ejecutadas;
- beneficios/liquidaciones por periodo;
- configuracion multi-proyecto.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes que requieran cargas historicas o migraciones limpias.

### Exclusivo cliente

No contiene datos ni reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Importaciones y reportes admin.

### Academia

Impacto indirecto/directo cuando el import alimenta certificaciones, cursos, manuales o rutas por rol.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports ejecutados, sin sincronizacion real y sin datos sensibles.
