# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`

**Avance formal:** **85% / 15%**. I1–I4 `PASS/FROZEN`; I5 bloqueado exclusivamente en capacidad provider para crear el proyecto PREPROD nuevo y limpio. El porcentaje no equivale a producción autorizada.

## 2026-08-19 — I5 PREPROD · PROJECT CREATOR BLOCKER PROVEN

### 1. Autorización PREPROD recibida y ejecutada hasta el límite real
Paula autorizó crear/configurar un Firebase PREPROD nuevo y limpio, sin reutilizar DEV/base previa, y hacer un único Hosting PREPROD del source `f9802fdd498934a8e7729fa5c7d18341bec1cd71` + UAT read-only; sin merge/producción ni writes de datos/HR/Auth/Storage/Make/Gemini/pagos.

### 2. Intento de creación PREPROD consumido con HOLD
Target: `cxorbia-preprod-20260819`.

Evidencia:
- run `32332125828`;
- job `96314651567`;
- artifact `9393386559`;
- el target no existía entre los proyectos accesibles;
- se intentó exactamente un `firebase projects:create`;
- `projectCreatesSucceeded=0`;
- `hostingDeploys=0`;
- UAT no ejecutado;
- DEV no reutilizado/copied;
- 0 business/provider data writes.

### 3. Causa raíz provider confirmada en read-only
- run `32332360361`, artifact `9393462199`: `PASS_I5_PREPROD_PROJECT_CREATE_ROOT_CAUSE_READONLY`; identidad DEV sin parent creator capability demostrable.
- run `32332788919`, job `96316503352`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`.
- `CXORBIA_GCP_PROJECT_CREATOR_JSON`: ausente.
- `GOOGLE_CLOUD_PROJECT_CREATOR_JSON`: ausente.
- `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`: presente/autenticado, ve 2 proyectos y 0 organizaciones; `resourcemanager.projects.create` no está demostrado.

### 4. Frontera exacta
`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`.

No reintentar `projects:create` con la identidad DEV. El próximo paso requiere autorización específica separada para IAM/provisioning mínimo que habilite una identidad de Project Creator en el parent correcto. No se infiere autorización para service-account creation, key creation, cambios de organización/carpeta ni privilegios adicionales.

Una vez demostrada la capability, se reemite la creación PREPROD bajo la autorización original y se ejecuta el único Hosting PREPROD + UAT read-only, sin reabrir I1–I4.

### 5. Documentación sincronizada
- índice/Execution State/Plan ya reflejan epoch `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`;
- `RESUMEN-PARA-CLAUDE.md` actualizado al blocker real;
- `PENDIENTES-PROTOTIPO.md` actualizado al blocker real;
- este `CAMBIOS-BACKEND.md` actualizado al blocker real.

### 6. Clasificación
- **Reusable CXOrbia:** gate de provisión mínima y separación entre identidad runtime e identidad Project Creator.
- **Exclusivo TyA:** target PREPROD y continuidad del go-live TyA.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin cambio; espera PREPROD/UAT.
- **Sin impacto Claude:** IAM/provisioning, evidencia y documentación.

### 7. Seguridad
Estado: 0 proyectos PREPROD creados; 0 Hosting PREPROD deploys; 0 UAT; 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes; 0 merge; 0 producción. I4 permanece intacto.

---

## 2026-08-19 — I4 CIERRE TERMINAL · SAME-BUILD RUNTIME + FINANCE EQUIVALENCE

### 1. Hosting DEV autorizado y consumido
Se materializó una sola vez el producto exacto `f9802fdd498934a8e7729fa5c7d18341bec1cd71` en Firebase Hosting DEV.

Evidencia:
- run `32328316954`;
- job `96303971844`;
- artifact `9392151808`;
- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- paridad exacta local/remota del adapter protegido;
- 1 deploy DEV, 0 provider/data/Auth/Firestore/HR/Storage/Make/Gemini/payment writes.

### 2. Staff/Admin runtime provider-backed PASS
Se ejecutó el cierre read-only sobre la misma build desplegada.

Evidencia:
- run `32329139725`;
- artifact `9392431939`;
- `PASS_READONLY_POST_GATES`;
- `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`;
- autoridad HR/plataforma, exact crosswalk, legal receipt y estabilidad reload/new-tab PASS;
- inventario vivo observado: 15 periodos, 660 visitas, 200 shoppers; crosswalk protegido 209;
- 0 writes, 0 deploy adicional, 0 merge, 0 producción.

El intento multirrol previo que encontró el estado histórico de contraseña Shopper no produjo reset ni write y se clasifica deuda del harness, no regresión del producto.

### 3. Shopper preservado sin reproceso
No se repitió login Shopper ni se modificaron credenciales. Se reutiliza el checkpoint real congelado `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`. La ejecución Staff confirmó reutilización de perfil/membership/crosswalk/history y blobs protegidos sin cambio; `historicalShopperAccessThisRun=0`, `passwordResetsThisRun=0`.

### 4. Equivalencia financiera cerrada sin rerun redundante
`app/data/tya-payment-history-source-safe.js` conserva el mismo blob `088c68680177c470a4539622e1694128dd211d85` en el source desplegado `f9802f...` y en la rama.

La comparación `f9802f... → 8831723a...` mostró únicamente:
- `.github/cxorbia-gate-requests/request.json`;
- `backend/config/i3-11-identity-link-runtime-bridge-rules-hosting-dev.json`.

No hubo cambios en `app/`; por tanto la cadena financiera desplegada es byte-equivalente a la fuente congelada.

Verdad canónica preservada:
- mayo 2026: 44/44 pagadas;
- junio 2026: 2/44 pagadas, 42 pendientes;
- Q451 confirmado en junio;
- `liquidada != pagada`;
- 0 lotes ejecutables creados.

`R16D` se conserva como PASS de review source-safe, pero no reemplaza la autoridad histórica de pago más reciente.

### 5. Deriva de gate-state corregida
Durante el cierre se detectó que ambos requests one-shot ya ejecutados seguían persistidos como `enabled=true / consumed=false`. Se corrigió directamente en la rama viva:
- Staff request: `consumed=true`, `enabled=false`, evidencia terminal run `32329139725`;
- Hosting request: `consumed=true`, `enabled=false`, `actualHostingDeploys=1`, evidencia terminal run `32328316954`.

Commits de corrección de estado:
- `246cc1dd61886911dfdeb36555effb514d587a2f`;
- `8831723a4cf3e656b3dddd1ed5c72b45f0dc2ec8`.

No se tocó `app/`, proveedor ni datos. Esto elimina el riesgo de reruns accidentales.

### 6. Academia
Se creó `app/docs/ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`. No se reconstruyó Academia. Se documentó la alineación con autoridad runtime única, identidad exacta, HR/plataforma, estados financieros honestos y command/provider ACK.

### 7. Cierre formal
I4 queda `PASS/FROZEN`. El score formal pasa **60% → 85%** y la frontera única queda:

`I5_PREPRODUCTION_AND_GO_LIVE`

### 8. Seguridad
I4 consumió exactamente 1 Hosting DEV autorizado. Cierre documental: 0 segundo deploy, 0 merge, 0 producción, 0 provider/data/HR/Auth/Storage writes, 0 Make/Gemini y 0 ejecución bancaria.
