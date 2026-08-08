# PAQUETE CLAUDE V2 — P0 Y RESPONSABILIDADES

Fecha: 2026-07-17

## 1. Le corresponde a Claude

- UX, copy, estados, badges, tooltips, toasts, modales, tablas y accesibilidad.
- Navegación y bloqueo de contenido técnico para roles comerciales.
- `app/modules/**`.
- `app/core/**` solo para comportamiento genérico del prototipo y mapeos UI.
- `app/styles/**`.
- Documentación interna de candidata: resumen, pendientes, changelog y reporte.
- Academia, manuales, rutas, cursos, checklists, glosario y notificaciones de aprendizaje.
- ZIP completo y lista exacta de archivos tocados.

## 2. Le corresponde a ChatGPT/Codex después

- SHA-256, manifest, build-lock, `node --check`, gate estático/runtime, auditoría delta, backend/overlays, `APPLY_DELTA_DIRECTLY`, smoke, commit y push.

Claude no puede detener el trabajo frontend por no poder ejecutar estas pruebas. Debe declarar `NO EJECUTADO EN ESTE ENTORNO` y continuar.

## 3. No corresponde a Claude

- `backend/**`, `tools/**`, `.github/workflows/**`.
- Firebase, Firestore, Auth, Storage, HR real, Make/Gemini live, pagos reales o datos TyA.
- Secrets, webhooks, tokens, API keys o service accounts.
- Ramas, PR, PowerShell, integradores o metodología de empalme.

## 4. P0-A — lenguaje comercial

No puede llegar al DOM de `admin`, `ops`, `coordinador`, `aliado`, `shopper` o `cliente`:

- `backend`, `runtime`, `source-safe`, `source_safe`;
- `pending_backend`, `reviewQueue`, `auditEvents`;
- `sourceRef`, `connectionRef`;
- `manifest`, `source lock`, `BUILD_ID`, `app/docs`, `dry-run`;
- valores crudos equivalentes.

Revisar textos, badges, tooltips, aria-labels, toasts, modales, tablas, errores, estados vacíos, notificaciones, manuales, cursos, botones, tabs y drilldowns.

### Evidencia pendiente de revisión

- `core/topbar.js`: correo “pendiente backend”.
- `core/automations.js`: plantillas con “backend” y “sync backend”.
- `core/manuales-data.js`: `pending_backend`, `connectionRef` y adapters visibles.
- `modules/configuracion.js`: fallback `|| sc.sourceReadMode` y “Fuente de datos (contrato)”.
- `modules/hr-source.js`: referencias, sincronización y `reviewQueue`.
- `modules/administrabilidad.js`: “runtime” y “backend”.
- `modules/cert.js`: “gate”, “backend”, “preview”, Auth y Make.
- `modules/crm.js`: conciliación/add-ons “pendiente backend”.
- `modules/importador.js`: `reviewQueue` y “gate backend”.
- `modules/postulaciones.js`: “backend/Make” y “HR sync pendiente backend”.
- `modules/dashboard.js`, `marketing.js`, `correo.js`, `finanzas.js`, `integraciones.js`, `automatizaciones.js`, `academia.js`.

No basta que un estado pase por un mapa: revisar texto fijo, fallback y acciones derivadas.

## 5. Mapeo fail-closed

Un estado desconocido nunca muestra el valor interno. Fallback permitido: `Estado pendiente de clasificación`, `No disponible` o `Requiere revisión`.

Mapeos mínimos:

- `source_safe_preview` → `Vista previa con datos controlados`.
- `pending_backend` → `Pendiente de activación`.
- `pending_gate` → `Requiere autorización`.
- `pending_source` → `Pendiente de fuente`.
- `reviewQueue` → `Requiere revisión humana`.
- evento no ejecutado → `Preparado, no enviado`.
- import no ejecutado → `Vista previa, no importado`.
- pago no confirmado → `Liquidado` o `Programado`, nunca `Pagado`.

## 6. P0-B — contenido técnico

Curso `a_backend`, diagnóstico técnico y manuales Firebase/Gemini/Make/Storage quedan inaccesibles para roles comerciales:

- ocultos del menú;
- bloqueados por id/ruta/deep-link;
- no habilitados por query string, sessionStorage, rol demo o botón oculto;
- excluidos de búsqueda y recomendaciones de Academia.

Los manuales comerciales muestran estado, responsable y siguiente paso; no enseñan adapters, payloads, `firebaseConfig`, webhooks o secretos.

## 7. P0-C — continuidad interna

Actualizar:

- `app/docs/RESUMEN-PARA-CLAUDE.md`;
- `app/docs/PENDIENTES-PROTOTIPO.md`;
- changelog/addendum;
- reporte de entrega.

Eliminar V82 como estado actual. Registrar fuente `Prototype development request fix.zip`, identidad nueva, delta exacto, preservado, corregido, pendiente, impacto Academia y pruebas ejecutadas/no ejecutadas.

No fabricar hashes o manifest. ChatGPT/Codex los hará después.

## 8. Regla de no cierre parcial

Claude no debe responder “puedo seguir revisando”. Debe completar todo el paquete en la misma candidata y entregar la matriz final sin filas vacías.