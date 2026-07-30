# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REDEPLOY1_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura vinculante:
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final;
- `cxorbia-backend-dev` = backend DEV canónico;
- Hosting DEV existente = `cxorbia-backend-dev.web.app`, target `cxorbia-dev`;
- proyecto padre `cinepolis`; meses = periodos;
- sandbox C4 = no destino;
- no crear otro Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`.

Para candidatas frontend continúa `EXECUTION_LANE_READY → AUDITORÍA → GO/P0 → APPLY_DELTA_DIRECTLY`.

## 3. Cortes protegidos — no reabrir
- Corte 1 / 2A: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- HR histórico canónico: 14 periodos /616 visitas hasta julio 2026.
- R17N FINAL DEV: 1,406/1,406 data writes y readback; mismatch0.
- Corte 5 `CX.data`: project=`cinepolis`, periods14, visits616, currentPeriod=`2026-07`, source=firestore, fallback=false PASS.
- No repetir históricos ni reabrir snapshots superados.

## 4. Fuente/identidad materializada
- HR hasta julio:208/208 refs shopper listas →194 perfiles canónicos únicos.
- Legacy shoppers:120 profile creates materializados;22 updates HOLD;7 legacy HOLD.
- Certificaciones:77 materializadas +1 HOLD.
- 616 visitas,572 controles de liquidación.
- Agosto HN HOLD por inconsistencia país/tab.

## 5. Corte 6 — Auth/RBAC/Rules previo
- 5/5 claim updates autorizados sobre cuentas técnicas existentes;
- Rules canónicas desplegadas/readback PASS;
- Firestore data writes0;
- Hosting DEV previo1/1 consumido y verificado.

El selector visual de rol nunca reemplaza Firebase Auth como autoridad.

## 6. P0 continuidad de credenciales — causa raíz corregida
TyA conserva `Tipo de acceso + Usuario + Contraseña`; Firebase queda detrás del adapter.

Causa raíz:
1. credenciales legacy no materializadas en Auth canónico;
2. dedupe global de username mezclaba staff/shopper;
3. browser adapter necesitaba namespace.

Corrección:
- namespaces `staff` / `shopper`;
- provider interno determinístico por tenant+namespace+username;
- no email técnico visible;
- no password/token/UID persistido;
- claims exactos role/namespace/tenant/project/shopperId.

## 7. Credential handoff source-safe
- shopper source282;
- safe credential groups109;
- exact duplicates collapsed93;
- ambiguous groups18 /records77 HOLD;
- missing password2 /login1 HOLD;
- staff4: superadmin1/coordinador2/demo1;
- encrypted bundle113;
- PII/login/password/hash legibles en repo/evidencia0.

El dry-run inicial de12 queda superseded.

## 8. Auth import exacto — EJECUTADO PASS
Autorización combinada consumida.

`PASS_EXACT_AUTH_IMPORT_READBACK`:
- imported91;
- readback91/91;
- shopper88 + super1 + coordinador2;
- Auth users17→108;
- password resets0;
- deletes0;
- overwrite0;
- Firestore data writes0;
- Rules0;
- Hosting deploys durante import0.

Cualquier identidad fuera de los91 elegibles continúa HOLD; no inferir.

## 9. Hosting DEV continuidad — EJECUTADO PASS
Se habilitó únicamente después del readback91/91.

`PASS_EXISTING_HOSTING_DEV_CREDENTIAL_CONTINUITY_REMOTE_VERIFIED`:
- mismo Firebase/site/target;
- redeploy adicional1/1;
- browser-auth remoto PASS;
- entrypoint remoto PASS;
- proof remoto PASS;
- username/password namespaced PASS;
- preservedLegacyAuthUsers91;
- nuevo Firebase0;
- nuevo Hosting0;
- Auth writes durante Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

## 10. Gate actual — validación visual humana
Corte6 está **técnicamente PASS**, pero no se congela hasta validar visualmente el acceso con credenciales TyA existentes.

`DEV PUBLICADO → LOGIN TYA EXISTENTE → VALIDAR ROL/ALCANCE → APROBADO → FREEZE CORTE6`.

No pedir credenciales técnicas DEV. No compartir passwords en conversación.

## 11. Después de FREEZE Corte 6
Prioridad inmediata por meta de producción:
`REFRESH HR → RESOLVER AGOSTO HN → VALIDAR PERIODO/VISITAS → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.

No repetir los 1,406 writes históricos.

## 12. Corte 7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, cuestionario configurable y evidencias protegidas. Make/Gemini solo con gate y revisión humana. No debe retrasar cutover si la parte no activada no bloquea la operación Phase A autorizada.

## 13. Corte 8 — preproducción/cutover
Requiere cortes previos congelados, refresh delta final, rollback, smoke integral y autorización específica de producción. Cutover sobre el mismo Hosting/URL público `tya-plataforma`; no cambiar URL.

## 14. Claude/prototipo
- No nueva candidata.
- No tocar `app/modules/*` desde backend.
- La UX de login debe ser genérica y configurable; no exponer provider/email técnico.
- Solo tarea focalizada si aparece P0 frontend reproducible.
- P1/P2 no bloqueantes se preservan: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

## 15. Academia
Actualizar manuales/cursos/rutas con: Auth real detrás del acceso, namespace de perfil, usuario ≠ email obligatorio, recuperación/cambio, scopes tenant/proyecto/rol, shopperId exacto, dedupe seguro, import/readback91/91, one-shot Hosting DEV y fail-closed.

## 16. Estado seguro
R17N:1,406 Firestore writes ya cerrados. Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1. Continuidad: Auth imports91/readback91; password resets0; deletes0; Hosting adicional1; Firestore data0; Rules0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false; PII/credenciales crudas repo/artifacts0.
