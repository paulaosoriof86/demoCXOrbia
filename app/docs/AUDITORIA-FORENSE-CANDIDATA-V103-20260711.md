# AUDITORÍA FORENSE PROFUNDA — CXORBIA V103

**Fecha:** 2026-07-11  
**Candidata:** `Prototype development request CXOrbia V103.zip`  
**SHA-256 del ZIP:** `85395dc4cb5cc24e14b67ff6d2e1b0e3027675a621dc18ab5fb5f61a2c387e04`

## Decisión

**HOLD — V103 es una candidata correcta de CXOrbia y contiene avances útiles, pero todavía no debe empalmarse ni convertirse en source lock.**

No existe contaminación Orbit. La raíz es `app/`, el namespace es `window.CX`, hay 49 módulos `CX.module(...)` únicos y la estructura corresponde a CXOrbia.

Persisten bloqueadores P0:

1. manifest/source lock no reproducible;
2. evidencia de smoke afirmada por el reporte pero ausente del ZIP;
3. Portal Cliente todavía fabrica personas, secciones, NPS, comparativos y fechas fuera de demo;
4. Lotes de Pago puede convertir visitas `liquidada` en pagos ejecutados sin confirmación real;
5. Certificación confunde práctica preview, `pending_backend` y habilitación operativa;
6. el contexto de permisos usa el primer país del proyecto, incorrecto para proyectos multipaís;
7. Academia conserva handlers/controles sin contexto o permiso completo;
8. sobreviven copy e instrucciones que prometen IA/Make o piden API keys;
9. topbar conserva correos demo fuera del guard de modo;
10. no existe smoke móvil/consola reproducible;
11. Dashboard conserva eliminación física de visitas sin permiso, motivo, soft-delete o revisión HR.

La baseline operativa continúa siendo el runtime Phase A empalmado. V103 sigue siendo candidata del carril de prototipo.

## Delta V101 → V103

- V101: 118 archivos.
- V103: 120 archivos.
- Agregados: 2.
- Eliminados: 0.
- Modificados: 12.
- Idénticos: 106.

Agregados:

- `docs/MANIFEST-V101-CORRECCION.json`;
- `docs/REPORTE-CORRECCION-V101-20260711.md`.

Modificados:

- `core/build-lock.js`;
- `core/manuales-data.js`;
- `core/permissions.js`;
- `modules/academia.js`;
- `modules/automatizaciones.js`;
- `modules/cert.js`;
- `modules/cliente.js`;
- `modules/dashboard.js`;
- `modules/diagnostico.js`;
- `modules/finanzas.js`;
- `modules/integraciones.js`;
- `modules/marketing.js`.

El reporte declara ocho archivos nuevos en `docs/smoke-v101/`, pero esa carpeta no existe en el ZIP. El delta real confirma que solo se agregaron manifest y reporte.

## Comparación contra runtime Phase A empalmado

- Runtime empalmado: 117 archivos.
- V103: 120 archivos.
- Agregados frente al runtime: 17.
- Ausentes en V103: 14.
- Modificados: 29.
- Idénticos: 74.

V103 no contiene:

- `core/tya-phase-a-data-source-reconcile.js`;
- `core/tya-phase-a-source-safe-preview.js`;
- `data/tya-hr-source-safe-periods.js`;
- `index-tya-phase-a-source-safe.html`;
- manifest/checksums/readme y documentos Phase A.

Durante un empalme futuro también deben preservarse las versiones del runtime de:

- `core/data.js`;
- `modules/administrabilidad.js`;
- `modules/importador.js`;
- `styles/layout.css`.

V103 nunca debe sustituir directamente el runtime empalmado.

## Validación estructural

- JavaScript revisados: 66.
- `node --check`: 0 errores.
- Scripts declarados: 66.
- Scripts locales: 64.
- Scripts faltantes: 0.
- Scripts duplicados: 0.
- Módulos registrados: 49.
- IDs únicos: 49.
- IDs duplicados: 0.
- BOM UTF-8: 0.
- Errores UTF-8: 0.
- Mojibake introducido: 0.
- `fetch()` detectado: únicamente `sw.js`.
- Llamadas directas desde módulos a Gemini/OpenAI/Anthropic/Make: no detectadas.

## Avances que deben preservarse

- Copy más honesto en Integraciones y Marketing.
- `connectionRef()` como única señal de conexión real.
- Nuevo helper `CX.permissions.ctx(extra)` como base.
- Gates de Automatizaciones, Integraciones y Diagnóstico con contexto.
- Ciclo de vida de cursos con contexto aceptado en wrappers.
- Botones de Academia parcialmente condicionados por permiso.
- Soft-delete/restauración de lecciones con motivo.
- Guard de Certificación fuera de demo cuando no hay banco.
- `branchVisits()` intenta derivar historial de `CX.data._visitas`.
- Lotes demo protegidos por modo.
- Meses previos de Dashboard capaces de mostrar ausencia de fuente.
- PWA network-first y ausencia de llamadas directas a proveedores.

## P0-1 — Source lock inválido

El manifest dice excluir `core/build-lock.js`, pero lo incluye.

- Hash declarado de `core/build-lock.js`: `0e4fd717fd4644ae8747c3367a9a4f247b7c229f5749e98b3a4cb12f716d87f1`.
- Hash real: `58858962a6f464dc9072a6ace7d965a2754c1e3b1b4ef04e77107a0c4f4820b7`.
- Aggregate declarado: `20740dc2f921095c7f3bd5ef086c8876d36f5d3f7a1155d13c1e252530fc3461`.
- Aggregate recalculado: `548471c3514aa377d3a71a8ed36f465c57575fa5691c1e6076fdcd9fc47ff22e`.

V103 tiene 120 archivos, pero el manifest enumera 104 y deja 16 fuera. No existe source lock válido.

## P0-2 — Smoke afirmado pero ausente

El reporte afirma ocho capturas nuevas; el ZIP contiene cero archivos en `docs/smoke-v101/`. No hay log de consola, JSON de rutas, evidencia móvil real ni smoke reproducible de seis perfiles.

## P0-3 — Portal Cliente fabrica datos fuera de demo

`core/cliente-data.js` mantiene generación sintética de responsable, score por sección, score previo, delta, NPS y fecha fallback. Prueba en `source_safe_preview` con una visita real de score 80 y sin desglose produjo:

```json
{
  "responsable": "N. Cabrera",
  "score": 80,
  "prev": 82,
  "delta": -2,
  "nps": 40,
  "sectionScores": {
    "recib": 82,
    "aten": 77,
    "tiemp": 74,
    "inst": 82,
    "proc": 81,
    "cierre": 77
  },
  "lastVisit": "2026-06-15"
}
```

Fuera de demo, cualquier campo ausente debe quedar `null/pending_source`; no se permite RNG ni listas de nombres para representar datos reales.

## P0-4 — Liquidación se presenta como pago

`core/liquidacion.js` convierte una visita `liquidada` en liquidación `pagada` y usa la fecha de realización como fecha de pago cuando no existe `fechaPago`.

Prueba reproducible:

```json
{
  "estado": "pagada",
  "fechaEstimadaPago": "2026-06-20",
  "pagada": true
}
```

La entrada solo tenía visita `liquidada`, realizada el 20 de junio y sin fecha de pago. Esto contradice Phase A: liquidación y pago son estados diferentes; junio conserva pagos pendientes.

Se requiere `paymentStatus`, `fechaPago` y/o `paymentBatchId` reales. Sin fuente: `pending_source/pending_review`.

## P0-5 — Dashboard conserva KPIs sin fuente

El periodo actual todavía deriva indicadores como:

- cuestionarios a tiempo = cumplimiento + 6;
- calidad = cumplimiento + 8;
- margen fallback 38;
- otras series calculadas sin periodo fuente.

Los 14 periodos reales deben alimentar el comparativo. Sin fuente, mostrar `pending_source` y `sourceRef`.

## P0-6 — Certificación preview puede habilitar visitas

`bankTakeable` acepta `approved_preview`, `pending_backend`, `confirmed` y `published`. `pending_backend` puede terminar mostrando que el shopper ya puede ejecutar visitas. También se emite evento operativo por práctica y el revisor sigue siendo texto libre.

Flujo requerido:

`draft → pending_review → approved_preview → pending_backend → confirmed/published`.

Solo `confirmed/published` backend o carryover source-safe habilita visitas reales.

## P0-7 — Contexto de permisos incorrecto en multipaís

`CX.permissions.ctx()` usa `p.countries[0]`. En un proyecto `['GT','HN']`, un usuario HN recibe contexto GT.

Prueba:

- contexto generado: `{tenantId:'t1', projectId:'p1', pais:'GT'}`;
- permiso con contexto generado: bloqueado;
- permiso con país real HN: permitido.

El contexto no debe inventar país. Debe venir de la visita/lote/registro real. También falta `entityType/entityId` y override por proyecto.

## P0-8 — Academia parcialmente autorizada por shell

Persisten acciones mostradas por `role==='admin'` y call-sites sin `ctx` en creación/edición de cursos y lecciones. Las transiciones deben usar acciones específicas `academy.review`, `academy.approve`, `academy.publish`, `academy.delete` y `academy.restore`, con el mismo contexto en visibilidad y handler.

## P0-9 — Copy/manuales/topbar no cerrados

Persisten:

- “Pega tu API key y actívala” en manuales;
- promesa de Gemini/Make en Marketing;
- re-certificación con copy de notificación real;
- toast “WhatsApp … (Make)”;
- tres correos demo y dos no leídos en topbar fuera de guard de modo.

Debe usarse únicamente estado estructurado: `prepared`, `preview`, `pending_backend`, `pending_source`, `pending_review`, `confirmed`, `failed`.

## P0-10 — Hard-delete de visitas

`modules/dashboard.js` conserva “Eliminar visita” con `splice()` directo, sin permiso, motivo, soft-delete, auditRef ni revisión de conflicto HR.

Una visita HR no se borra físicamente: se cancela/archiva, conserva `sourceRef`, registra actor/motivo/fecha y genera revisión cuando contradice HR.

## Evaluación del reporte de Claude

El reporte no se acepta como evidencia final porque:

1. afirma capturas ausentes;
2. afirma source lock verificable con hashes no reproducibles;
3. afirma cero pendientes pese a los P0 anteriores;
4. afirma fixtures cerrados aunque Portal Cliente fabrica datos;
5. afirma workflow de certificación cerrado aunque `pending_backend` puede habilitar visitas;
6. afirma contexto completo aunque el helper usa el primer país;
7. afirma gates completos en Academia con call-sites sin contexto;
8. conserva aggregates/versionado residual contradictorios.

## Instrucción exacta para la siguiente corrección

Trabajar exclusivamente sobre V103.

Preservar los avances aceptados y corregir en este orden:

1. manifest/source lock y artefactos reales;
2. Portal Cliente sin RNG fuera de demo;
3. liquidación/pago separados;
4. Dashboard desde los 14 periodos reales o `pending_source`;
5. Certificación práctica vs habilitación real;
6. permisos multipaís y contexto por entidad;
7. Academia con acciones/contexto completos;
8. copy/manuales/topbar;
9. hard-delete de visitas;
10. smoke real y reproducible.

Entrega requerida:

- ZIP completo incremental sobre V103;
- un único reporte Markdown;
- manifest reproducible y verificador;
- lista exacta de archivos;
- evidencia real de smoke dentro del ZIP;
- pendientes honestos;
- confirmación de no tocar backend-only.

## Condiciones de rechazo automático

Se rechaza la próxima candidata si:

- el manifest no reproduce hashes;
- el reporte menciona capturas ausentes;
- Portal Cliente usa RNG/nombres/fecha fallback fuera de demo;
- `liquidada` se presenta como pago confirmado;
- fecha de realización se usa como fecha de pago;
- Dashboard muestra KPI derivado sin fuente como real;
- `pending_backend` habilita visitas;
- texto libre se acepta como segundo actor;
- `ctx()` inventa primer país;
- Academia ejecuta acciones sin permiso/contexto;
- manuales piden API key o prometen Make/Gemini;
- topbar muestra correo demo fuera de demo;
- se permite hard-delete de visita HR;
- no hay smoke móvil real/consola reproducible;
- se eliminan adapters/snapshot/entry point Phase A;
- V103 sustituye directamente el runtime empalmado.

## Clasificación

### Reusable CXOrbia

Guard de fixtures, separación liquidación/pago, permisos por entidad/scope, workflow de certificación, source lock, smoke reproducible, soft-delete/auditoría.

### Exclusivo TyA/backend

HR, 14 periodos, 616 visitas, 213 shoppers, pagos de junio, carryover, adapters, Firebase y proveedores reales.

### Claude/prototipo

P0-1 a P0-10.

### Academia

Impacto alto: permisos, revisión/publicación, certificación, seguridad, manuales, notificaciones y rutas por rol.

### Sin impacto Claude

Infraestructura real, imports, proveedores, deploy y producción.

## Estado seguro

No se realizó empalme, source lock, merge, deploy, import, Auth, reglas, Firestore/Storage writes, Make/Gemini, pagos ni producción.