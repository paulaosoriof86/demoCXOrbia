# Readiness Dashboard Bridge Runner CXOrbia

Fecha: 2026-07-08  
Bloque: puente source-safe entre synthetic runner y readiness dashboard  
Archivo tecnico: `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`  
Estado: preview-only, sin runtime real.

## 1. Objetivo

Este bloque crea un puente opcional entre el `synthetic input pack runner` y el contrato de `readiness dashboard source-safe`.

Convierte un reporte source-safe de validadores preview en un manifest de dashboard con estados honestos, y luego valida ese manifest contra el contrato de readiness dashboard.

## 2. Que hace

El bridge:

1. Ejecuta el synthetic input pack runner con fixtures sinteticos/sanitizados o lee un reporte JSON existente con `--input`.
2. Mapea cada contrato/validator a un area de dashboard.
3. Genera items con:
   - area;
   - estado preview;
   - etiqueta visible honesta;
   - sourceRef opaca;
   - gate apagado o revision requerida;
   - razon/motivo;
   - flags de no ejecucion real.
4. Valida el manifest con `validateReadinessDashboardSourceSafe()`.
5. Imprime JSON por consola.
6. Opcionalmente escribe reportes locales con `--out`, sin outputs por defecto en repo.

## 3. Estados generados

El bridge puede mapear resultados a:

- `preview_ready` / `preview listo`;
- `warning` / `warning`;
- `fail` / `fail`;
- `human_review_required` / `pendiente revision humana`;
- `production_not_authorized` / `produccion no autorizada`;
- `pending_real_source` / `pendiente fuente real`.

## 4. Reglas de seguridad

El bridge mantiene:

- `mode = preview_only`;
- `sourceSafe = true`;
- `isSyntheticOrSanitized = true`;
- `containsRawSensitiveData = false`;
- sourceRefs opacas `ref://...`;
- real activation en falso;
- writeRequested en falso;
- deployRequested en falso;
- safeState con production/deploy/merge/import/providers/pagos/notificaciones en falso.

## 5. Areas cubiertas

El bridge cubre las areas ya disponibles en el runner:

- admin configurability;
- conflict review/import readiness;
- questionnaire routing;
- visit lifecycle;
- settlement eligibility;
- evidence storage;
- historical import clean;
- assignment sync conflict;
- notification outbox;
- project/tenant rule versioning;
- rule change changelog notification;
- release readiness snapshot.

## 6. Impacto Phase A

Este bloque avanza Phase A porque deja listo un contrato entre diagnostico backend y UX futura, sin activar operacion real.

La plataforma podra mostrar readiness agregado para:

- HR/plataforma sync;
- imports limpios;
- conflictos;
- rutas de cuestionario;
- ciclo de visita;
- evidencias;
- liquidaciones/pagos;
- reglas por proyecto;
- notificaciones;
- release readiness.

## 7. Impacto Claude/prototipo

Si Claude implementa panel visual de readiness, debe consumir este patron conceptual:

- fila por area;
- estado honesto;
- gate apagado;
- sourceRef opaca;
- razon visible;
- revision humana cuando aplique;
- sin claims de produccion real.

Claude no debe mostrar:

- produccion lista;
- import real;
- sync real;
- envio real;
- pago real;
- provider activo;
- Firestore conectado;
- HR sincronizada;
- deploy realizado.

## 8. Impacto Academia

Academia debe explicar:

- como un reporte de validadores se convierte en dashboard;
- que significa source-safe;
- que significa fixture sintetico;
- que significa gate apagado;
- como leer warnings/fails/blockers;
- por que un GO preview no es autorizacion de produccion;
- por que la revision humana sigue siendo obligatoria.

## 9. Hallazgo visual Academia agregado durante este bloque

En la captura compartida por Paula se observa que Academia muestra botones como Manuales, Consultora, Crear con IA, Cargar recurso y + Categoria, pero no se ve una opcion visible de borrar, archivar, duplicar o versionar cursos.

Ese hallazgo queda como pendiente Claude/prototipo, no como cambio backend. Academia debe tener administracion completa de cursos/manuales/checklists/glosario con crear, editar, archivar/borrar controlado, duplicar, versionar y revision humana.

## 10. Clasificacion obligatoria

- Reusable CXOrbia: si. Bridge reusable entre reportes source-safe y dashboard de readiness.
- Exclusivo cliente: no. TyA puede usarlo, pero no hardcodea TyA ni HR real.
- Claude/prototipo: si. Define como debe verse readiness en UI futura y agrega pendiente visual de Academia.
- Academia: si. Requiere curso/manual sobre lectura de readiness y administracion profunda de Academia.
- Sin impacto Claude: no toca UI, pero genera pendientes de prototipo claros.

## 11. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles.
