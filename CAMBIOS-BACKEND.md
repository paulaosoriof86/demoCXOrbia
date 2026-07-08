# CAMBIOS-BACKEND.md

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

## 2026-07-04 - Liquidaciones/Cinepolis source-safe preview validator Phase A

- Se agrego `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`.
- Se agrego `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`.
- Se agrego `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`.
- Se agrego `app/docs/ACADEMIA-IMPACT-LIQUIDACIONES-CINEPOLIS-SOURCE-SAFE-PREVIEW-TYA-20260704.md`.
- Se agrego `app/docs/CAMBIOS-BACKEND-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`.
- Objetivo: cerrar el siguiente bloque del tracker con preview validator y source-safe mapping para liquidaciones/corte junio y Cinepolis Boleto/Combo sin leer archivos reales ni datos sensibles.
- Decision tecnica: el validador solo acepta entrada sintetica o sanitizada con `sourceSafe=true`, `containsRawSensitiveData=false` e `isSyntheticOrSanitized=true`; si faltan llaves estables, referencia de pago o aparecen campos sensibles, pasa a `manual_review_required`/conflicto.
- Impacto Claude/comercializable: Mis beneficios, Admin/Liquidaciones y Movimientos deben separar honorario, Boleto, Combo, total, lote/item y estados honestos sin prometer pagos reales ni exponer banco/DPI/NDA.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin lectura de fuentes reales, sin Firestore writes, sin HR writes, sin pagos reales, sin Make/Gemini/correo real y sin datos sensibles.

## 2026-07-04 - Auditoria frontend candidate V82 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V82-CLAUDE-20260704.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md` con el addendum V82.
- Se actualizo `PENDIENTES-PROTOTIPO.md` con pendientes V82.
- Objetivo: auditar el nuevo ZIP de Claude sin empalmarlo y sin cambiar baseline/source lock.
- Decision: V82 corrige la mayoria de pendientes V81, pero todavia no se recomienda source lock porque quedan textos `cuestionario enviado`, textos de HR sync real en `misvisitas.js` y `postulaciones.js`, y ajuste fino de `revision-admin.js` para `status`, `projectId` y `hrRowId`.
- Estado seguro: sin empalme V82, sin source lock V82, sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin HR writes, sin Make/Gemini/WhatsApp real y sin cambios frontend aplicados.

## 2026-07-04 - Auditoria frontend candidate V81 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V81-CLAUDE-20260704.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md` con el addendum V81.
- Se actualizo `PENDIENTES-PROTOTIPO.md` con pendientes V81.
- Objetivo: auditar el nuevo ZIP de Claude sin empalmarlo y sin cambiar baseline/source lock.
- Decision: V81 mejora V80, pero no debe empalmarse completo todavia porque faltan defaults Phase A en `proyecto-wizard.js`, quedan textos `cuestionario enviado`, `revision-admin.js` aun no cumple estructura contractual/auditTrail completa, y `misvisitas.js` aun promete sincronizacion HR.
- Estado seguro: sin empalme V81, sin source lock V81, sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin HR writes, sin Make/Gemini/WhatsApp real y sin cambios frontend aplicados.
