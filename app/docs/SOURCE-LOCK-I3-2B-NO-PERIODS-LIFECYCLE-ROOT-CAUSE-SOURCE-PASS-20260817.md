# SOURCE LOCK — I3.2B NO_PERIODS_VISIBLE · ROOT CAUSE EXACTA · SOURCE PASS

**Fecha:** 2026-08-17 14:01 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_2B_RUNTIME_FAIL_EXACT_NO_PERIODS_VISIBLE__ROOT_CAUSE_PROVEN__FOCAL_ADAPTER_FIX_SOURCE_PASS__NO_SECOND_DEPLOY`

## 1. Resultado real de I3.2B

Request: `i3-2b-granular-authenticated-staff-runtime-recheck-20260817-01`.

Run `32062886562`, job `95488006557`, artifact `9298816339`, digest `sha256:be156af1aa8eddc62cb55243da5a1f1d22e79a3cb8e6297c8fbb0dafc791c270`.

El job GitHub terminó `success` porque el step runtime usa `continue-on-error` para poder generar evidencia. La autoridad real del resultado está en el artifact sanitizado:

- overall: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`;
- runtime: `FAIL_C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`;
- blocker granular: **`staff_first_NO_PERIODS_VISIBLE`**.

El único deploy permitido quedó consumido. No hay segundo deploy automático.

## 2. Evidencia runtime que descarta causas anteriores

En el mismo `staff_first`:

- role `admin`, namespace `staff`, tenant `tya`;
- membership verified = true;
- membership projectIds = `['cinepolis']`;
- HR authority applied = true;
- 15 periodos;
- 660 visitas;
- currentProjectId = `cinepolis`;
- currentPeriodId = `cinepolis-2026-08`;
- firstPeriod `2025-06`, latestPeriod `2026-08`;
- duplicateVisitKeys = 0;
- duplicateShopperIds = 0;
- dataStatus `ready`;
- emptyShell = false;
- backendEmpty = false;
- source block = false;
- rail mounted = true;
- view mounted = true;
- project selector mounted = true;
- **period selector mounted = false**;
- `Sin periodos disponibles` visible = true.

Por tanto I3.2B ya no es un fallo genérico de Auth, HR, build, shell, backend vacío o fuente.

## 3. Legal queda descartado como blocker de I3.2B

El mismo snapshot reportó:

- legal runtime present = true;
- legal loaded = true;
- legal pending = false;
- legal provider authority = true;
- legal error = null;
- legal modal visible = false.

La duplicidad histórica del prompt sigue P1 y el receipt durable completo permanece en I3.7, pero **legal no fue la causa del NO_PERIODS_VISIBLE actual**.

## 4. Causa raíz exacta demostrada

`tya-c6-live-user-admin-membership-wiring-v1.js` verifica membership antes de entrar al frontend y luego llama `CX.app.enter()`.

El propio adapter documenta que `backend-browser-auth` envuelve `CX.app.enter()` y reconstruye temporalmente `CX.session.user`, limpiando metadata transitoria de membership. La república mediante `reconcile(verifiedCtx)` ocurre **después** de que `CX.app.enter()` retorna.

Pero `CX.app.enter()` llama `CX.router.mount()` sincrónicamente. Por tanto, durante ese mount existe una ventana estrecha donde:

1. la membership ya fue verificada provider-backed;
2. el contexto Auth todavía conserva tenant/role/projectIds exactos;
3. `CX.session.user.membershipVerified` puede estar temporalmente ausente;
4. `tya-phase-a-authority-compat-v1.js` antes exigía `membershipVerified===true` para usar projectIds root-project;
5. al no cumplirlo, caía al helper legacy `projectsFor()`;
6. ese helper interpreta `scopeProjectId='cinepolis'` como si fuera un ID de periodo y filtra `p.id==='cinepolis'`;
7. los 15 periodos reales tienen IDs `cinepolis-YYYY-MM`;
8. el rail termina con selector Proyecto pero `Sin periodos disponibles`.

Esto explica exactamente el snapshot observado: datos canónicos 15/660 correctos + rail montado + project selector sí + period selector no.

## 5. Corrección focal aplicada

Archivo único de producto-adapter tocado:
`app/adapters/tya-phase-a-authority-compat-v1.js`.

Commit: `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`.

Se añadió `verifiedTransitionScope()` como fallback exclusivamente durante esa ventana de lifecycle. El fallback solo acepta scope si simultáneamente:

- `CX.backendAuth.context()` está authenticated;
- tenant exacto = `tya`;
- namespace exacto = `staff`;
- `CX_C6_LIVE_USER_ADMIN_WIRING.status === 'verified'`;
- membershipVerified del wiring = true;
- role del contexto = role del wiring;
- `projectIds` del contexto = `projectScope` verificado, por igualdad exacta de conjuntos.

Nunca confía en `scopeProjectId` crudo y no modifica rail, router, módulos ni core.

## 6. Gate source-only

Se extendió solo el QA source-preflight:
`tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`.

Commit: `a3e130387ceb4148aac85053dd4a2af471202a95`.

Valida sintaxis del adapter, guards tenant/namespace/role/projectIds exactos, ausencia de confianza en raw `scopeProjectId`, ausencia de patch directo del rail y presencia de las aserciones runtime granulares.

Source-only request: `i3-2b-no-periods-lifecycle-fix-source-preflight-20260817-01`.

Run `32063359036`, job `95489516680`, artifact `9298942951`, digest `sha256:230ce157c867893921333ea8253f31835bb50a63f17d732b2ba551b1a6f5f94a`.

Decision: `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`.

Provider calls 0; Hosting/Cloud Run deploys 0; Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes 0; Historical Shopper access 0; merge false; production false.

## 7. Congelado — NO REPROCESAR

I1/I2 PASS; Historical Shopper `31906391682` PASS/reset consumido; TARGET_B Admin `32049054855` PASS; request08 consumido; HR 15/660 no reimport; Finance V2/source-safe/historical no rebuild; canonical V2/exact identity preservados; legal prior materialization/deploy no rerun/autoaccept.

## 8. Progreso

Formal sigue **35% / 65%** porque I3 solo suma al cierre integral. Avance interno real: I3.1 PASS; I3.2/I3.2B ya redujeron el blocker a una única causa exacta y esa causa quedó corregida en source con preflight PASS.

## 9. Siguiente acción exacta

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

Requiere un gate nuevo porque I3.2B consumió el máximo de un deploy. Debe desplegar exactamente el HEAD vigente y comprobar que:

1. project selector sigue presente;
2. period selector aparece;
3. 15 periodos/660 visitas/AGO 2026 permanecen;
4. legal sigue no-pending;
5. reloads y new-tab permanecen estables.

Si PASS, cerrar I3.2 e I3.3 y continuar inmediatamente I3.4→I3.7 sin reabrir diagnóstico general.

## 10. Clasificación

- Reusable CXOrbia: lifecycle-safe verified membership scope during canonical enter.
- Exclusivo cliente: TyA `cinepolis`, 15/660 y DEV.
- Claude/prototipo: cero cambio en modules/core; no UI patch.
- Academia: documentar race de sesión verificada vs render síncrono.
- Sin impacto Claude: adapter/tooling/gates salvo obligación de no revertir.
