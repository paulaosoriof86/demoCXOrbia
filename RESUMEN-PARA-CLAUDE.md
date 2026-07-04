# RESUMEN-PARA-CLAUDE.md

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
