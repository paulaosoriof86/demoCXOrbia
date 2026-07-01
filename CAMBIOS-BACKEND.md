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
