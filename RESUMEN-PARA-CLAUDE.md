# RESUMEN-PARA-CLAUDE.md

## 2026-07-04 - Addendum auditoria V82 Claude candidate

- Paula entrego `Prototype development request CXOrbia V82.zip` como version mas reciente de Claude.
- Documento creado: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V82-CLAUDE-20260704.md`.
- V82 corrige buena parte de V81: wizard con enum canonico/defaults Phase A/URL oculta por visita, cuestionario con 5 campos de link, revision admin con estados canonicos y estructura backend-ready parcial, duplicado `plantilla lista` eliminado y documentacion interna en `app/docs`.
- Sintaxis V82 validada localmente: `node --check` sobre 61 archivos JS con `OK=61 FAIL=0`.
- V82 queda muy cerca, pero no se recomienda source lock aun. Pendientes puntuales: texto externo `cuestionario enviado` en `cuestionario-shopper.js`, `Cuestionario: enviado` en `revision-admin.js`, textos de HR sync real en `misvisitas.js` y `postulaciones.js`, y ajuste fino `status/projectId/hrRowId` en revision admin.
- Claude puede entregar una V83 ultra-corta solo con esos ajustes, o Paula puede autorizar a ChatGPT/Codex a aplicar esos parches menores antes de source lock.

## 2026-07-04 - Addendum auditoria V81 Claude candidate corregido

- Paula entrego `Prototype development request CXOrbia V81.zip`. Claude lo describe internamente como V80 corregido; no se toma como incoherencia porque Paula versiona cada entrega.
- Documento creado: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V81-CLAUDE-20260704.md`.
- V81 mejora V80: `proyecto-wizard.js` usa valores canonicos, `cuestionario-shopper.js` busca los 5 campos de link, `revision-admin.js` usa estados canonicos y fallback `CX.data.revisiones`, y `misvisitas.js` corrige el duplicado.
- Sintaxis V81 validada localmente: `node --check` sobre 61 archivos JS con `OK=61 FAIL=0`.
- V81 no queda aprobado ni como source lock todavia. Pendientes antes de empalme: restaurar defaults Phase A del wizard (`hrFuente`, `revision`, `submitido`, `contactos`), ocultar URL para `externo_visita`, eliminar textos `cuestionario enviado`, hacer `revision-admin.js` compatible con contrato/auditTrail y limpiar textos de HR sync real en `misvisitas.js`.
- Claude debe entregar una V82 corta/focalizada con esos ajustes y documentacion interna del prototipo.

## 2026-07-04 - Addendum auditoria V80 Claude candidate

- Paula entrego `Prototype development request CXOrbia V80.zip` y ChatGPT/backend hizo auditoria forense sin empalmarlo.
- Documento creado: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V80-CLAUDE-20260704.md`.
- V80 trae avance util: nuevo `app/modules/revision-admin.js`, carga en `app/index.html`, boton de revision en `app/modules/dashboard.js`, mejoras de textos honestos en automatizaciones, `nvBanner` y SaaS Console V79.
- V80 no queda aprobado ni como source lock porque trae regresiones: `proyecto-wizard.js` vuelve a usar `externa`/`link`, `cuestionario-shopper.js` no conserva todos los campos de link del fix P0, y `misvisitas.js` reintroduce `plantilla lista (plantilla lista)`.
- Claude debe corregir sobre la rama actual del repo, no empalmar el ZIP completo. Debe conservar los fixes actuales del repo para `proyecto-wizard.js` y `cuestionario-shopper.js`.
- `revision-admin.js` puede servir, pero debe mapear labels visibles a estados canonicos backend y no marcar submitido real si el proyecto es HR-driven.
- Sigue pendiente limpiar textos que prometen Make/HR/Gemini/WhatsApp real en modulos tocados.

## 2026-07-04 - Addendum Wizard Phase A completo

- ChatGPT/backend preparo el contrato de configuracion completa para Wizard Phase A sin tocar frontend.
- Archivos agregados: `app/contracts/project-wizard-phase-a.tya.contract.json`, `tools/migration/tya-project-wizard-phase-a-validator.mjs` y `app/docs/WIZARD-PHASE-A-COMPLETE-CONTRACT-TYA-20260704.md`.
- No se activo runtime, no se escribio Firestore, no se escribio HR, no se llamo Make/Gemini/WhatsApp y no hubo cambios en `/app/modules` ni `/app/core`.
- Regla clave para el prototipo comercializable: el wizard debe configurar identidad, pais/moneda, HR, cuestionario, revision, submitido, certificacion, documentos/evidencias, agenda, pagos/liquidaciones e integraciones apagadas/preparadas.
- Claude debe mapear esto al wizard visible sin hard-codear TyA/Cinepolis, sin mostrar integraciones como reales y conservando los modos de cuestionario `interna`, `externo_general`, `externo_visita`.

## 2026-07-04 - Addendum submitido HR-driven configurable Phase A

- ChatGPT/backend preparo el contrato de submitido HR-driven/configurable sin tocar frontend.
- Archivos agregados: `app/contracts/submitido-hr-driven-phase-a.tya.contract.json`, `tools/migration/tya-submitido-hr-driven-validator.mjs` y `app/docs/SUBMITIDO-HR-DRIVEN-CONFIGURABLE-PHASE-A-TYA-20260704.md`.
- No se activo runtime, no se escribio Firestore, no se escribio HR, no se llamo Make y no hubo cambios en `/app/modules` ni `/app/core`.
- Regla clave para el prototipo comercializable: el origen de submitido debe ser configurable por proyecto: HR, sistema externo, revision interna o confirmacion manual admin basada en HR.
- Para TyA/Cinepolis el modo default queda documentado como `hr_driven`.
- Claude debe mostrar submitido como estado/origen separado de cuestionario realizado, revision y liquidacion; tampoco debe mostrar HR/Make como ejecutado si el gate esta apagado.

## 2026-07-04 - Addendum admin review funcional Phase A

- ChatGPT/backend preparo el contrato funcional de revision admin Phase A sin tocar frontend.
- Archivos agregados: `app/contracts/admin-review-phase-a.tya.contract.json`, `tools/migration/tya-admin-review-contract-validator.mjs` y `app/docs/ADMIN-REVIEW-FUNCTIONAL-CONTRACT-PHASE-A-TYA-20260704.md`.
- No se activo runtime, no se escribio Firestore, no se llamo Make y no hubo cambios en `/app/modules` ni `/app/core`.
- Regla clave para el prototipo comercializable: cuestionario realizado, revision admin, submitido y liquidacion deben verse como pasos separados.
- Claude debe implementar esta separacion cuando trabaje UI: no tratar cuestionario realizado como submitido; no mostrar Make/HR como ejecutado si el gate esta apagado; permitir configuracion por proyecto del origen de submitido.
- Los labels visibles pueden variar por tenant/proyecto, pero los estados internos deben mantenerse canonicos.

## 2026-07-04 - Addendum Auth claims readiness Phase A

- ChatGPT/backend preparo readiness documental de claims Auth contra el borrador de reglas Firestore DEV/staging.
- Archivos agregados: `app/contracts/auth-claims-phase-a.tya.contract.json`, `tools/migration/tya-auth-claims-readiness-validator.mjs` y `app/docs/AUTH-CLAIMS-READINESS-FIRESTORE-RULES-PHASE-A-TYA-20260704.md`.
- No se activo Auth real, no se publicaron reglas, no se conecto runtime y no hubo cambios frontend.
- Hallazgo para conservar: el draft de reglas usa `coordinador`, mientras el contrato Phase A deja `ops` como rol canonico y `coordinador` como alias transicional pendiente de decision.
- Claude no debe resolver este punto desde UI ni inventar un nuevo rol. Si toca pantallas de roles/permisos, debe esperar la decision canonica o dejarlo documentado como pendiente.

## 2026-07-04 - Addendum V78 baseline backend

- V78 queda fijado como baseline visual actual para continuar backend TyA.
- Backend no copia archivos frontend ni toca `/app/modules` o `/app/core` desde este bloque.
- Se conserva todo lo avanzado: readiness V5, DEV controlled package, runner disabled, target validator, future runner contract, route count manifest y prewrite validator.
- Pendientes frontend concretos para Claude: `nvBanner` en Novedades y version default al crear tenant SaaS.
- Siguiente bloque backend: reporte consolidado de preautorizacion DEV staging sobre V78.
- Claude no debe tocar `tools/migration`, runners, gates backend, Firestore/Auth/Storage reales, Make real, importacion ni produccion.

## 2026-07-04 - Addendum V78 / auditoria forense y empalme backend

- V78 fue auditado contra V77.
- V78 queda aceptado como candidato visual reciente para continuar empalme backend sin copiar ni tocar frontend desde este bloque.
- Cambios V78 detectados: elimina `app/modules/rutas.js`, modifica `app/app.js` y `app/modules/saas-console.js`.
- V78 atiende PWA install-aware, releases como internos sin deploy y reduce duplicidad de Hojas de Ruta.
- Backend continua con readiness V5, DEV controlled package, runner disabled, gates y contratos.
- Claude no debe tocar `tools/migration`, runners, gates backend, Firestore/Auth/Storage reales, Make real, importacion ni produccion.

## 2026-07-04 - Addendum V77 / backend DEV controlado

- Claude debe usar el paquete forense V77 para continuar prototipo, UX y documentacion frontend.
- ChatGPT/Codex continua backend en la rama `docs-tya-v6-v71-audit`, PR #7, sin mezclar cambios visuales.
- Backend TyA llego a readiness V5: listo para revision DEV controlada, sin blockers vigentes.
- SHOPPER_REVIEW queda como politica provisional DEV; COMM_REVIEW como historico inactivo; CANDIDATE_REVIEW como candidatos no finales.
- Se preparo paquete de autorizacion DEV controlada, runner disabled, checklist de rollback, checklist de reglas, contrato de datos DEV y gates.
- Claude no debe tocar `tools/migration`, runners, gates backend, Firestore/Auth/Storage reales, Make real, importacion ni produccion.
