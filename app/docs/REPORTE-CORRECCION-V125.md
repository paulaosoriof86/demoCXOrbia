# REPORTE DE CORRECCIÓN — V125 (matriz gaps 1 y 2: permisos + historial)

Baseline: `Prototype development request CXOrbia V124.zip`.
Prioriza gaps 1 y 2 de `MATRIZ-CRM-DOCUMENTOS-CONFIGURACION-V123.md`.

## Gap 1 — Permisos: PASS_COMPROBADO

Nuevas acciones registradas en `core/permissions.js DEFAULTS`:
`documento.edit`, `documento.delete`, `cliente.edit`, `crm.edit` (default
`['super','admin']`, configurables desde la matriz de Configuración →
Usuarios y Permisos, igual que el resto).

- `modules/documentos.js`: editar y eliminar un documento ahora exigen
  `CX.permissions.gate('documento.edit'/'documento.delete', ctx, ui)` antes
  de mutar — antes cualquier click ejecutaba sin validar rol/contexto.
- `modules/clientes.js`: guardar edición de cliente exige
  `CX.permissions.gate('cliente.edit', ...)`.
- `modules/crm.js`: el gate se puso en el ÚNICO punto real de mutación
  (`move()`), no en cada call-site (botón "Ganar", drag-and-drop, etc.) —
  así ningún camino nuevo puede saltarse la validación.

## Gap 2 — Historial: PASS_COMPROBADO

Documentos y Clientes ahora registran cada cambio en la bitácora única
(`CX.automations.logAction()`, ya con `ctx` completo desde V123) — no se creó
una segunda tabla de auditoría paralela:
- Documento editado/eliminado → entrada con id, nombre (antes/después si
  cambió), actor, fecha, ctx.
- Cliente editado → entrada con campos que cambiaron, actor, fecha, ctx.
- Oportunidad de CRM movida de etapa → entrada con empresa, etapa anterior
  → nueva, actor, fecha, ctx.

Probado en runtime: las 4 acciones registradas en `CX.permissions.ACTIONS`;
`crmStore.move()` gatea, muta y genera una entrada de auditoría con `ctx`
completo (6 campos correctos); 48/48 módulos × 3 roles sin error.

## Pendiente de la matriz (gaps 3-5, no priorizados en esta ronda)
- Carpeta externa por referencia opaca en Documentos.
- Vínculo Documento↔Visita individual (hoy solo Documento↔Proyecto).
- Identidad de contacto compartida entre `clientes.js` y `crm.js`.

## Gate técnico
- Sintaxis: PASS (4 archivos). Smoke 48×3: sin error. Manifest V125
  regenerado, 0 diffs.
