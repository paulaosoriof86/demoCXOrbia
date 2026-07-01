# RESUMEN-PARA-CHATGPT-BACKEND-V57.md

## Estado actual B2/B3

- Rama: `release/cxorbia-tya-rc-20260630`.
- Base visual: ZIP local `Prototype development request CXOrbia V57.zip` aplicado/comparado sobre `/app`.
- Backend DEV preservado: config, preview, Firebase adapter, finance benefits, finance read bridge, operational actions, preview status, bulletins, `firebase/**`.
- `app/index.html` no activa backend global.
- `app/index-backend-dev.html` carga backend DEV y debe usarse solo para preview.
- Preview soporta helper local no versionado `app/core/backend-dev-auth.local.js`; está ignorado por git y sirve para resolver Auth DEV sin prompt de navegador.
- `firebase/auth-dev-tools/create-preview-auth-local.cjs` genera el helper local desde variables locales, sin subir credenciales al repo.
- `firebase/client-write-tools/validate-preview-v57-static.mjs` valida separación entre index normal y preview backend.
- Badge preview: muestra fuente honesta (`firestore`, `localStorage/demo` o `pending`), Auth, tenant, proyecto, conteos y último error.
- `backend-bulletins` lee Firestore y alimenta `CX.notif` sin tocar `modules/tablon.js`.
- `bulletinReads` persiste leído/no leído por usuario.
- Creación de novedades disponible en preview DEV mediante `CX.backendBulletins.createBulletin`.
- Reglas Firestore preparadas localmente para `bulletins` y `bulletinReads`; no publicadas.
- Dry-run/validator bulletins: OK.
- Validación de reglas vía emulador: pendiente por falta de Java en PATH.
- No deploy, no Hosting, no merge, no producción.

Resumen técnico de backend requerido por el prototipo V57.

## Cambios V57 que impactan backend

1. `CX.ai` ahora es multi-proveedor y requiere configuración segura por tenant.
2. PWA y favicon usan logo del tenant; logo debe persistir en Storage.
3. Roles `coordinador` y `aliado` agregan `scopeCountry`; reglas Firestore deben soportar país asignado.
4. Mis Visitas/Mis Beneficios dependen de `shopperId`; migración debe garantizar `shopperId` canónico.
5. CxC/CxP son editables y deben persistirse en colecciones separadas.
6. Pago por lote genera movimiento por shopper.
7. Recursos/Academia embeben archivos; Storage + metadata Firestore es obligatorio.
8. Importador Excel usa SheetJS en frontend; backend debe recibir preview/mapeo/commit seguro.
9. `CX.automations.fire` debe hacer POST real a Make por tenant/automatización.

## Interfaz que se debe respetar

No cambiar módulos. El adapter debe conservar firmas de `CX.data` y stores actuales.

Métodos mínimos a mapear o revisar:

- `project()`
- `projects`
- `projectsFor()`
- `visitas()`
- `visitsForShopper(shopperId)`
- `shoppersFor()`
- `getShopper(id)`
- `shopperStats(id)`
- `shopperKpis(id)`
- `assignVisit(visitaId, shopperId)`
- `payVisits([visitaIds])`
- `addClient({...})`
- `clients`

Stores/áreas a mapear:

- `CX.finStore`
- `CX.automations`
- `CX.ai`
- `CX.manualesData`
- `CX.shoppersStore`
- `CX.store`
- configuración de tenant/marca/planes/módulos

## Colecciones Firestore sugeridas V57

```text
/tenants/{tenantId}
/tenants/{tenantId}/users/{uid}
/tenants/{tenantId}/clients/{clientId}
/tenants/{tenantId}/projects/{projectId}
/tenants/{tenantId}/projects/{projectId}/visits/{visitId}
/tenants/{tenantId}/projects/{projectId}/postulations/{postulationId}
/tenants/{tenantId}/projects/{projectId}/questionnaires/{questionnaireId}
/tenants/{tenantId}/projects/{projectId}/certifications/{certificationId}
/tenants/{tenantId}/projects/{projectId}/resources/{resourceId}
/tenants/{tenantId}/projects/{projectId}/paymentLots/{lotId}
/tenants/{tenantId}/projects/{projectId}/shopperBenefits/{benefitId}
/tenants/{tenantId}/financialMovements/{movementId}
/tenants/{tenantId}/accountsReceivable/{cxCId}
/tenants/{tenantId}/accountsPayable/{cxPId}
/tenants/{tenantId}/automationTemplates/{templateId}
/tenants/{tenantId}/integrationSettings/{integrationId}
/tenants/{tenantId}/auditLog/{eventId}
/tenants/{tenantId}/bulletins/{bulletinId}
/tenants/{tenantId}/bulletinReads/{readId}
```

## Gate de la siguiente fase

Antes de pedir/cargar base buena completa TyA:

1. V57 debe estar como base visual vigente en la rama de trabajo.
2. Preview backend debe abrir desde `app/index-backend-dev.html`.
3. Diagnóstico debe mostrar Auth OK o error claro.
4. Diagnóstico debe mostrar fuente Firestore o localStorage/demo.
5. Tenant debe ser `tya`.
6. Los conteos deben venir de Firestore DEV.
7. Shopper debe leer solo datos propios.

## Nota operativa

No publicar producción operativa hasta cerrar este gate. Se puede publicar una RC/demo solo si se etiqueta como demo y no se presenta como backend real.

## 2026-06-30 22:20:17 - Rules V57 corregidas
- Se corrigio irestore.rules desde HEAD limpio.
- Se agregaron reglas faltantes: integrationSettings, utomationLogs, iSettings, iLogs,
esources.
- Se corrigio el validador check-firestore-rules-v57-coverage.mjs para fallar con exit code real si falta cobertura.
- Validaciones requeridas:
  -
ode firebase/client-write-tools/check-firestore-rules-v57-coverage.mjs
  -
ode firebase/client-write-tools/validate-preview-v57-static-v2.mjs
- No se toco /app/modules.
- No se hizo deploy.
- No se hizo merge.
- No se tocaron datos reales.
- Siguiente bloqueo: Auth local preview. No considerar backend conectado mientras el badge diga localStorage/demo.

## 2026-06-30 22:26:21 - Fix rules V57 listo para commit/push
- Se corrigio bloqueo local por CRLF configurando Git local con core.autocrlf=false.
- Se preserva el parche de rules V57.
- Se valida cobertura con ok:true.
- Se valida preview estatico V57.
- Se agrega paquete para Claude: PAQUETE-PARA-CLAUDE-PENDIENTES-PROTOTIPO-V57.md.
- Siguiente bloqueo: Auth local preview.
- Luego: smoke test Firestore y tenant isolation similar a Orbit, sin datos reales.

## 2026-06-30 22:29:01 - Continuidad despues de wrapper Git corregido
- El bloqueo anterior no fue de reglas sino de ejecucion del comando Git en PowerShell.
- Se reintenta commit/push con Git directo.
- Validaciones obligatorias se mantienen: coverage ok:true, preview static sin ok:false, firestore.rules staged, diff checks correctos.
- Siguiente fase: Auth local preview.

## 2026-06-30 22:36:46 - Continuidad final rules V57
- Rules V57 ya validaba ok:true.
- El bloqueo era trailing whitespace en docs/firestore.rules.
- Se normaliza UTF-8 sin BOM y LF.
- Se mantiene gate: siguiente paso Auth local preview; despues smoke Firestore y tenant isolation CXOrbia.

## 2026-06-30 22:40:01 - Commit/push final rules V57
- El bloqueo anterior fue falso negativo de validacion staged.
- irestore.rules si estaba staged.
- Se corrige validacion y se repiten gates antes de commit/push.
- Siguiente fase: Auth local preview.

## 2026-06-30 23:13:34 - Auth preview sin pedir claves
- No se pidieron claves a Paula.
- Se genero credencial DEV ficticia local y se guardo solo en output ignorado.
- Se importaron/actualizaron usuarios ficticios DEV en cxorbia-backend-dev.
- Se creo helper local pp/core/backend-dev-auth.local.js, ignorado por Git.
- Validadores V57 pasaron.
- Siguiente: smoke Firestore y tenant isolation CXOrbia.
