# PAQUETE EXCLUSIVO PARA CLAUDE — V157 P0 CIERRE FINAL

Fecha: 2026-07-17  
Estado: **ACTIVO, FOCALIZADO Y OBLIGATORIO**

## 1. Fuente única

Trabaja exclusivamente sobre:

- `Prototype development request CXOrbia V157.zip`
- SHA-256: `847161d6dfefe252d43e317f113fab9298bff6ff92143abdd0521e9d21f1fa48`
- 256 archivos.
- Preserva los 9 archivos modificados en V157.

No vuelvas a V156 ni a `fix.zip`. No reconstruyas R19 ni módulos ya cerrados.

## 2. Decisión de auditoría

V157 es una corrección parcial útil, pero queda `P0_PROVEN_COMMERCIAL_GATE_INCOMPLETE_V157`.

No entregues otro barrido parcial ni preguntes si debes seguir. Revisa y cierra en una sola candidata todos los puntos de este documento.

## 3. Lo que corresponde exclusivamente a Claude

### P0-1. Vocabulario comercial fail-closed

Corrige rutas y acciones visibles en:

1. `app/modules/hr-source.js`
   - no mostrar `sourceRef` crudo;
   - reemplazar fallback `|| sc.sourceReadMode` por `No disponible`;
   - traducir `reviewQueue`, `runtimeSyncActive` y nombres internos antes del DOM.
2. `app/modules/cert.js`
   - retirar de mensajes visibles `backend`, `gate`, `Auth`, `auditRef` y estados/códigos internos;
   - conservar significado honesto: práctica, pendiente de activación, requiere revisión y no publicado.
3. `app/modules/administrabilidad.js`
   - `Reglas & gates` → `Reglas y autorizaciones`;
   - retirar `activación de backend`, `runtime`, `preview` y explicaciones de infraestructura en pestañas comerciales.
4. `app/modules/crm.js`
   - retirar `pendiente activación backend` de la pestaña financiera.
5. `app/modules/finanzas.js`
   - retirar `cruce real pendiente backend` del detalle de lote sin convertirlo en pago confirmado.
6. `app/modules/automatizaciones.js`
   - retirar `gate pendiente` y cualquier jerga técnica visible; usar `Requiere autorización` o `Pendiente de activación`.
7. `app/core/data-source.js`
   - `label()` debe ser fail-closed: estado desconocido → `Estado no disponible`, nunca `this.mode` crudo.
8. `app/core/topbar.js`
   - retirar el fallback visible `envío real pendiente backend` aunque sea una ruta secundaria.

### P0-2. Manuales y Academia comerciales

1. `app/core/manuales-data.js`
   - los manuales disponibles para roles comerciales no pueden mostrar `pending_backend`, `connectionRef`, payload, adapter, API keys, webhooks, secretos ni instrucciones de arquitectura;
   - sustituirlos por estado, responsable, siguiente paso y significado comercial;
   - el contenido realmente técnico debe quedar en una colección/ruta excluida por autorización técnica real.
2. `app/modules/academia.js`
   - `a_backend` técnico permanece oculto mediante `hasTechAccess()`;
   - `a_backend_prepared`, visible a administradores comerciales, debe reescribirse como `Capacidades pendientes de activación`, sin gate, preview, fixtures, release readiness, synthetic pack, Firebase, Make, Gemini, Storage ni jerga de desarrollo;
   - el glosario comercial no puede mostrar `manual_review_required`, `held_for_conflict`, `batchId`, `paymentItemId`, `movementId` ni otros códigos crudos; usar equivalentes comerciales;
   - búsqueda, recomendaciones, categorías y deep-links no deben devolver contenido técnico;
   - conserva cursos, edición, duplicación, archivo/restauración, versionado, estados, rutas por rol, checklists y notificaciones ya implementados.

### P0-3. Continuidad interna frontend

Actualiza dentro de la candidata:

- `app/docs/RESUMEN-PARA-CLAUDE.md`;
- `app/docs/PENDIENTES-PROTOTIPO.md`;
- `app/docs/CAMBIOS-PROTOTIPO.md` o addendum V158;
- reporte de entrega V158.

Eliminar V82 como estado actual. Registrar:

- fuente V157 y su SHA;
- identidad nueva V158;
- delta exacto;
- los 9 cambios V157 preservados;
- cada archivo nuevo modificado;
- P0 corregidos;
- Academia actualizada;
- pruebas que sí ejecutaste y pruebas no ejecutadas;
- tareas que quedan para ChatGPT/Codex.

## 4. Lo que NO debes hacer

- No tocar `backend/**`, `tools/**`, workflows, Firebase, datos TyA, adapters TyA, R11D/R14C, pagos reales o integraciones reales.
- No rehacer proyecto/periodo, KPIs, estados ortogonales, Finanzas base, PWA, fixtures ni catálogo Retail/Banca/Restaurantes.
- No fabricar SHA, aggregate, manifest PASS, smoke runtime o resultados de navegador.
- No detenerte por no poder generar hashes: ChatGPT/Codex hará manifest, build-lock y gates después.
- No devolver otra explicación sin candidata completa.

## 5. Matriz obligatoria de entrega

Devuelve una tabla con cada fila:

- `hr-source.js`;
- `cert.js`;
- `administrabilidad.js`;
- `crm.js`;
- `finanzas.js`;
- `automatizaciones.js`;
- `data-source.js`;
- `topbar.js`;
- `manuales-data.js`;
- `academia.js`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- changelog/reporte V158.

Estados permitidos:

- `CORREGIDO`;
- `PRESERVADO_VERIFICADO`;
- `NO_APLICA_CON_EVIDENCIA`.

No puede quedar ninguna fila sin clasificar.

## 6. Entrega

- Candidata ZIP completa con identidad V158.
- Lista exacta de archivos modificados/agregados/eliminados.
- Reporte y matriz de cumplimiento.
- Sin backend, ramas, PR, PowerShell ni metodología nueva.

ChatGPT/Codex auditará únicamente el delta V157→V158. Si no hay P0, aplicará `APPLY_DELTA_DIRECTLY` sobre la rama viva y generará manifest/build-lock/gates de la unión.