# Auditoría forense profunda — candidata CXOrbia V104

Fecha: 2026-07-11

## Identidad y decisión

V104 es una candidata frontend correcta de CXOrbia: raíz `app/`, namespace `window.CX`, 49 módulos únicos, sin Orbit y sin archivos backend-only `tya-phase-a-*`.

**Decisión: HOLD.** Contiene avances válidos, pero todavía no debe empalmarse contra R5 ni convertirse en source lock.

ZIP auditado: `Prototype development request CXOrbia V104.zip`  
SHA-256: `2102a99ffb28e86e14400358b722b9ed2adcd9fecb37d6bd3edd2c0fb6c31e5e`

## Delta V103 → V104

- V103: 120 archivos.
- V104: 125 archivos.
- Agregados: 5.
- Modificados: 19.
- Eliminados: 0.
- Idénticos: 101.

Agregados: dos manifests, dos reportes y `docs/verify-manifest.mjs`.

Modificados: `core/build-lock.js`, `core/finanzas-core.js`, `core/liquidacion.js`, `core/notif.js`, `core/permissions.js`, `core/topbar.js`, `modules/beneficios.js`, `modules/cert.js`, `modules/cliente-extra.js`, `modules/cliente.js`, `modules/configuracion.js`, `modules/dashboard.js`, `modules/finanzas.js`, `modules/historico.js`, `modules/misvisitas.js`, `modules/reservas.js`, `modules/visita-detalle.js`, `styles/layout.css`, `sw.js`.

## Validación estructural

- 67 JS/MJS.
- 0 errores `node --check`.
- 66 scripts en `index.html`; 64 locales; 0 faltantes y 0 duplicados.
- 49 módulos y 49 IDs únicos.
- UTF-8 válido, sin BOM.
- Sin contaminación Orbit ni backend TyA.

## Avances válidos a preservar

1. Portal Cliente agrega guards parciales para `mejorSeccion/peorSeccion` nulos.
2. Histórico excluye por defecto el periodo activo, de forma genérica.
3. Seeds iniciales de usuarios, notificaciones, reservas y correo tienen gates parciales de demo.
4. `liquidada` pasa a `pagada_preview` cuando no existe referencia de pago y ya no usa fecha de realización como fecha de pago.
5. `permissions.ctx()` dejó de asumir `countries[0]`.
6. Dashboard reemplaza hard-delete de visita por archivo local con motivo, actor, fecha y auditRef.
7. El fallback fijo de margen queda limitado a demo.
8. Se preserva la separación frontend-only: V104 no importa R5.

## Bloqueadores P0

### 1. Manifest/source lock inválido

`node docs/verify-manifest.mjs` reporta 9 diferencias. No coinciden los hashes/tamaños de `docs/verify-manifest.mjs`, `modules/beneficios.js`, `modules/misvisitas.js` y `modules/visita-detalle.js`. El aggregate declarado `b35ee5e8...` difiere del recalculado `92a16f17...`.

### 2. Smoke afirmado pero ausente

El reporte menciona seis capturas en `docs/smoke-v104/`, pero esa carpeta no existe en el ZIP. No se entregaron log de consola, JSON de rutas ni evidencias 360/390/412. Por tanto, la afirmación de 0 errores de consola no es verificable.

### 3. Reporte incompleto

El reporte enumera siete archivos de código, pero el delta real contiene 19. Omite cambios relevantes en Finanzas, Permisos, Topbar, Certificación, Dashboard, Beneficios, Mis Visitas, Detalle de Visita y SW.

### 4. Portal Cliente todavía fabrica datos

`core/cliente-data.js` sigue generando fuera de demo responsables, score anterior, delta, NPS, scores por sección y fechas. Una visita real con score 80 y sin desglose produjo responsable `S. Mejía`, prev 75, delta 5, NPS 40 y secciones fabricadas. Además, `hasScored = R.n > 0` usa cantidad de sucursales, no cantidad con score real.

### 5. Aislamiento de fixtures parcial

Los seeds iniciales tienen guard, pero valores persistidos en `cx_mails`, `cx_reservas_*` y `cx_users` pueden sobrevivir al cambio de modo. `CX.notif._items` no se purga al cambiar la fuente. Deben namespaciarse por modo/tenant o eliminar fixtures demo al salir de demo.

### 6. Pago todavía demasiado permisivo

`paymentSourceRef` por sí solo puede confirmar un pago, sin fecha, lote, estado financiero, actor o auditRef. `modules/finanzas.js` incluye `pagada_preview` en lotes considerados reales y puede etiquetarlos `Pagado`. `modules/beneficios.js` retiró el indicador preview. Persisten CxC 15% y presupuestos proporcionales sintéticos.

### 7. Certificación operativa incompleta

`pending_backend` continúa siendo takeable; prácticas pueden terminar con mensaje de habilitación y evento operativo. El revisor sigue siendo etiqueta/rol, no una persona autenticada distinta. El workflow completo draft → review → preview → pending backend → confirmed/published no está cerrado.

### 8. Permisos multipaís incompletos

Eliminar `countries[0]` fue correcto, pero handlers sensibles omiten el país real de la entidad. Sin país, una acción financiera puede pasar aunque el usuario tenga scope únicamente HN. `_tenantId()` aún puede caer al tema visual y no existen overrides de proyecto completos.

### 9. Dashboard y Finanzas conservan cálculos inventados

Persisten `cumplimiento + 6`, `cumplimiento + 8` y estimaciones financieras/budgets fuera de demo. Deben usar fuente real o `pending_source`.

### 10. Academia no fue atendida

V104 no modifica `modules/academia.js` ni `core/manuales-data.js`. Siguen pendientes lifecycle, permisos/contexto, CRUD administrable, rutas por rol, manuales profundos, checklists, errores frecuentes y notificaciones honestas.

### 11. Copy/manuales pendientes

Persisten ejemplos como “Pega tu API key”, promesas Gemini/Make, recertificación “notificados” y WhatsApp Make sin confirmación backend.

### 12. Regresión en historial de visita

`modules/visita-detalle.js` retiró la tarjeta completa de historial visible. Debe restaurarse con eventos reales o empty state; no eliminar trazabilidad.

## Evaluación de las cuatro tareas anteriores

- Portal Cliente null-safe: **PARCIAL**.
- Fixtures solo en demo: **PARCIAL**.
- Histórico excluye activo: **PASS**.
- Responsive móvil: **PENDIENTE DE EVIDENCIA**.

## Decisión de empalme

No empalmar V104 con R5. Claude conserva capacidad y debe corregir directamente V104 con un paquete acumulado frontend-only. Después ChatGPT/Codex auditarán, empalmarán de tres vías contra R5 y repetirán smoke source-safe/móvil.

## Estado seguro

Sin empalme, source lock, merge, deploy, import real, Firebase/HR writes, Make/Gemini, pagos ni producción.
