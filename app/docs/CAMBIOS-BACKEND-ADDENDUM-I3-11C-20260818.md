# CAMBIOS-BACKEND — Addendum I3.11C

Fecha: 2026-08-18
Estado: `I3_11C_ROOT_CAUSE_PROVEN__FIRESTORE_RULES_DEV_DEPLOY_AUTH_REQUIRED`
Repo: `paulaosoriof86/demoCXOrbia`
Rama viva: `docs-tya-v6-v71-audit`
PR: `#7` draft/open, sin merge
Avance formal: `35%` hasta cierre integral I3; `60%` solo después de PASS integral.

## Continuidad preservada

No se reabren I1/I2 ni I3.1→I3.10. I3.9 e I3.10 permanecen congelados PASS. Historical Shopper permanece congelado y no fue accedido. No se abrió nueva rama, PR, candidata ni metodología.

## Evidencia nueva — probe focal provider identity path

La ejecución Staff-only read-only `32154174469`, job `95767915605`, artifact `9331132658` aisló el fallo antes de cargar documentos `shopperIdentityLinks`:

- el asset DEV `cxorbia-provider-identity-link-runtime-v1.js` responde HTTP 200;
- los marcadores I3.11B del bridge precompose están presentes;
- `providerIdentityRuntimePresent=true`;
- `providerIdentityComposerBridgeInstalled=true`;
- `providerIdentityRuntimeStatus=blocked`;
- `providerIdentityRuntimeLinkCount=0`;
- `providerIdentityGlobalLinkCount=0`;
- `providerPrecomposePresent=false`;
- `identityMapSize=0`.

Por tanto, el bridge/source está activo en Hosting DEV pero la lectura browser de `tenants/tya/shopperIdentityLinks` queda bloqueada antes de obtener documentos.

## Reglas y claims — discriminación de causa

El `firestore.rules` vigente permite explícitamente a operadores autenticados leer `shopperIdentityLinks` mediante `tenantAllowed(tenantId) && isOperator()` y mantiene writes browser en deny.

El mismo runtime estable ya probó principal Staff con `role=admin`, `tenantId=tya`, membership verificada y lecturas Firestore vecinas operativas. Esto descarta como causa primaria la ausencia de autenticación Staff o de los claims requeridos por la regla fuente.

El documento provider exacto también está probado previamente por I3.5C-2: live `shp-57d2e3769946`, canonical `TYA_GT_0C0BA8856E`, `providerAck=true`, `periodIndependent=true`.

## Causa raíz definitiva — Rules DEV desalineadas

La evidencia provider-backed más reciente `CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json`, generada 2026-08-18T15:39:39.595Z, confirma:

- `deployedRulesVerified=true` para la última evidencia de despliegue;
- `localRulesMatchDeployedEvidence=false`;
- blocker exacto `static:localRulesMatchDeployedEvidence`;
- provider reads sí ocurrieron;
- Rules deploys, Auth writes, Firestore data writes, Hosting deploys y producción: 0 en esta comprobación.

La última evidencia de deploy real de Rules (`CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`) corresponde al 2026-07-30 y certifica el ruleset desplegado entonces con SHA256 `0c308d0f8b7c0fbd608ad412a9de35eacf66293f9a1fb8ec9ddc7dfb55c071b0`.

Conclusión reproducible: la regla fuente actual que habilita lectura de `shopperIdentityLinks` no coincide con la versión DEV documentada como desplegada. Esto explica exactamente el runtime `blocked` con 0 links aun cuando el asset, el bridge, el documento exacto y los claims Staff existen.

## Hallazgo colateral no bloqueante del objetivo I3.11C

El gate protegido registró `tenantShopperDocs=341` frente al presupuesto histórico esperado de 340. Ese incremento es consistente con la existencia del Shopper sintético I3.8 y no se usa para justificar ni bloquear el fix de Rules. Se conserva documentado; no se elimina ni reprocesa ningún Shopper.

## Frontera de autorización

La solución técnica ya no requiere otro diagnóstico amplio ni otro Hosting deploy. El siguiente paso exacto necesita provider write y por tanto autorización expresa:

`I3_11C_SINGLE_FIRESTORE_RULES_DEV_DEPLOY_AND_STAFF_READONLY_CLOSE`

Alcance solicitado:
- máximo 1 deploy de Firestore Rules DEV del `firestore.rules` exacto vigente a `cxorbia-backend-dev`;
- readback de ruleset/release y hash exacto;
- después, 1 Staff read-only I3 sobre el mismo estado;
- 0 Hosting deploy;
- 0 Cloud Run;
- 0 Auth claims/user/password create/update/reset/delete;
- 0 Firestore data writes;
- 0 HR/Storage/Make/Gemini/pagos;
- 0 Historical Shopper access/login/recovery/reset;
- 0 merge y 0 producción;
- no retry automático.

Criterio de PASS posterior: `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, 2 visitas agosto canonical, 0 residuales, I3.4/I3.6/I3.7 preservados e I3.9/I3.10 reutilizados sin rerun.

## Clasificación

- Reusable CXOrbia: diagnóstico de paridad Rules source/deployed y fail-closed provider identity read.
- Exclusivo cliente: IDs TyA usados como prueba exacta de cierre.
- Claude/prototipo: sin cambio frontend.
- Academia: sin impacto de contenido/rutas.
- Sin impacto Claude: Rules DEV, provider readback y gate I3.
