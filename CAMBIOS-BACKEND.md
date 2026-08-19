# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4E-REUSE-PASS-I4F-ACTIVE-36`

**Avance formal canónico:** **60% completado / 40% pendiente**. El lock no asigna subpesos a I4-A..F; por eso el porcentaje formal no cambia hasta cerrar I4 completo.

## Corrección metodológica — no rehacer Finanzas
La revisión del HEAD vivo confirmó que el wiring financiero de `CX.data` ya existía y estaba cargado en el carril backend DEV. Por tanto, `I4D_FINANCE_PHASE_A_CX_DATA_READ_WIRING` no debía abrirse como una implementación nueva.

Activos existentes reutilizados:
- `app/core/backend-cxdata-finance-read.js` — bridge de lectura financiera sobre `CX.data`.
- `app/adapters/tya-financial-canonical-source-safe-adapter.js` — verdad financiera/histórica canónica sobre `CX.data`.
- `app/adapters/tya-canonical-finance-read-model-v2.js` — Finance/Liquidaciones read model v2.
- `app/index-backend-dev.html` — ya carga estos activos en el runtime DEV protegido.

No se tocó ni reescribió ninguno de esos archivos. Finance V2/historical queda preservado.

## Qué sí fue nuevo en I4-D
Solo se cerró una brecha de verdad histórica de pago para Phase A: Mayo 2026 44/44 pagadas; Junio 2026 44 visitas, 2 pagadas y 42 pendientes; Q451 total confirmado en junio. También se endureció el verifier source-safe a 24 aserciones para fijar claves estables y la regla `liquidada != pagada`.

No existe evidencia de ejecución del verifier en GitHub Actions ni se afirma ejecución local como gate. El cierre I4-D se sustenta en inspección de fuente viva y reutilización del wiring ya existente.

**Estado I4-D:** `PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.

## I4-E Multi-proyecto/no-code — reutilizado y alineado
La siguiente auditoría de reutilización confirmó que este bloque también estaba ampliamente resuelto y no debía reconstruirse:
- `app/modules/proyecto-wizard.js` ya crea/configura proyectos sin código.
- `app/modules/proyectos.js` ya administra configuración por proyecto/período.
- `app/modules/cert.js` ya trabaja el banco de certificación por proyecto.
- `app/modules/documentos.js` ya mantiene documentos por proyecto/período.
- `app/modules/reservas.js` ya opera reservas/agendamiento por proyecto/período.
- `backend/contracts/phase-a-operational-state-machine-v1.json` ya define multi-proyecto, Cinépolis no global, agendamiento, reprogramación, cancelación, certificaciones y pagos.

La brecha real era documental/backend: `backend/contracts/phase-a-tenant-project-config-from-platform-v1.json` seguía con estado `contract_ready_frontend_ui_pending` y no enumeraba explícitamente todos los dominios exigidos por la fuente maestra. Se alineó ese contrato —sin tocar UI— para cubrir `tenantId + projectId`, país/moneda, HR origen/mapeo, cuestionario, documentos, reglas, certificación, agendamiento, reprogramación, cancelación, pagos e integraciones.

**Estado I4-E:** `PASS_I4E_MULTI_PROJECT_NO_CODE_REUSE_AND_CONTRACT_ALIGNMENT`.

Evidencia: `app/docs/evidence/I4E-MULTI-PROJECT-NOCODE-SOURCE-READINESS.json`.

## Seguridad
0 payment execution, 0 payment-state writes, 0 Make/HR/Auth/Rules/Storage/Gemini calls/writes, 0 deploy/merge/producción. Datos sensibles crudos excluidos.

## Clasificación
- Reusable CXOrbia: configuración multi-tenant/multi-proyecto y contrato no-code completo.
- Exclusivo TyA: configuración inicial TyA/Cinépolis y corte financiero Mayo/Junio.
- Claude/prototipo: preservar las superficies existentes; no reconstruir proyectos, certificación, documentos, reservas ni Finanzas.
- Academia: debe reflejar configuración por proyecto, separación liquidación/pago y gates reales.
- Sin impacto Claude: evidencia source-only y correcciones documentales/backend contractuales.

## Siguiente bloque exacto
`I4F_ACADEMIA_PHASE_A_ALIGNMENT_REUSE_AUDIT`: reutilizar primero la Academia ya construida, verificar únicamente desalineaciones reales con el estado actual de Phase A y cerrar I4 sin reabrir módulos ya resueltos.