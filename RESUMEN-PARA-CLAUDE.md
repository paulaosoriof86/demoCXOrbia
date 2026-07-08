# RESUMEN-PARA-CLAUDE.md

## 2026-07-08 - Addendum synthetic input pack runner

- ChatGPT/backend agrego el runner preview-only `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs` y documentos `app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md` y `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`.
- El runner no toca `/app/modules` ni `/app/core`, no conecta runtime, no activa Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/import/pagos y no incluye datos sensibles.
- El runner ejecuta fixtures sinteticos/sanitizados para contratos preview-only: admin configurability, conflict review/import readiness, questionnaire routing, visit lifecycle, settlement eligibility, evidence storage e historical import clean.
- Claude debe reflejarlo solo como diagnostico preview/pass-fail/warnings si se muestra en UI. No debe mostrarlo como produccion lista.
- Copy honesto: synthetic input pack ejecutado no significa import real, provider activo, sync aplicado, pago confirmado, correo/WhatsApp enviado, Storage activo ni deploy realizado.
- Academia debe explicar fixtures sinteticos, input sanitizado, prueba de contrato vs operacion real, source-safe report vs import real, limites del runner y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## 2026-07-08 - Addendum conflict review queue + import readiness

- ChatGPT/backend agrego el contrato preview-only `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs` y documentos `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md` y `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`.
- El contrato no toca `/app/modules` ni `/app/core`, no conecta runtime, no activa Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/import/pagos y no incluye datos sensibles.
- Regla clave para prototipo comercializable: antes de cualquier import real debe existir cola de conflictos con llaves estables, sourceRefs opacas, severidad, estado, auditRef y revision humana.
- Claude debe mostrar bandeja de conflictos con estados abierto/en revision/resuelto/rechazado/archivado, severidad info/warning/blocker, entidad afectada, fuente opaca y razon obligatoria para resolver/rechazar.
- Claude debe mostrar readiness por area: proyectos, visitas, shoppers, asignaciones, certificaciones, liquidaciones, pagos y rutas de cuestionario.
- Copy honesto: `ready_preview` no significa importado; `resolved` en preview no significa aplicado real; blocker debe bloquear import hasta gate/revision futura.
- No usar dedupe visual ni por nombre para shoppers/asignaciones. Si falta llave estable suficiente, mostrar revision humana.
- Academia debe explicar export limpio vs preview vs import real, cola de conflictos, severidades, blockers, llaves estables, prohibicion de dedupe visual, revision humana y datos sensibles excluidos.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## 2026-07-08 - Addendum admin configurability contract

- ChatGPT/backend agrego el contrato preview-only `tools/contracts/cxorbia-admin-configurability-contract.mjs` y documentos `app/docs/ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md` y `app/docs/CAMBIOS-ADMIN-CONFIGURABILITY-CONTRACT-CXORBIA-20260708.md`.
- El contrato no toca `/app/modules` ni `/app/core`, no conecta runtime, no activa Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/import/pagos y no incluye datos sensibles.
- Regla clave para prototipo comercializable: todos los modulos/opciones operativas deben tender a ser administrables por tenant/proyecto desde plataforma, con roles, versionado, estado, auditRef, gate y revision humana.
- NDA debe mostrarse como plantilla/version/aceptacion/reaceptacion. Una aceptacion ya presentada o firmada no se modifica silenciosamente. Estados esperados: pendiente, aceptado, version vencida, requiere nueva aceptacion, bloqueado por gate.
- Planes deben ser configurables y versionados, no hardcodeados. Tipos: operativo, proyecto, certificacion, pagos, evidencias, automatizaciones y Academia. Estados esperados: borrador, en revision, aprobado, activo, pausado, reemplazado, archivado.
- Claude debe reflejar UI/UX administrable para configuracion por tenant/proyecto, NDA, planes, roles, gates, auditRef y estados honestos, sin prometer proveedor activo si solo esta preparado o bloqueado por gate.
- Academia debe explicar diferencia entre configuracion, plantilla, version, aceptacion, reaceptacion, plan, estado, gate, auditRef, preview/preparado y ejecutado/activo.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## 2026-07-06 - Addendum auditoria V89 Claude candidate

- Paula entrego `Prototype development request CXOrbia V89.zip` como correctiva sobre V88.
- Documentos creados: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V89-CLAUDE-20260706.md`, `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V89-CLAUDE-20260706.md`, `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V89-20260706.md` y `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V89-CLAUDE-20260706.md`.
- Validacion estatica: 97 archivos, delta V88->V89 de 3 archivos, `node --check` OK=61 FAIL=0, `index.html` sin scripts locales faltantes.
- V89 si corrige IDs duplicados de Academia: `a_backend_prepared` y `a_ops_conflicts_route`; auditoria de IDs explicitos en Academia sin duplicados.
- V89 si corrige HR writeback en `app/core/automations.js` y dos textos de reprogramacion en `app/modules/postulaciones.js`.
- V89 NO cierra P0 ni backlog 100%: persisten textos operativos como `WhatsApp enviado`, `Correo enviado`, `HR sincronizada`, `shopper notificado`, `Payload de prueba enviado`, `cuestionario enviado`, `sincronizado/sincronizada` y badges/textos `En vivo` donde no hay proveedor/gate real activo.
- Decision: no source lock final, no production ready, no backlog cerrado. Claude debe entregar una candidata ultra-corta corrigiendo solo residuos de textos honestos y coherencia Academia/manuales, sin tocar backend, contracts, tools, Firestore/Auth/Storage, Make, Gemini, WhatsApp, correo real, deploy ni produccion.
- Estado seguro: solo auditoria/documentacion; sin empalme frontend, sin runtime, sin deploy, sin produccion, sin escritura real y sin datos sensibles.

## 2026-07-06 - Addendum auditoria V88 Claude candidate

- Paula entrego `Prototype development request CXOrbia V88.zip` como candidata correctiva P0/P1/P2.
- Documentos creados: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V88-CLAUDE-20260706.md`, `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V88-CLAUDE-20260706.md`, `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V88-20260706.md` y `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V88-CLAUDE-20260706.md`.
- Validacion estatica V88: 97 archivos, delta real frente a V86/V87 equivalente de 4 archivos, `node --check` OK=61 FAIL=0, `index.html` sin scripts locales faltantes.
- V88 no quedo como source lock final ni backlog 100% cerrado: #299 quedo parcial, #300 agrego curso pero con ID duplicado `a_backend`, #301 agrego ruta ops pero con ID duplicado `a_ops`.
- Claude debia entregar V89 ultra-corta con IDs unicos y textos honestos residuales, sin tocar backend ni integraciones reales.
- Estado seguro: solo auditoria/documentacion; sin empalme frontend, sin runtime, sin deploy, sin produccion, sin escritura real y sin datos sensibles.
