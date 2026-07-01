# RESUMEN-PARA-CHATGPT-BACKEND-V57.md

## Estado actual B2/B3

- Rama: `release/cxorbia-tya-rc-20260630`.
- Base visual: ZIP local `Prototype development request CXOrbia V57.zip` aplicado/comparado sobre `/app`.
- Backend DEV preservado: config, preview, Firebase adapter, finance benefits, finance read bridge, operational actions, preview status, bulletins, `firebase/**`.
- `app/index.html` no activa backend global.
- `app/index-backend-dev.html` carga backend DEV y debe usarse solo para preview.
- Badge preview: muestra fuente honesta (`firestore`, `localStorage/demo` o `pending`), Auth, tenant, proyecto, conteos y ultimo error.
- `backend-bulletins` lee Firestore y alimenta `CX.notif` sin tocar `modules/tablon.js`.
- `bulletinReads` persiste leido/no leido por usuario.
- Creacion de novedades disponible en preview DEV mediante `CX.backendBulletins.createBulletin`.
- Reglas Firestore preparadas localmente para `bulletins` y `bulletinReads`; no publicadas.
- Dry-run/validator bulletins: OK.
- Validacion de reglas via emulador: pendiente por falta de Java en PATH.
- No deploy, no Hosting, no merge, no produccion.

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
