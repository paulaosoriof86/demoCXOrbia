# Auditoría forense candidata V105 / build interno V106

Fecha: 2026-07-11

## Identidad

Archivo recibido: `Prototype development request CXOrbia V105.zip`.
SHA-256: `582a8c98cdac7b46028bb720d1304657c6d678e99e4bc23a49e80ab440bc8206`.

La entrega tiene identidad inconsistente: el ZIP y reporte dicen V105, pero `build-lock.js`, `verify-manifest.mjs`, el manifest activo y el smoke dicen V106. La próxima candidata debe usar una sola identidad.

## Decisión

**HOLD para empalme.**

La candidata es frontend CXOrbia válida, mejora V104 y no contiene Orbit ni backend R5. Deben preservarse sus avances, pero no puede tener source lock ni empalmarse porque el manifest activo falla y permanecen P0 funcionales, de privacidad y Academia.

## Delta y estructura

- V104: 125 archivos;
- candidata: 132;
- agregados: 7;
- modificados: 8;
- eliminados: 0;
- idénticos: 117;
- 67 JS/MJS, 0 errores de sintaxis;
- 66 scripts, 0 faltantes y 0 duplicados;
- 49 módulos únicos;
- UTF-8 válido, sin BOM/mojibake nuevo.

## HECHO — no reabrir

- Histórico excluye el periodo activo por defecto.
- `liquidada` sin fuente queda `pagada_preview` y no usa fecha de realización como pago.
- El permiso geo-sensible falla cerrado cuando falta país.
- `pending_backend` no habilita certificación.
- La práctica preview no dispara evento operativo.
- Dashboard no fabrica `% a tiempo/QA` mediante `+6/+8` fuera de demo.
- Historial de estados fue restaurado con fechas/eventos existentes y empty state.
- Archivo de visita con motivo/auditRef.
- Copy puntual de WhatsApp Dashboard condicionado por gate.
- Arquitectura, 49 módulos y carril frontend-only.

## Manifest/source lock

`node docs/verify-manifest.mjs` falla:

- hash de `docs/verify-manifest.mjs` no coincide;
- aggregate declarado V106: `5e814e5913d99e903f4b5c6ff735ffa702417d318036c8cf7fb84d515442f9ab`;
- aggregate recalculado: `991785ae7c85a2d95231dc8ce9ff3744c973315651be4dcf2e108461b89db197`;
- 2 diferencias.

El manifest V105 también quedó obsoleto después de los cambios V106. El manifest V106 excluye un reporte V106 que no existe. No hay source lock válido.

## Smoke

Se incluyen tres capturas de escritorio en demo: Dashboard, Historial de visita y Lotes, más log manual que menciona Certificación. Es evidencia dirigida útil, pero no cubre source-safe, Cliente, Academia, scopes, móvil 360/390/412 ni consola/rutas reproducibles.

## P0 Portal Cliente

Prueba independiente con una visita real score 80 y sin detalles todavía produjo responsable, histórico, delta, NPS y secciones sintéticas. `core/cliente-data.js` sigue fabricando datos fuera de demo y usa cache por proyecto sin modo/fuente.

Requerido: cada métrica solo existe si llega de fuente; `null/pending_source` en faltantes; cache por tenant/proyecto/modo/sourceRevision; listas vacías seguras; sin `countries[0]` ni ausencia convertida en cero.

## P0 fixtures

La nueva purga elimina namespaces completos (`cx_users`, `cx_custom_roles`, `cx_mails`, `cx_reservas_*`) en cambios de modo. Puede borrar datos legítimos y no limpia todas las memorias/caches del mismo proceso.

Requerido: namespace por tenant+modo o provenance `source:'demo'`; purgar solo fixtures demo; resetear caches de Cliente, Configuración, Topbar, Reservas, Certificación y notificaciones; probar demo→source-safe y transiciones no-demo sin pérdida real.

## P0 pagos/lotes

`paymentSourceRef` por sí solo todavía confirma pago, aunque falten `paymentState=paid`, `paidAt`, `paymentBatchId`, actor y auditRef/sourceRecordId. Los lotes se agrupan con IDs locales inestables y preview sigue entrando como candidato.

Requerido: evidencia completa; preview fuera de lote confirmado; conservar paymentBatchId estable; Historial solo muestra pago confirmado con evidencia completa.

## P0 Beneficios

`modules/beneficios.js` conserva fallback shopper `sh1` y puede mostrar todas las liquidaciones del proyecto cuando no hay visitas del shopper. Esto puede exponer datos de terceros.

Requerido: shopper autenticado obligatorio, empty state, nunca fallback global y moneda por registro real.

## P0 permisos

Conservar el fail-closed geo-sensible. Completar call-sites con tenantId/projectId/country/entityType/entityId reales, retirar tenant desde tema visual, permitir overrides de proyecto y validar igual en botón y handler.

## P0 certificación

Conservar avances de pending_backend/práctica. Pendiente: creator/reviewer/approver autenticados y separados según política, lifecycle completo, intentos por shopper/proyecto/certificación, contexto país/entidad, re-certificación sin afirmar Make/WhatsApp enviado y gates persistidos o pending_backend.

## Finanzas/copy

Persisten CxC 15%, reembolso/faltante 85/15, presupuesto proporcional y series financieras construidas fuera de demo. Persisten textos de re-certificación/Make y manuales de Academia que contradicen la UI actual.

## Academia — alcance explícito

### Preservar

- cursos profundos por Admin/Shopper/Cliente;
- lecciones, checklists, glosarios y errores frecuentes existentes;
- crear/editar/duplicar;
- estados locales, archivo/eliminación lógica/restauración;
- versiones, auditRefs, lecciones administrables y permisos declarados.

### Implementar

1. Scope opcional por tenant, proyecto, país, rol, módulo, paquete y nivel; vacío significa global.
2. Formularios, filtros y visibilidad por scope. No inventar cursos específicos por país.
3. Call-sites con contexto real; no bloquear roles personalizados autorizados con `role==='admin'` redundante.
4. Manuales, categorías, glosarios, checklists, FAQ y recursos con permisos, versión, archivo/restauración y auditoría.
5. Creator/reviewer/approver autenticados; separación de funciones configurable y prevención de auto-aprobación.
6. `ai_draft → human_review_required → approved_preview → pending_backend → confirmed/published`.
7. Cola de revisión, observaciones, prerrequisitos, requerido/opcional, orden, fecha límite y reentrenamiento.
8. Notificaciones in-app/outbox/envío externo confirmado separadas.
9. Agregar contenido solo sobre cambios recientes: modos de datos, Cliente, pagos/lotes, certificación, permisos, conflictos, dry-run y materialización R6.

La pregunta de Claude ya está resuelta: se requieren tanto scope proyecto/país opcional como revisor/aprobador humano autenticado.

## Backend replicable y R6

Claude no toca backend, pero el frontend debe representar correctamente: modos de fuente, llaves estables, reviewQueue, liquidación≠pago, práctica≠certificación, dry-run≠materialización, outbox≠envío y estados R6 `plan_prepared`, `validated`, `pending_authorization`, `materializing`, `confirmed`, `failed`, `rollback_required`.

R6 ya tiene plan backend de 1,418 creates para una base nueva limpia. UI segura: planId/hash/conteos/blockers sin datos crudos y materialización deshabilitada mientras HOLD.

## Criterio GO

Manifest verificable; Cliente sin datos sintéticos; fixtures sin pérdida/fuga; pagos con evidencia completa; Beneficios aislado; permisos con contexto; certificación con segundo actor; Academia neta; copy corregido; smoke source-safe/Cliente/Academia/roles/móvil; 0 errores críticos; sin contaminación backend.

Hasta entonces: HOLD, sin empalme, source lock, deploy o producción.
