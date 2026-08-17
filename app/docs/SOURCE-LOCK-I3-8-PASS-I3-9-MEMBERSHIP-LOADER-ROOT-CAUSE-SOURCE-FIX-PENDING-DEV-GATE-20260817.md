# SOURCE LOCK — I3.8 PASS · I3.9 ROOT CAUSE · SHOPPER MEMBERSHIP LOADER SOURCE FIX

**Fecha:** 2026-08-17 17:45 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_1_TO_I3_8_PASS__I3_9_PROVIDER_PRECONDITIONS_PASS__SHOPPER_MEMBERSHIP_LOADER_SOURCE_FIX_APPLIED__DEV_DEPLOY_PLUS_SYNTHETIC_PASSWORD_GATE_REQUIRED__GO_LIVE_35`

## 1. I3.8 — PASS / CONSUMED

Gate autorizado:
`I3.8_ADMIN_CREATE_UPDATE_ONE_NEW_SHOPPER_PROVIDER_BACKED_PERIOD_INDEPENDENT_IDENTITY`.

Run `32080412142`, job `95542161943`.

Resultado provider-backed:

- Shopper nuevo DEV: `TYA_GT_393371F88D10F7A8`;
- Auth create `1`;
- custom claims write `1`;
- Firestore writes `3`;
- membership `1`;
- profile/shopper `1`;
- period-independent identity link `1`;
- identityLinkId `irl_fd0e52a9792ef088aa275fa90e27c77d`;
- authorityType `platform_created`;
- provider ACK/readback `true/true`;
- Auth/claims/membership/profile/crosswalk/periodIndependent/platformCreated readback = PASS.

Request consumido. No rerun I3.8 y no crear otro Shopper bajo esa autorización.

La contraseña aleatoria de I3.8 existió solamente en runner temp y fue destruida al terminar el job; nunca se persistió en repo/evidence/log.

## 2. I3.9 — provider preconditions PASS, browser E2E no cerrado

La misma identidad creada en I3.8 fue leída posteriormente en modo read-only y se demostró repetidamente:

- Auth user exacto PASS;
- claims exactos PASS;
- membership provider exacto PASS;
- profile exacto PASS;
- crosswalk exacto PASS;
- authority `platform_created` PASS;
- period-independent PASS;
- visible-login→provider mapping fingerprint PASS.

No existe evidencia de una falla de creación de identidad o de provider state en I3.8.

## 3. Intentos I3.9 y clasificación

### 3.1 Run 32080412142 / job 95542161943

I3.8 PASS. I3.9 no llegó a ejecutarse: un `npm install firebase-admin` posterior eliminó Playwright transitorio. Clasificación: `HARNESS_DEPENDENCY_ORDER_FAILURE_BEFORE_I3_9`.

### 3.2 Run 32080979723 / job 95543773480

Read-only provider state PASS. Browser custom-token reportó error técnico de red Auth. Cero provider admin writes/password changes/resets.

### 3.3 Run 32080979723 / job 95544082776

Rerun read-only focal. Provider state PASS. El harness verificó la superficie visible demasiado pronto y produjo `VISIBLE_LOGIN_SURFACE_INCOMPLETE`. Se clasificó como timing del harness, no fallo de producto.

### 3.4 Run 32081426357 / job 95545032005

Harness corregido:

- Playwright + firebase-admin instalados juntos PASS;
- visible login surface PASS;
- Firebase Hosting project exact `cxorbia-backend-dev` PASS;
- provider state completo PASS;
- 0 admin/provider writes;
- 0 password changes/resets;
- 0 Historical Shopper access;
- browser custom-token path terminó en timeout técnico de orquestación antes de poder certificar el contexto CXOrbia.

Artifact `9305251720`, digest `sha256:1f88295d8cf00a22018b16b3eb75fc78fed6b2ed8db9931cda04a262a26f1838`.

No se interpreta como password-login FAIL porque este carril no usa el login visible canónico de usuario+contraseña.

## 4. Hallazgo de causa raíz en source

Existe desde antes el adapter reusable:

`app/adapters/cxorbia-shopper-membership-wiring-v1.js`

Su contrato realiza:

`Firebase principal + exact claims → tenants/{tenantId}/users/{uid} → Shopper session/membership verified`.

Pero el entrypoint protegido `app/index-backend-dev.html` **no lo cargaba**. Tampoco lo cargaba el exact source desplegado en I3.2C (`9ebdca78d463e7e8032d8c75175f9829a45636a1`).

En cambio, sí cargaba `tya-c6-live-user-admin-membership-wiring-v1.js`, cuyo propósito es Staff y para roles no-Staff declara `not_applicable_non_staff`.

Por tanto quedó físicamente implementado el mecanismo Shopper membership pero no integrado en el runtime protegido.

## 5. Corrección aplicada directamente en source

Commit:
`c796597effac6d77422df888b63933ab865ab198`

Cambio único funcional:

`app/index-backend-dev.html` ahora carga:

`adapters/cxorbia-shopper-membership-wiring-v1.js`

inmediatamente después de `tya-c6-live-user-admin-membership-wiring-v1.js` y antes del backend protegido.

No se modificaron `/app/modules`, `CX.data`, Auth provider, Firestore, HR ni producción.

## 6. Estado de deploy

**La corrección source NO está desplegada.**

La última build DEV desplegada sigue siendo I3.2C con source target:
`9ebdca78d463e7e8032d8c75175f9829a45636a1`.

La autorización I3.8 prohibía deploy; se respetó.

Por ello I3.9 no puede cerrarse correctamente sobre el source fix hasta autorizar un deploy Hosting DEV exacto de la rama vigente.

## 7. Credencial para prueba visible

La contraseña aleatoria inicial del Shopper sintético se destruyó correctamente por diseño. No existe credencial recuperable y no se debe crear otro usuario.

Para certificar el login visible canónico del Shopper nuevo sin reabrir Historical Shopper se requiere **un único password change directo** sobre exclusivamente `TYA_GT_393371F88D10F7A8`, generando una contraseña aleatoria temporal en runner, usándola en el formulario visible y destruyéndola localmente después.

Esto requiere un nuevo gate porque la autorización I3.8 ya fue consumida y establecía password changes `0`.

No se requiere password-reset email ni interacción manual de Paula.

## 8. Próxima frontera exacta

Un único gate combinado recomendado:

`I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE`

Scope máximo:

1. fijar exact current source SHA;
2. máximo `1` Hosting DEV deploy del source actual para activar Shopper membership wiring;
3. cero Cloud Run deploy si no es necesario por delta;
4. máximo `1` Auth `updateUser(password)` sobre el Shopper sintético I3.8 únicamente;
5. cero createUser, cero claims writes, cero Firestore writes;
6. login visible real usuario+contraseña;
7. claims + membership + profile + crosswalk + workspace;
8. reload + new-tab + segundo contexto;
9. I3.10 KPI/state semantics dinámico, sin hardcode de mes/14/616;
10. I3.11 integral same-build sobre el mismo SHA/build;
11. destrucción de la contraseña en runner;
12. cero Historical Shopper access/login/recovery/reset;
13. cero HR/Finance/Rules/Storage/Make/Gemini/payment writes;
14. cero merge/production.

Si I3.9/I3.10/I3.11 PASS sobre la misma build, I3 formal pasa de `0/25` a `25/25` y GO-LIVE formal de **35% a 60%**.

## 9. Seguridad acumulada después de I3.8

En los diagnósticos posteriores:

- Historical Shopper access/login/recovery/reset: `0/0/0/0`;
- user create/update: `0/0`;
- claims writes: `0`;
- password changes/resets: `0/0`;
- Firestore writes: `0`;
- HR/Finance/Rules/Storage/Make/Gemini/payment writes: `0`;
- deploys: `0`;
- merge: `false`;
- production: `false`.

## 10. Clasificación

- **Reusable CXOrbia:** Shopper membership wiring exacto y carga del adapter reusable.
- **Exclusivo cliente:** el Shopper sintético DEV y su scope de proyecto son datos de validación, no código global.
- **Claude/prototipo:** no UI redesign; solo entrypoint técnico protegido.
- **Academia:** identidad Auth ≠ membership; una implementación no está completa hasta quedar conectada al runtime real.
- **Sin impacto Claude:** harnesses, provider fingerprints, custom-token diagnostics, source lock/evidence.
