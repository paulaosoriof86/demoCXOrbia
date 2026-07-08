# CAMBIOS-BACKEND.md

## 2026-07-08 - Synthetic input pack runner preview-only

- Se agrego `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`.
- Se agrego `app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`.
- Objetivo: ejecutar validadores preview-only con fixtures sinteticos/sanitizados y producir un reporte agregado source-safe sin fuentes reales.
- Contratos cubiertos: admin configurability, conflict review/import readiness, questionnaire routing, visit lifecycle, settlement eligibility, evidence storage e historical import clean.
- Decision tecnica: runner local reusable CXOrbia; imprime JSON por consola y opcionalmente escribe reporte JSON/MD local con `--out`, sin subir datos reales ni generar outputs por defecto en repo.
- Impacto Claude/comercializable: UI futura solo debe mostrarlo como diagnostico preview/pass-fail/warnings, sin decir production-ready, importado, sincronizado, enviado, pagado, conectado o deployado.
- Impacto Academia: explicar fixtures sinteticos, input sanitizado, prueba de contrato vs operacion real, source-safe report vs import real, limites del runner y revision humana.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Conflict review queue + import readiness contract preview-only

- Se agrego `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs`.
- Se agrego `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`.
- Objetivo: preparar una cola de revision de conflictos y readiness report de importacion para HR/plataforma/import historico/shoppers/certificaciones/rutas de cuestionario/liquidaciones/pagos, sin import real ni escrituras reales.
- Decision tecnica: contrato preview-only reusable CXOrbia; exige `sourceSafe=true`, input sintetico/sanitizado, sourceRefs opacas, llaves estables, severidad, estado de cola, auditRef y revision humana.
- Bloquea: import real, escrituras Firestore/HR/Storage, base vieja/dump viejo, proveedores activos, Make/Gemini real, pagos reales, notificaciones reales, auto-merge/auto-resolve de conflictos, dedupe visual/por nombre, overwrite sin revision, DPI, banco, NDA firmado, secretos/tokens/webhooks, adjuntos/base64/cuerpos crudos.
- Impacto Claude/comercializable: UI futura debe mostrar bandeja de conflictos, severidad, entidad, source refs opacas, estados abierto/en revision/resuelto/rechazado/archivado, readiness por area y bloqueo de import si hay blockers, sin decir importado/sincronizado/pagado/notificado si solo existe preview.
- Impacto Academia: explicar export limpio vs preview vs import real, cola de conflictos, severidades, blockers, llaves estables, prohibicion de dedupe visual, revision humana, resolved preview vs aplicado real y datos sensibles excluidos.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Drift gate root required docs allowlist

- Se actualizo `tools/release/tya-rc-phase-a-drift-gate.mjs`.
- Se agrego `app/docs/CAMBIOS-DRIFT-GATE-ROOT-DOCS-ALLOWLIST-20260708.md`.
- Objetivo: corregir el fallo puntual del `CXOrbia RC Phase A Drift Gate`, que marcaba como bloqueados los documentos raiz obligatorios `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md`.
- Decision tecnica: esos tres documentos raiz quedan permitidos en `allowedExact`, porque son parte de la documentacion obligatoria del proyecto y no son runtime.
- Estado seguro: no se abre permiso para `/app/modules`, `/app/core`, runtime, proveedores, base de datos, HR, Storage, Make, Gemini, correo, WhatsApp, pagos, imports, deploy ni produccion.

## 2026-07-08 - Admin configurability contract preview-only

- Se agrego `tools/contracts/cxorbia-admin-configurability-contract.mjs`.
- Se agrego `app/docs/ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md`.
- Objetivo: validar que NDAs, planes, reglas, HR/origen, cuestionarios, documentos, evidencias, certificaciones, Academia, notificaciones, postulaciones, shoppers, visitas, reservas, asignaciones, reprogramaciones, cancelaciones, liquidaciones, pagos, integraciones, Make, Gemini, imports, reportes, roles/permisos y gates/auditoria sean administrables por tenant/proyecto con roles, versionado, auditRef, estado y gate.
- Decision tecnica: contrato preview-only reusable CXOrbia; no hardcodea TyA/Cinepolis; bloquea ejecucion real, escrituras reales, proveedores activos, import real, notificaciones reales, pagos reales, publicacion sin revision, sobrescritura silenciosa, modificacion silenciosa de NDA aceptado, DPI, banco, NDA firmado, secretos/tokens/webhooks.
- Impacto Claude/comercializable: UI futura debe mostrar fichas administrables para NDA y planes, estados borrador/en revision/aprobado/activo/pausado/reemplazado/archivado, badges preparado/pendiente gate/requiere revision/no ejecutado, y razon obligatoria en cambios criticos.
- Impacto Academia: explicar configuracion por tenant/proyecto, plantilla/version/aceptacion/reaceptacion NDA, tipos/estados de planes, gates, revision humana, auditRef y diferencia entre preparado/preview/proveedor configurado vs ejecutado/proveedor activo.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-06 - Auditoria frontend candidate V89 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V89-CLAUDE-20260706.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V89-CLAUDE-20260706.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V89-20260706.md`.
- Se agrego `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V89-CLAUDE-20260706.md`.
- Objetivo: auditar V89 correctiva de Claude contra V88 y verificar afirmaciones sobre IDs duplicados, textos honestos P0, Academia y restricciones backend.
- Decision: V89 mejora V88, corrige IDs duplicados de Academia y algunos textos, pero NO queda como source lock final, NO production ready y NO backlog 100% cerrado porque persisten textos visibles/operativos que prometen WhatsApp/correo/HR/Make/sincronizacion/en vivo sin backend real activo.
- Estado seguro: solo auditoria documental; sin empalme frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini/WhatsApp/correo real y sin datos sensibles.

## 2026-07-06 - Auditoria frontend candidate V88 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V88-CLAUDE-20260706.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V88-CLAUDE-20260706.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V88-20260706.md`.
- Se agrego `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V88-CLAUDE-20260706.md`.
- Objetivo: auditar V88 correctiva de Claude contra V86/V87 equivalente y verificar afirmaciones sobre backlog #299/#300/#301.
- Decision: V88 no queda como source lock final ni backlog 100% cerrado por textos honestos P0/P1 pendientes y IDs duplicados de Academia.
- Estado seguro: solo auditoria documental; sin empalme frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini/WhatsApp/correo real y sin datos sensibles.

## 2026-07-04 - Paquete Claude V82 source lock actualizado

- Se agrego `app/docs/PAQUETE-CLAUDE-V82-SOURCE-LOCK-PHASE-A-ACTUALIZADO-20260704.md`.
- Objetivo: entregar a Claude un paquete completo y acumulado sobre V82 source lock, incorporando pendientes V82, cambios backend recientes de liquidaciones/Cinepolis source-safe preview, pendientes de prototipo, Academia y reglas de no tocar backend.
- Decision: no pedir un candidato nuevo libre. Si Claude tiene capacidad, pedir V83 ultra-controlada sobre V82 y luego auditarla antes de aceptarla.
- Estado seguro: solo documento; sin cambios frontend, sin runtime, sin deploy, sin produccion, sin escrituras reales y sin datos sensibles.
