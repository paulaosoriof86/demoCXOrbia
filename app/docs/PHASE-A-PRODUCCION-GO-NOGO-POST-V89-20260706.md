# Phase A producción go/no-go post V89 - CXOrbia TyA

Fecha: 2026-07-06

## Objetivo

Cerrar el empalme urgente post V89 con una ruta realista hacia producción Phase A, sin esperar a Claude y sin declarar listo algo que todavía dependa de gates backend o proveedores externos apagados.

## Decisión actual

Estado: GO condicionado para RC Phase A controlada, NO GO para producción real con integraciones activas.

Puede avanzar a release candidate operativo controlado si se valida en preview/hosting que los flujos visibles no prometen integraciones reales y que no hay errores JS.

No debe avanzar a producción con integraciones reales hasta que estén activos y validados los gates de Firestore/Auth/Storage/HR/Make/Gemini/correo/mensajería.

## Empalme completado

Ya se materializó V89 en la rama activa y se agregó un guard visible de copy seguro:

- `app/core/production-copy-guard.js`
- `app/index.html` carga el guard después de `core/ui.js` y antes de los módulos.

El guard no llama APIs, no escribe datos, no activa proveedores y no toca producción. Su función es evitar que el UI visible prometa envíos, sincronizaciones, pagos o integraciones reales mientras los gates siguen apagados.

## Bloqueos P0 mitigados visualmente

El guard transforma textos visibles relacionados con:

- WhatsApp enviado.
- WA enviado al shopper.
- Correo enviado a.
- HR sincronizada o actualizada.
- Shopper notificado.
- Payload o disparo enviado.
- Cuestionario enviado.
- Egresos automáticos.
- Make activo.
- Google Sheets/portal en vivo.
- Badge En vivo cuando corresponde a preview.

## Validación local realizada

- `app/core/production-copy-guard.js`: `node --check` OK en validación local antes de subirlo.
- La herramienta `tools/migration/tya-post-v89-honest-copy-patch.mjs` fue validada localmente contra V89 y no reportó residuos P0 en los archivos cubiertos.

## Pendientes antes de producción real

### P0 antes de release final

- Abrir preview o hosting temporal y validar carga completa sin errores de consola.
- Confirmar navegación: Dashboard, Postulaciones, Reservas, Automatizaciones, Cuestionario shopper, Finanzas, Academia.
- Confirmar que el guard no rompe modales, tablas, KPIs ni navegación.
- Confirmar que no aparecen textos visibles de envío/sync/pago real sin backend activo.

### P1 antes de producción operativa ampliada

- Ejecutar `tools/migration/tya-post-v89-honest-copy-patch.mjs --apply` en entorno local/Codex para convertir el guard en cambios de fuente permanentes.
- Documentar diff por archivo.
- Revisar visualmente cursos `a_backend_prepared` y `a_ops_conflicts_route`.
- Confirmar que Academia no mezcla progreso de cursos heredados.

### P2 posterior a salida controlada

- Activar gates reales por bloque: Auth, Firestore, Storage, HR, Make, Gemini y mensajería.
- Crear base nueva limpia.
- Cargar solo datos TyA limpios y útiles mediante import controlado.
- Validar liquidaciones y pagos con fuente financiera externa.

## Riesgos aceptados para RC Phase A

- Las integraciones siguen en modo preparado/preview/fallback manual.
- El guard corrige copy visible, pero el patch de fuente permanente todavía debe aplicarse por Codex/local.
- Academia está documentada por bloque, pero falta validación visual final.

## Riesgos no aceptados para producción real

- Activar HR write real sin gate.
- Activar Make/Gemini/correo/mensajería real sin validación.
- Usar datos sensibles o crudos en repo.
- Declarar pagos automáticos o sincronización real sin backend.
- Hacer merge/deploy sin smoke test de navegación.

## Siguiente bloque exacto

1. Smoke test visual de la rama con guard cargado.
2. Validar consola.
3. Validar copy visible P0.
4. Si pasa, preparar RC Phase A controlada.
5. Si falla, corregir solo el guard o el texto puntual, sin reabrir rediseño.

## Estado seguro

Sin deploy, sin producción, sin merge, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajería/correo real y sin datos sensibles.
