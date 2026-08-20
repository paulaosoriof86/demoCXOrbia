# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`  
**Estado:** `I4_FROZEN_PASS__I5_PREPROD_BLOCKED_BEFORE_CREATE`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Subestado:** `I5_2_PREPROD_PROJECT_CREATOR_AUTH_BLOCKED`  
**Score formal:** `85% / 15%`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` existente, draft/open/no merge

## 1. Corte de continuidad

I1–I4 están cerrados/frozen. El producto funcional sigue siendo `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No volver a Auth, Shopper, Finanzas, nueva candidata, nueva rama/PR o auditoría general.

## 2. Autorización PREPROD recibida

Paula autorizó:
- Firebase PREPROD nuevo y limpio;
- no reutilizar DEV ni base preexistente;
- un único Hosting PREPROD del source congelado;
- UAT read-only;
- 0 merge/producción y 0 data/HR/Auth/Storage/Make/Gemini/payment writes.

## 3. Ejecución real PREPROD

Run `32332125828`, job `96314651567`, artifact `9393386559`:
- target `cxorbia-preprod-20260819` no estaba accesible/existente;
- un comando `firebase projects:create` fue intentado;
- Firebase CLI falló antes de crear el proyecto;
- `projectCreatesSucceeded=0`;
- `hostingDeploys=0`;
- UAT no ejecutado;
- no se reutilizó DEV y no hubo writes de datos/proveedores.

El request quedó consumido como HOLD para impedir retry automático.

## 4. Causa raíz y búsqueda de ruta existente

### Diagnostic 1
Run `32332360361`, artifact `9393462199`:
`PASS_I5_PREPROD_PROJECT_CREATE_ROOT_CAUSE_READONLY`.

No se pudo demostrar `resourcemanager.projects.create`; parent/org creator scope no era visible para la identidad DEV.

### Diagnostic 2 — credential routes
Run `32332788919`, job `96316503352`, artifact `9393599029`:
`HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`.

- dedicated project creator secret: ausente;
- alternate project creator secret: ausente;
- DEV service account: presente y válido, autenticó, ve 2 proyectos y 0 organizaciones;
- `createPermissionProven=false`;
- provider writes/project creates/deploys = 0.

**Causa operativa suficiente:** el carril conectado no dispone de una identidad ya configurada con capacidad probada para crear un proyecto GCP/Firebase nuevo. Reintentar con la misma identidad sería un bucle.

## 5. Bloqueo real

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`

Hace falta una acción administrativa mínima y separada para disponer de Project Creator capability. Esa acción puede ser configurar una identidad dedicada ya autorizada o otorgar el mínimo permiso de creación en el parent correcto. No se debe tocar Auth/Firestore/Storage/HR/datos del producto.

## 6. Qué se preserva

- I4 completo PASS;
- Shopper histórico sin reproceso;
- Finanzas sin reproceso;
- fuente funcional `f9802f...`;
- verdad financiera mayo/junio;
- multi-tenant/multi-proyecto;
- Academia sin reconstrucción;
- 0 PREPROD deploys y 0 producción.

## 7. Siguiente movimiento exacto

Obtener autorización explícita para `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`. No hay plugin/conector Google Cloud/Firebase instalable disponible en el entorno actual; por tanto la capacidad administrativa provider tendrá que ser conectada/proporcionada de forma segura antes de poder ejecutar ese write desde este carril.

Una vez el capability sea demostrable, reemitir el request de creación PREPROD bajo la autorización ya dada y ejecutar exactamente un Hosting PREPROD + UAT read-only.

## 8. Estado seguro

0 PREPROD projects created; 0 PREPROD Hosting deploys; 0 PREPROD UAT; 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes; 0 merge; 0 production.

## 9. Clasificación

- **Reusable CXOrbia:** provider-capability preflight y fail-closed no-retry.
- **Exclusivo TyA:** target PREPROD y evidencia operacional del tenant.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin cambio funcional; registrar que PREPROD aún no existe.
- **Sin impacto Claude:** IAM/provider provisioning gate y documentación.
