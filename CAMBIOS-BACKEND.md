# CAMBIOS-BACKEND.md

## 2026-06-30 - Fase B2/B3 V57 bulletins

- Se localizo `Prototype development request CXOrbia V57.zip` en `C:\Users\paula\Downloads`.
- Se copio `/app` desde V57 sobre la RC y se restauraron archivos backend protegidos.
- La copia visual V57 no genero diferencias adicionales en `app/index.html` ni `/app/modules`, por lo que la RC ya estaba alineada con la base V57 disponible.
- Se conservo `app/index.html` como demo normal, sin carga backend global.
- Se mantuvo `app/index-backend-dev.html` como preview backend DEV.
- Se preparo soporte Firestore local para `bulletins` y `bulletinReads` en `firestore.rules`, sin publicar reglas.
- Se actualizo `app/core/backend-bulletins.js` para leer novedades por tenant, rol, uid, shopperId, proyecto y pais, y para persistir leidos en `bulletinReads`.
- Se elimino el camino de `window.prompt` para credenciales DEV en `app/core/backend-firebase.js`.
- Validaciones locales: dry-run bulletins OK, validador bulletins OK, `node --check` OK en archivos tocados.
- Validacion de reglas con emulador Firestore no pudo completarse porque Java no esta disponible en PATH.
- No deploy, no Hosting, no merge, no produccion, no datos reales.

Registro obligatorio de cambios de backend, infraestructura y migración.

## 2026-06-30 — Corrección documental de continuidad RC/backend

Motivo:

- Se corrigió la continuidad documental para que los pendientes y el estado del backend no queden solo en la conversación.
- Paula solicitó que los pendientes se mantengan en los archivos documentales vivos y se entreguen también como descargable.
- Se mantiene la regla: si no está documentado, no se hizo.

Archivos creados/actualizados:

- `CAMBIOS-BACKEND.md`: se agrega esta entrada de control documental.
- `RESUMEN-PARA-CLAUDE.md`: se consolida el estado real de la RC, backend DEV, gates, riesgos y próximos pasos.
- `PENDIENTES-PROTOTIPO.md`: se consolidan y priorizan los pendientes reales del prototipo detectados en la RC visual correcta.
- `INCIDENCIAS-INTEGRACION-BACKEND.md`: se separan errores de integración/backend/local de los pendientes que sí corresponden a Claude/prototipo.

Estado real registrado:

- Base visual correcta: `release/cxorbia-tya-rc-20260630`, no la rama backend vieja.
- Firebase DEV validado técnicamente en `cxorbia-backend-dev`.
- HR histórico V4 y `shopperBenefits` cargados/validados técnicamente.
- Preview backend abre, pero el diagnóstico observado aún muestra datos demo/localStorage y Auth pendiente.
- No se debe considerar producción hasta que el preview muestre Auth OK, fuente Firestore, tenant TyA y conteos TyA reales.

Impacto:

- No se modificó `/app/modules`.
- No se modificó `/app/index.html`.
- No se activó backend global.
- No se hizo deploy de Hosting.
- No se tocó producción.
- No se subieron credenciales ni claves.

Pendiente/riesgo:

- Siguiente gate técnico: corregir/verificar diagnóstico del preview backend para distinguir claramente Firestore real vs localStorage/demo.
- Resolver Auth DEV sin pedir claves a Paula y sin pegar contraseñas en ChatGPT.
- No publicar como producción operativa hasta cumplir el gate mínimo documentado.

## 2026-06-30 - Preparacion release candidate desde prototipo bueno

- Se separo la rama backend de la base visual del prototipo.
- La release candidate se preparo desde `origin/main`, que contiene el prototipo CXOrbia V56 descomprimido.
- El backend validado se integrara solo como archivos seguros y controlados.
- No se hizo deploy.
- No se publico Hosting.
- No se toco produccion.
- No se reemplazo `/app/modules`.
- Siguiente gate: validacion visual RC desde `app/index.html`.

## 2026-06-27 — Infraestructura Firebase DEV

- `.firebaserc`: alias DEV para `cxorbia-backend-dev`.
- `firebase.json`: Hosting DEV con `public: app`, rewrite SPA y headers UTF-8.
- `firestore.indexes.json`: índices iniciales vacíos.
- `storage.rules`: Storage cerrado mientras esté pendiente Blaze.

Estado: sin deploy de Hosting, sin producción y sin datos reales.

## 2026-06-27 — Reglas Firestore

- `firestore.rules`: reglas multi-tenant por `tenantId`, `projectId` y rol.
- `MATRIZ-ROLES-FIRESTORE.md`: matriz de permisos y claims esperados.
- `CASOS-PRUEBA-FIRESTORE.md`: casos de prueba para validar permisos.
- `VALIDACION-ESTATICA-REGLAS-ADAPTER.md`: revisión estática entre reglas, seed y adapter.

Cambios:

- Lectura controlada para shoppers sobre visitas disponibles del proyecto asignado.
- Matriz de roles actualizada para reflejar visitas disponibles.
- Casos de prueba actualizados para shopper con proyecto, shopper sin proyecto y visitas disponibles.

Pendiente inicial: validar reglas en DEV antes de publicar o activar adapter.

## 2026-06-27 — Plan Auth DEV T&A

- `AUTH-DEV-TYA.md`: plan de usuarios DEV, roles y claims.

Pendiente: crear usuarios DEV solo con autorización expresa.

## 2026-06-27 — Producto CXOrbia vs tenant T&A

- `ARQUITECTURA-TENANTS-TYA.md`: CXOrbia sigue como producto comercializable; T&A será tenant `tya`.
- `RESUMEN-PARA-CLAUDE.md`: resumen de continuidad.
- `PENDIENTES-PROTOTIPO.md`: pendientes vivos.

## 2026-06-27 — Adapter Firestore desactivado

- `app/core/backend-config.js`: configuración Firebase DEV con `CX.BACKEND.enabled = false`.
- `app/core/backend-firebase.js`: scaffold de adapter Firestore.
- `app/index.html`: único punto de conexión para cargar backend config y adapter.
- `PLAN-VALIDACION-ADAPTER-DEV.md`: plan de validación del adapter solo en DEV/preview.
- `MAPEO-CXDATA-FIRESTORE.md`: mapeo de interfaz `CX.data` hacia colecciones Firestore.
- `RIESGOS-ASINCRONIA-CXDATA.md`: riesgos por carga asincrónica al usar Firestore.

Impacto: no se modificó `/app/modules`; la app sigue usando mock/localStorage.

## 2026-06-27 — Dataset piloto T&A

- `IMPORTACION-TYA-PILOTO.md`: plan de importación piloto.
- `VALIDACION-TYA-PILOTO.md`: checklist de validación.
- `firebase/seed-tya-piloto.json`: dataset ficticio y anonimizado.
- `firebase/README.md`: restricciones del seed.
- `PLAN-EJECUCION-SEED-TYA.md`: plan para ejecutar el seed ficticio cuando corresponda, sin credenciales en repo.
- `DISENO-SCRIPT-SEED-TYA.md`: diseño del futuro script de carga con modo dry-run y validaciones previas.
- `AUTORIZACION-DRY-RUN-SEED.md`: frase exacta requerida para permitir dry-run.
- `RESULTADO-DRY-RUN-SEED-TYA.md`: validación documental del seed sin conectar Firebase ni escribir datos.

## 2026-06-27 — Gate para base buena T&A

- `MIGRACION-BASE-BUENA-TYA.md`: condiciones para pedir/cargar el export limpio de la plataforma anterior.

Estado: todavía no corresponde cargar base real.

## 2026-06-27 — Control PR #1

- `CHECKLIST-PR1-VALIDACION.md`: checklist para mantener PR #1 como draft.
- `ESTADO-GATES-PR1.md`: matriz centralizada de gates.
- `PLAN-SINCRONIZACION-MAIN-PR1.md`: plan para sincronizar con `main` sin ejecutar sync automático.
- `CHECKLIST-POST-SYNC-PR1.md`: checklist posterior a una futura sincronización.

Estado: no merge, no deploy de Hosting, no datos reales.

## 2026-06-27 — Revisión divergencia con main

- `REVISION-DIVERGENCIA-PR1.md`: se documentó que PR #1 está detrás de `main` por 1 commit y que ese commit trae cambios amplios de prototipo frontend, core, estilos y módulos.
- `DICTAMEN-MAIN-BASE-PR1.md`: dictamen técnico; `main` parece nueva evolución del frontend, pero requiere confirmación visual/funcional antes de sincronizar PR #1.

Decisión: no sincronizar todavía. Primero confirmar si ese commit es la nueva base aprobada del prototipo y revisar `app/index.html` para conservar el punto único de conexión backend.

## 2026-06-27 — Guía de validación PR #1

- `GUIA-VALIDACION-PR1.md`: guía breve para revisar PR #1 antes de actualizarlo con `main`.

Objetivo: dejar claro qué revisar y qué punto backend debe conservarse antes de sincronizar.

## 2026-06-28 — Publicación reglas Firestore DEV

- `RESULTADO-PUBLICACION-REGLAS-DEV.md`: resultado del deploy exclusivo de reglas Firestore a Firebase DEV.
- `PENDIENTES-PROTOTIPO.md`: actualizado con gate completado, advertencia no bloqueante y archivos locales no versionados generados por emulador/validación.
- `RESUMEN-PARA-CLAUDE.md`: actualizado con sección de publicación de reglas DEV.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-REGLAS-DEV-PUBLICADAS.md`: addendum específico para Claude.
- `ESTADO-GATES-PR1.md`: actualizado para marcar Firestore rules como publicadas en DEV.

Cambio real ejecutado fuera del repo:

```text
firebase.cmd deploy --only firestore:rules --project cxorbia-backend-dev
```

Resultado:

```text
cloud.firestore: rules file firestore.rules compiled successfully
firestore: released rules firestore.rules to cloud.firestore
Deploy complete!
```

Impacto:

- Reglas Firestore publicadas únicamente en Firebase DEV `cxorbia-backend-dev`.
- No se publicó Hosting.
- No se creó ningún usuario.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.
- No se tocaron datos reales.
- No se tocó producción.
- No se modificó `/app/modules`.

Pendiente/riesgo:

- Firebase reportó advertencia no bloqueante: `[W] 51:14 - Unused function: canAccessProject.`
- PowerShell reportó archivos locales no versionados: `firebase/emulator-rules/node_modules/` y `firebase/emulator-rules/package-lock.json`; no deben commitearse.
- Siguiente gate posible: usuarios DEV ficticios y claims, solo con autorización separada.

## 2026-06-28 — Preparación usuarios DEV ficticios y claims

Autorización recibida:

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```

Archivos creados/preparados:

- `.gitignore`: exclusión de dependencias locales, salidas DEV y artefactos de emulador.
- `firebase/auth-dev-tools/package.json`: dependencia local de Firebase Admin SDK.
- `firebase/auth-dev-tools/create-dev-users-and-claims.cjs`: script local para crear/actualizar usuarios DEV ficticios y asignar custom claims.
- `PLAN-EJECUCION-USUARIOS-CLAIMS-DEV.md`: plan operativo del gate autorizado.
- `PLANTILLA-RESULTADO-USUARIOS-CLAIMS-DEV.md`: plantilla para registrar resultado después de ejecutar PowerShell.

Estado previo:

- Script preparado.
- Se intentaron rutas con Firebase Admin SDK y ADC, pero se abandonaron por complejidad operativa local.
- No se modificó `/app/modules`.

## 2026-06-28 — Usuarios DEV ficticios y claims/customAttributes importados

Archivos creados/documentados:

- `PLAN-ALTERNATIVO-AUTH-IMPORT-CLI-DEV.md`: plan alternativo sin `gcloud`, sin service account y sin mover archivos.
- `firebase/auth-dev-tools/auth-import-dev-users.cjs`: script local que genera archivo de importación Auth DEV con hash SHA256 y `customAttributes`.
- `RESULTADO-USUARIOS-CLAIMS-DEV.md`: resultado final del gate.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-AUTH-DEV-COMPLETADO.md`: addendum de continuidad para Claude.

Cambio real ejecutado fuera del repo:

```text
firebase.cmd auth:import <archivo-local-output> --hash-algo=SHA256 --rounds=1 --project cxorbia-backend-dev
```

Resultado observado:

```text
Starting importing 6 account(s).
Imported successfully.
```

Usuarios DEV ficticios importados:

- `super.dev@cxorbia-dev.example.com`
- `admin.tya.dev@cxorbia-dev.example.com`
- `ops.tya.dev@cxorbia-dev.example.com`
- `shopper.eval01.dev@cxorbia-dev.example.com`
- `cliente.tya.dev@cxorbia-dev.example.com`
- `externo.otro.dev@cxorbia-dev.example.com`

Impacto:

- Se importaron 6 usuarios ficticios en Firebase Auth DEV `cxorbia-backend-dev`.
- Se incluyeron `customAttributes` equivalentes a claims DEV.
- No se cargó seed Firestore.
- No se activó adapter.
- No se publicó Hosting.
- No se tocó producción.
- No se hizo merge.
- No se modificó `/app/modules`.

Pendiente/riesgo:

- La carpeta local `firebase/auth-dev-tools/output/` puede contener password DEV temporal y no debe subirse, pegarse ni adjuntarse.
- Siguiente gate posible: seed ficticio Firestore DEV, solo con autorización separada.

## 2026-06-28 — Aclaración tenant > cuenta > proyecto

Motivo: Paula aclaró que cada consultora puede tener varias cuentas y cada cuenta uno o más proyectos configurados dentro de la plataforma.

Archivos creados/actualizados:

- `ARQUITECTURA-JERARQUIA-TENANT-CUENTA-PROYECTO.md`: definición canónica de tenant, cuenta/cliente final, proyecto operativo y visita.
- `MAPEO-CXDATA-FIRESTORE.md`: actualizado para aclarar que `projectId` es proyecto de plataforma, no Firebase project, y que los proyectos deben llevar `accountId`/`clientId`.
- `firebase/seed-tya-piloto.json`: actualizado para incluir `clients`, `accountId`, `clientId`, `accountName` y `client` en el seed ficticio.

Decisión técnica:

- `tenant` = consultora cliente de CXOrbia.
- `clients` = cuentas/clientes finales/marcas dentro de la consultora.
- `projects` = proyectos/rondas/campañas operativas configuradas en CXOrbia.
- Las visitas siguen debajo de proyectos para respetar `CX.data.currentProjectId` y no romper módulos.

Impacto:

- No se cambió UI.
- No se tocó `/app/modules`.
- No se activó adapter.
- No se cargó seed en Firestore.
- No se tocaron datos reales.
- No se tocó producción.

Estado:

- La migración inicial sigue siendo T&A como primer tenant real.
- La arquitectura queda habilitada para más consultoras/tenants futuros, cada una con sus propias cuentas y proyectos.

## 2026-06-28 — Preparación dry-run seed ficticio actualizado

Autorización recibida:

```text
Autorizo validar en dry-run el seed ficticio actualizado en Firebase DEV, sin escribir datos, sin activar adapter, sin deploy de Hosting y sin tocar producción.
```

Archivos creados/documentados:

- `firebase/validate-seed-dry-run.cjs`: script local de validación del seed actualizado, sin conexión de escritura y sin escribir Firestore.
- `PLAN-DRY-RUN-SEED-TYA-ACTUALIZADO.md`: plan del dry-run autorizado.

Alcance:

- Validar estructura tenant > cuenta > proyecto > visita.
- Validar referencias internas de cuentas, proyectos, shoppers, visitas, postulaciones y cuestionarios.
- Mostrar rutas Firestore simuladas.
- No escribir datos.
- No activar adapter.
- No publicar Hosting.
- No tocar producción.
- No modificar `/app/modules`.

## 2026-06-28 — Preview local controlado adapter Firebase DEV

Autorización ejecutada:

```text
Paula autorizó probar el preview local controlado del adapter Firebase DEV, sin deploy de Hosting, sin merge, sin datos reales, sin modificar /app/modules y sin tocar producción.
```

Archivos creados/documentados:

- `RESULTADO-PREVIEW-CONTROLADO-ADAPTER-DEV.md`: resultado de la revisión visual local del preview.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-PREVIEW-CONTROLADO-ADAPTER-DEV.md`: addendum de continuidad para Claude.
- `PENDIENTES-PROTOTIPO.md`: actualizado con pendientes detectados en `Configuración`, módulos incompletos y observación de datos ficticios del prototipo.
- `ESTADO-GATES-PR1.md`: actualizado para marcar preview local adapter DEV como completado visual controlado, manteniendo adapter global bloqueado.

Resultado observado por Paula:

- El preview local abrió correctamente en `http://127.0.0.1:5177/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV`.
- Se mostró la insignia `Preview backend DEV`.
- Administración / Coordinación cargó.
- Portal del Cliente cargó.
- Shopper / Evaluador cargó.
- No se reportó pantalla en blanco.
- No se reportaron datos reales.
- Se visualizaron los 3 proyectos ficticios del prototipo: `Proyecto Retail`, `Proyecto Banca` y `Proyecto Restaurantes`.

Observación técnica:

- El seed Firestore DEV validado/cargado contiene 1 cuenta, 1 proyecto, 4 shoppers, 8 visitas, 3 postulaciones y 1 cuestionario.
- En la revisión visual se observaron datos ficticios del prototipo, no exclusivamente el seed Firestore DEV.
- Este gate confirma que el preview controlado no rompe la UI ni mezcla producción, pero todavía no valida render visual exclusivo desde Firestore DEV.

Impacto:

- No se hizo deploy de Hosting.
- No se hizo merge.
- No se tocaron datos reales.
- No se tocó producción.
- No se modificó `/app/modules`.
- No se activó `CX.BACKEND.enabled` principal.
- Adapter global sigue desactivado.

Pendiente/riesgo:

- `Configuración` no funciona correctamente según reporte visual de Paula.
- Hay módulos incompletos pendientes de desarrollo por Claude/frontend.
- Antes de pedir/cargar base buena T&A, se debe actualizar/corregir prototipo, confirmar base frontend y repetir validación visual con datos Firestore DEV.

## 2026-06-30 22:20:17 - Fix definitivo rules V57 desde HEAD limpio
- ARCHIVO: firestore.rules
- TIPO: modificado
- QUE CAMBIO: restaurado desde HEAD limpio e insertadas reglas faltantes despues de automations: integrationSettings, automationLogs, aiSettings, aiLogs, resources.
- POR QUE: el reporte real mostro que despues de automations pasaba directo a auditLogs y faltaban reglas requeridas para Backend V57.
- IMPACTO EN FRONTEND: ninguno directo. No se tocaron /app/modules ni logica visual.
- PENDIENTE/RIESGO: backend preview aun no se considera conectado hasta que el badge indique Fuente: firestore y Tenant: tya.

- ARCHIVO: firebase/client-write-tools/check-firestore-rules-v57-coverage.mjs
- TIPO: modificado
- QUE CAMBIO: validador reescrito para devolver exit code 1 y "ok": false si falta una regla o si el bloque no quedo insertado entre automations y auditLogs.
- POR QUE: evitar falsos OK metodologicos.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: cualquier fallo futuro debe detener commit/push.

## 2026-06-30 22:26:21 - Continuacion fix rules V57 y bloqueo CRLF
- ARCHIVO: firestore.rules
- TIPO: modificado
- QUE CAMBIO: verificadas reglas V57 faltantes entre automations y auditLogs.
- POR QUE: cerrar cobertura backend V57 sin falso OK.
- IMPACTO EN FRONTEND: ninguno; no se tocaron /app/modules.
- PENDIENTE/RIESGO: avanzar a Auth local preview y luego tenant isolation.

- ARCHIVO: firebase/client-write-tools/check-firestore-rules-v57-coverage.mjs
- TIPO: modificado
- QUE CAMBIO: validador reescrito para fallar con exit code real cuando falta cobertura.
- POR QUE: evitar reportes de exito falso.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: ningun bloque futuro debe continuar si ok:false.

- ARCHIVO: PAQUETE-PARA-CLAUDE-PENDIENTES-PROTOTIPO-V57.md
- TIPO: nuevo/modificado
- QUE CAMBIO: documento de continuidad para Claude con errores acumulados, pendientes del prototipo y reglas de separacion frontend/backend.
- POR QUE: permitir que Claude mejore el prototipo mas reciente sin perder avances backend.
- IMPACTO EN FRONTEND: guia para correcciones futuras por Claude.
- PENDIENTE/RIESGO: Claude debe trabajar siempre sobre el prototipo mas reciente.

## 2026-06-30 22:29:01 - Correccion final del bloque Git para commit/push rules V57
- ARCHIVO: firestore.rules
- TIPO: validado/modificado
- QUE CAMBIO: se conserva cobertura V57 completa: integrationSettings, automationLogs, aiSettings, aiLogs, resources.
- POR QUE: cerrar bloqueo de rules V57 antes de Auth local preview.
- IMPACTO EN FRONTEND: ninguno; no se tocaron /app/modules.
- PENDIENTE/RIESGO: continuar con Auth local preview y luego smoke/tenant isolation.

- ARCHIVO: documentacion backend V57
- TIPO: modificado
- QUE CAMBIO: se documenta que el fallo anterior fue del wrapper PowerShell para git diff --check, no de las reglas.
- POR QUE: evitar repetir metodologia de falso fallo o falso OK.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: los proximos bloques deben ejecutar Git directo y validar exit code real.

## 2026-06-30 22:36:46 - Limpieza whitespace para cerrar commit rules V57
- ARCHIVO: firestore.rules
- TIPO: validado/modificado
- QUE CAMBIO: se limpia trailing whitespace y se mantiene cobertura V57 completa.
- POR QUE: git diff --check bloqueo el commit por espacios finales, no por fallo de reglas.
- IMPACTO EN FRONTEND: ninguno; no se tocaron /app/modules.
- PENDIENTE/RIESGO: avanzar a Auth local preview y luego smoke/tenant isolation.

- ARCHIVO: documentacion V57
- TIPO: modificado
- QUE CAMBIO: normalizacion UTF-8 sin BOM y limpieza de espacios finales en documentos tocados por el bloque.
- POR QUE: evitar bloqueos de git diff --check y mantener repo limpio.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: si aparecen simbolos raros en UI, corregir codificacion real desde el origen y documentarlo para Claude.

## 2026-06-30 22:40:01 - Correccion falso fallo de validacion staged
- ARCHIVO: bloque PowerShell local
- TIPO: incidencia metodologica corregida
- QUE CAMBIO: se reemplaza validacion por regex de staged por comparacion exacta con trim.
- POR QUE: el reporte anterior mostro irestore.rules staged, pero el bloque fallo falsamente al evaluarlo.
- IMPACTO EN FRONTEND: ninguno; no se tocaron /app/modules.
- PENDIENTE/RIESGO: continuar a Auth local preview cuando commit/push quede confirmado.

## 2026-06-30 23:13:34 - Auth preview V57 sin pedir claves
- ARCHIVO: firebase/auth-dev-tools/output/*
- TIPO: local/no versionado
- QUE CAMBIO: se genero credencial DEV ficticia local automaticamente y se uso para actualizar usuarios ficticios DEV.
- POR QUE: evitar pedir o pegar claves y desbloquear Auth preview.
- IMPACTO EN FRONTEND: ninguno; no se tocaron /app/modules ni app/index.html.
- PENDIENTE/RIESGO: confirmar badge visual y ejecutar smoke Firestore / tenant isolation CXOrbia.

- ARCHIVO: app/core/backend-dev-auth.local.js
- TIPO: local/no versionado
- QUE CAMBIO: helper local Auth preview creado desde credencial local ignorada.
- POR QUE: permitir preview Auth DEV sin prompt manual.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: no subir ni pegar archivos locales de output.

## 2026-06-30 23:38:12 - Preview backend V57 servidor robusto
- ARCHIVO: proceso local preview
- TIPO: validacion local/no versionada
- QUE CAMBIO: se levanta servidor local con verificacion HTTP antes de abrir navegador.
- POR QUE: el intento anterior abrio URL en puerto 5184 pero Chrome mostro ERR_CONNECTION_REFUSED.
- IMPACTO EN FRONTEND: ninguno; no se tocaron /app/modules ni app/index.html.
- PENDIENTE/RIESGO: despues del badge, ejecutar smoke Firestore, tenant isolation y module render smoke CXOrbia como se hizo en Orbit.

## 2026-06-30 23:44:28 - Preview backend V57 servido con Node
- ARCHIVO: proceso local preview
- TIPO: validacion local/no versionada
- QUE CAMBIO: se reemplazo Python por servidor local Node para abrir pp/index-backend-dev.html.
- POR QUE: Windows devolvio codigo 9009 al intentar ejecutar Python; Node si esta disponible porque ejecuta los validadores.
- IMPACTO EN FRONTEND: ninguno; no se tocaron /app/modules ni pp/index.html.
- PENDIENTE/RIESGO: revisar badge visual. Si aun dice localStorage/demo, continuar con smoke Firestore y tenant isolation sin considerar backend conectado.

## 2026-07-01 00:45:35 - Smoke Backend V58 Node
- Se sincronizaron commits documentales V58 desde GitHub.
- Se parcheo localmente firestore.rules para eliminar helpers indefinidos en bloques V57 y agregar list explicito en projects para operadores.
- Validadores V57 OK.
- Auth DEV OK sin imprimir secretos.
- Tenant isolation ejecutado.
- Preview Node robusto con HTTP 200: True.
- Module render smoke ejecutado: True.
- No deploy, no produccion, no datos reales, no /app/modules.
## 2026-07-01 00:56:58 - Aplicacion prototipo V58 preservando backend V57
- Se aplico ZIP V58 como nueva base visual/prototipo.
- Se preservaron backend V57, preview backend, reglas, helpers locales ignorados y configuraciones backend.
- Se corrigio Configuracion > NDA para editar textos por rol usando CX.confidencialidad.
- Se corrigio README para no recomendar Python.
- Se corrigio caracter UTF-8 roto conocido en aprendizaje.
- Se ajusto el proyecto inicial visible a TyA/Cinepolis preview para evitar ver Proyecto Retail como base activa.
- No deploy, no merge, no produccion, no datos reales.
## 2026-07-01 01:16:36 - Aplicacion prototipo V58 preservando backend V57
- Se aplico ZIP V58 como nueva base visual/prototipo.
- Se preservaron backend V57, preview backend, reglas, helpers locales ignorados y configuraciones backend.
- Se corrigio Configuracion > NDA para editar textos por rol usando CX.confidencialidad.
- Se corrigio README para no recomendar Python.
- Se corrigio caracter UTF-8 roto conocido en aprendizaje.
- Se ajusto el proyecto inicial visible a TyA/Cinepolis preview para evitar ver Proyecto Retail como base activa.
- No deploy, no merge, no produccion, no datos reales.
## 2026-07-01 03:36:03 - Rules V58 preparadas para seed piloto parcial
- ARCHIVO: firestore.rules
- TIPO: modificado
- QUE CAMBIO: se prepararon reglas para cubrir el modelo minimo V58 usado por el seed piloto:
  - tenant root create/update para admin del tenant;
  - tenants/{tenantId}/shopperStats/{shopperId};
  - projects/{projectId}/periods/{periodId};
  - projects/{projectId}/hrImports/{importId};
  - projects/{projectId}/branches/{branchId};
  - projects/{projectId}/applications/{applicationId};
  - projects/{projectId}/notifications/{notificationId};
  - projects/{projectId}/responsibilityLog/{logId}.
- POR QUE: el intento de carga V58 ya valido Auth DEV, pero Firestore devolvio PERMISSION_DENIED para tenant root, periods, applications y shopperStats.
- IMPACTO EN FRONTEND: ninguno. No se tocaron /app/modules ni UI.
- ESTADO: preparado en repo, sin publicar reglas.
- RESTRICCIONES: no deploy, no produccion, no Orbit, no datos reales.
- PENDIENTE: con autorizacion explicita, publicar solo Firestore rules DEV y reintentar seed piloto V58.
## 2026-07-01 03:51:27 - Rules DEV publicadas y seed piloto ficticio V58 cargado
- ARCHIVO: firestore.rules
- TIPO: publicado en Firebase DEV
- QUE CAMBIO: se publicaron reglas Firestore V58 unicamente en Firebase DEV cxorbia-backend-dev.
- POR QUE: el seed V58 habia quedado parcialmente bloqueado por PERMISSION_DENIED en tenant root, periods, applications y shopperStats.
- ARCHIVO: firebase/seeds/cxorbia-v58-tya-julio-pilot-seed.json
- TIPO: carga DEV controlada
- QUE CAMBIO: se reintento la carga del seed piloto ficticio V58 despues de publicar rules DEV.
- IMPACTO EN FRONTEND: ninguno directo. No se tocaron /app/modules por este paso.
- RESTRICCIONES: no Hosting, no produccion, no Orbit, no datos reales, no secretos impresos.
- PENDIENTE: smoke read-only contra Firestore y validacion preview/backend con tenant tya.
## 2026-07-01 03:51:27 - Prototipo V59 aplicado preservando backend
- ARCHIVO: app/*
- TIPO: aplicacion de prototipo frontend V59 autorizado por Paula.
- QUE CAMBIO: se aplico V59 como version visual mas reciente y se preservaron archivos backend protegidos.
- POR QUE: Paula entrego V59 indicando que Claude atendio mejoras y pendientes; se integra sobre la version mas completa sin perder backend.
- IMPACTO EN FRONTEND: V59 queda como base visual vigente.
- IMPACTO EN BACKEND: no se modifico preview backend protegido; no se versionaron secretos.
- PENDIENTE/RIESGO: validar visualmente hallazgos de AUDITORIA-PROTOTIPO-V59.md.
## 2026-07-01 04:03:40 - Smoke read-only seed piloto V58 Firestore DEV OK
- ARCHIVO: firebase/client-write-tools/smoke-cxorbia-v58-pilot-seed-read-dev.mjs
- TIPO: validacion read-only DEV
- QUE CAMBIO: se valido que los 7 documentos del seed piloto ficticio V58 son legibles desde Firestore DEV con Auth DEV.
- POR QUE: confirmar que rules publicadas y seed cargado quedaron operativos antes de revisar preview/backend.
- IMPACTO EN FRONTEND: ninguno. No se tocaron /app/modules ni UI.
- RESTRICCIONES: solo lectura, no Hosting, no produccion, no Orbit, no datos reales, no secretos impresos.
- PENDIENTE: smoke preview/backend V59 con servidor Node y badge/fuente Firestore.
## 2026-07-01 04:43:49 - V60 aplicado preservando backend
- ARCHIVO: app/*
- TIPO: aplicacion de prototipo frontend V60 autorizado por Paula.
- QUE CAMBIO: se aplico V60 como base visual mas reciente y se preservo backend protegido.
- POR QUE: Paula entrego V60 indicando que Claude atendio pendientes; se integra sin perder backend ya validado.
- IMPACTO EN FRONTEND: V60 queda como base visual vigente.
- IMPACTO EN BACKEND: se preservo adapter Firestore, preview backend y configuracion protegida.
- VALIDACION: adapter backend validado despues de aplicar V60.
- PENDIENTE/RIESGO: validar visualmente hallazgos de AUDITORIA-PROTOTIPO-V60.md.