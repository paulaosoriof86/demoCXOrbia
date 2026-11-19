# ADDENDUM PREVALENTE I3 — Pruebas Chrome/Chromium reemplazan checkpoint humano de rutina

**Fecha autorizante:** 2026-11-19. **Autorización:** instrucción expresa de Paula en CXOrbia Recovery — Go-Live.  
**Iteración:** I3. **Estado al congelar:** HOLD. **Repo/rama:** `paulaosoriof86/demoCXOrbia` / `recovery/cxorbia-phase-a-20260831`.  
**HEAD leído antes de este control-only write:** `38618a74505583c8143477c6ed26640a8472150d`. **Producto certificado en DEV:** `836a498063987f0fc471599723b4c4772d1aba09`, tree `f351b9704488ce8a2d6c8d40a9426a1d012bd152`.  
**Evidencia integral C3:** 6/21 MATCH y 15 pendientes; un PASS focal no acredita por sí solo el dominio terminal. **Producción:** DO_NOT_TOUCH.

## 1. BEFORE / causa / decisión explícita

La autoridad histórica I3 aún mencionaba `HUMAN_PASS`, `human checkpoint`, pruebas manuales de Paula y validación por capturas de una candidata. Aunque hubo E2E Chromium/Playwright auténtico sobre DEV —p.ej. RUN 2631, job A08 de roles—, esa evidencia no se transfirió automáticamente a la certificación integral; el mismo RUN 2631 falló antes de gates terminales por `RELEASE_COMPOSITION_FAILURE:UNDECLARED_PRODUCT_DRIFT_AFTER_CANONICAL_CANDIDATE` en seis archivos HR/proyectos.

Paula sustituye expresamente el checkpoint humano recurrente de pruebas funcionales y visuales por ejecución directa automatizada en Chrome/Chromium. No es una exención de contratos funcionales ni de Gate20/Gate21, sino un cambio del **ejecutor de aceptación** para pruebas reproducibles. No debe solicitarse a Paula que repita las rutas y casos que el propio sistema puede probar y readbackear.

## 2. AFTER — aceptación con evidencia automatizada, no autodeclaración

1. La prueba funcional y visual de I3 se hace mediante navegador Chrome/Chromium sobre la URL DEV **efectivamente servida**, por roles Admin, Shopper, Cliente cuando aplican, en tenant/proyecto/período/país correctos; se exige autenticación real cuando el contrato la requiera.
2. Cada obligación debe incluir: ID/domain/owner, caso, revisión externa exacta cuando afecte HR, expected/observed, navegador/viewport, screenshots relevantes y marcadores/acciones del DOM, SHA de source/tree, hashes de assets servidos, hostingVersion/runtimeRevision/runtimeDigest, receipts de backend/provider ACK, readback remoto/reload/idempotencia cuando aplique.
3. Los E2E sólo visuales/read-only no reemplazan `providerAck`, escritura durable, autorización negativa, login con contraseña ni pruebas de asignación/postulación/finanzas. Cualquier caso no demostrado queda HOLD con dueño y prueba exacta pendiente.
4. El estado legado `HUMAN_PASS` no debe ser un bloqueador por ausencia de una sesión manual de Paula cuando exista evidencia Chrome equivalente de los criterios aprobados. Donde el control técnico aún lo exija, corregir focalmente el owner de la transición de estado, con prueba negativa de que NO se promueven recibos falsos; no editar un puntero para forzar PASS.
5. Los E2E previos se conservan con identidad exacta de artifact; no se trasladan a otro source/HR revision por intuición. Baseline visual aprobado e integridad modular son obligatorios; aprobación subjetiva nueva se consulta sólo si no existe criterio aprobado y material.
6. No usar el navegador local de Paula como requisito. Un runner Chromium autenticado y verificable en el workflow canónico de GitHub Actions cumple esta sustitución. El acceso externo al Chrome local puede estar limitado por permisos; ello no obliga a delegar pruebas a Paula.
7. Paula sólo interviene para: decisión empresarial nueva no resuelta, credencial/IAM realmente imposible de automatizar, o **autorización expresa I4 del artefacto exacto**, con `I3=GO`. No introducir otro control manual ni reinterpretar esta instrucción como autorización productiva.

## 3. Plan de cierre I3 dentro del carril vigente (sin otra metodología)

**Paquete 1 — release composition:** probar el owner y el semantic diff de seis archivos HR/proyectos creados después de source `836a4980...`; incorporar sólo deltas previamente aprobados en la misma candidata acumulativa, manifest/matrix/ledger coherentes; ejecutar guard canónico hasta que fuente/control/artefacto coincidan, sin desactivar guard.

**Paquete 2 — B14:** usar hojas originales Excel/OneDrive separadas por país; confirmar la identidad de cada libro, pestañas y esquema GT/HN; completar un proveedor Graph/Make con read-after-write independiente, reintentos acotados, revisión/ACK/idempotencia y resolución de conflictos; repetir fixture aislado GT (HN ya probó segunda/tercera lectura). Solo entonces probar vía comando real CXOrbia DEV con configuración scoped por proyecto-país-período. No escribir filas operativas sin autorización específica.

**Paquete 3 — A08/roles:** preservar corrección de equivalencia `Admin/Shopper/Cliente` vs `admin/shopper/client` y variantes `super/cliente` sin ampliar permisos. Terminar contraseñas ordinarias de tres excepciones y negativas API/Storage, verificadas por Chromium/servidor y contra misma revisión HR.

**Paquete 4 — otros 15 pendientes:** para cada dominio, recuperar owner y `terminalRequiredObligationIds` de descriptor/registry/matrix; aprovechar pruebas exactas ya válidas; ejecutar sólo obligaciones faltantes con navegador o proveedor según contrato; registrar receipt real y promover un dominio sólo tras `MATCH` terminal. Ninguna meta por iteración obliga inventar PASS.

**Paquete 5 — Gate20/Gate21:** realizar prueba visual semántica automatizada contra aprobaciones anteriores sobre un solo build/artifact, mismo source/tree, DOM screenshots/acciones; Gate21 deriva únicamente del manifest y digest del mismo artifact, sin rebuild ni segundo source pointer. Emitir `I3=GO` sólo con 21/21 requisitos obligatorios PASS.

**Paquete 6 — I4:** con `I3=GO` solicitar una sola autorización exacta a Paula; desplegar únicamente el artifact certificado en `https://tya-plataforma.web.app/`, verificar HR live, Admin/Shopper, KPIs, asignaciones, postulaciones, no duplicados, Hosting/runtime digest y crear `PRODUCTION_LOCK`.

**Anti-bucle:** ninguna nueva iteración estructural, candidata, rama, workflow alterno, overlay, importación de datos, reauditoría general ni reimplementación de módulos. Un FAIL se clasifica por owner exacto, se corrige en I3 y se repite su gate. No tocar producción ni convertir 6/21 a 21/21 por una excepción manual.

## 4. Evidencia que NO se ha resuelto al congelar

- RUN 2631 CI falla en `canonical-candidate-authority` por seis archivos `app/modules/hr-source.js`, `app/modules/proyecto-wizard.js`, `app/modules/proyectos.js`, `backend/contracts/cxorbia-project-source-contract-v1.json`, `backend/runtime/cxorbia-country-hr-binding-v1.mjs`, `backend/runtime/cxorbia-project-command-provider-v1.mjs`.
- A08: evidencia DEV positiva de lectura protegida, negativas Firestore y clasificación de membresía histórica deshabilitada; pendientes contraseñas ordinarias, negativas API/Storage completas, KPI HR fresh.
- B14: Make GET metadata original GT/HN PASS; prueba temporal Graph HN con readback diferido PASS; GT primer readback vacío pese a HTTP200; ambas hojas temporales borradas con inventario posterior (35 GT / 34 HN); operaciones reales no escritas y puente comando real aún pendiente.
- Chrome local: pestaña DEV identificada pero lectura del navegador conectada rechazada por permisos de extensión. Navegador externo TinyFish: ejecución no inició por saldo insuficiente. **Ninguno** es acreditación funcional. Continúa siendo válida la alternativa existente GitHub Actions + Playwright/Chromium.
- I3=HOLD; producción sin cambios y sin autorización I4.

## 5. Control, precedencia y continuidad

Este addendum prevalece únicamente sobre la exigencia de checkpoint humano manual de rutina en documentos históricos I3; **no** modifica requisitos P0 ni se usa como recibo técnico de aprobación. Conserva precedencia de Addendum Recovery, lock monotónico y plan V1.1. El estado técnico futuro lo determinan exclusivamente recibos de tests, manifests y readbacks vivos; registrar cada paquete con BEFORE/AFTER y SHA, sin editar este archivo congelado.
