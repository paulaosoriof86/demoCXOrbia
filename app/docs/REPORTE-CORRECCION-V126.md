# REPORTE DE CORRECCIÓN — V126 (matriz gaps 3, 4 y 5)

Baseline: `Prototype development request CXOrbia V125.zip`.

## Gap 3 — Carpeta externa por referencia opaca: PASS_COMPROBADO
`modules/documentos.js`: campo `externalFolderRef` en editar/subir recurso —
referencia OPACA (ej. `FLD-7f2a91`), nunca nombre de proveedor ni URL real.
Badge visible en la tarjeta del documento cuando está presente.

## Gap 4 — Vínculo Documento↔Visita individual: PASS_COMPROBADO
`modules/documentos.js`: selector opcional "Vincular a visita" (editar y
subir) sobre `data._visitas` del proyecto activo; badge `🔗 <sucursal>` en
la tarjeta cuando el documento está vinculado a una visita específica —
antes un documento solo existía a nivel de proyecto.

## Gap 5 — Identidad de contacto compartida: PASS_COMPROBADO
`modules/clientes.js`: nueva `_syncContacts()` sincroniza cada contacto de
un cliente a `CX.crmStore.contactos()` con `linkKey` DETERMINÍSTICO
(`clientId+email` o `clientId+nombre`) — mismo patrón que ya usaba
`addClient()` para sincronizar la Cuenta (no se inventó un mecanismo nuevo).
Crea la Cuenta CRM si el cliente fue sembrado directamente (sin pasar por
`addClient()`) para no dejar `cuentaId` huérfano — bug real encontrado y
corregido durante la prueba de esta misma ronda (primera versión probada
devolvía `cuentaId:null` para clientes semilla).

**Probado en runtime:** documento con `externalFolderRef`+`visitaId` se
guarda y muestra badges correctos; contacto agregado a un cliente aparece
en `CX.crmStore.contactos()` con `cuentaId` real (no null); 48/48 módulos ×
3 roles sin error.

## Matriz CRM/Documentos/Configuración: los 5 gaps identificados quedan
cerrados (gaps 1-2 en V125, gaps 3-5 en esta ronda).

## Gate técnico
- Sintaxis: PASS (2 archivos). Smoke 48×3: sin error. Manifest V126
  regenerado, 0 diffs.
