# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_P0_SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Repositorio y destinos fijos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- No nueva base/Hosting/rama/PR/candidata.

## 2. Baseline que no se reabre
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL DEV:1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado: foundation16 + perfiles125 + certificaciones77 + visitas616 + controles liquidación572.
- Corte5 `CX.data`: source=firestore, fallback=false, project=`cinepolis`, periods14, visits616, currentPeriodId=`2026-07` PASS.
- No repetir los1,406 writes históricos.

## 3. Corte6 Auth preservado
- claims autorizados5/5 + Rules exactas PASS.
- namespaces `staff` / `shopper`.
- identidad Firebase interna determinística por tenant+namespace+username.
- no correo técnico visible; no password/token/UID persistido.
- `PASS_EXACT_AUTH_IMPORT_READBACK`: imported91; readback91/91; shopper88 + super1 + coordinador2; Auth17→108; resets0; deletes0; overwrite0.
- HOLD: 21 shopper credentials sin match canónico exacto + demo1 + ambiguos18/77; no inferir.

## 4. Hosting DEV previo y P0 humano
El Hosting DEV previo tuvo PASS técnico, pero Paula lo rechazó visualmente porque mostraba un gate separado `Acceso seguro` antes del login normal. Ese build publicado sigue **NO APROBADO** y no debe volver a probarse.

Causa raíz histórica:
1. `backend-browser-auth.js` creaba un overlay full-screen paralelo;
2. interceptaba `CX.app.showLogin()`;
3. limpiaba sesión al cargar;
4. config usaba `interactive-session`;
5. Firebase Auth se hacía visible como segundo login.

## 5. Corrección P0 aplicada
La rama viva ahora implementa single-login:
- `app/core/backend-browser-auth.js`: sin overlay backend paralelo; Auth detrás del login normal; credenciales dentro de la misma tarjeta; restauración silenciosa de sesión válida; logout real.
- `app/core/backend-config-preview-dev.js`: `product-login-session`.
- preflight Hosting y workflow: bloquean marcadores del gate antiguo y verifican single-login remoto antes de declarar PASS.

Commits:
- `e95e8a9662373183ec17186831cf81b89094515a` — fix principal.
- `32aee807d4c48760679267e1f8cd577d4681f4ea` — config.
- `f3aa90cc0f765beafdfa90e5b55d953239488746` — preflight.
- `e0b98140744135361f0d1d000ce31435b7ea59d2` — workflow/gates.

## 6. Gate estático ejecutado
Se actualizó el request ya consumido únicamente para solicitar revalidación estática, con `p0SingleLoginProviderWritesAuthorized=false`.

Commit `790d4d514b8e7b4630063ebf2aebba5997e3ec26` obtuvo:
`success · cxorbia/corte6-credential-continuity-hosting/PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

Esto confirma los checks estáticos del nuevo single-login. No cargó service account ni ejecutó Hosting/provider writes porque la autorización anterior permanece consumida.

## 7. Gate vivo actual
`AUTORIZACIÓN ÚNICA DE REDEPLOY MISMO HOSTING DEV → PRECHECK SINGLE-LOGIN → DEPLOY1 → SMOKE REMOTO → VALIDACIÓN VISUAL PAULA → FREEZE CORTE6`.

No pedir a Paula password, PowerShell ni una nueva prueba del build viejo.

## 8. Agosto
- Fuente materializada llega hasta julio 2026:14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 9. Claude / prototipo
- No nueva candidata.
- No tocar `app/modules/*` por este P0.
- El fix ya quedó focalizado en el punto de integración autorizado.
- Patrón reusable: un único login visible; provider/Auth detrás del producto; sesión restaurable; logout real.
- P1/P2 no bloqueante: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 10. Academia
Actualizar manuales/cursos con un único flujo de acceso visible; Firebase/provider interno; namespaces staff/shopper; recuperación/cambio de contraseña; scope tenant/proyecto/rol; shopperId exacto; troubleshooting sin doble login.

## 11. Estado seguro
Corrección P0 desde hallazgo: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false.

## 12. Siguiente bloque exacto
`OBTENER AUTORIZACIÓN DE UN ÚNICO REDEPLOY FOCALIZADO DEL MISMO HOSTING DEV cxorbia-backend-dev/cxorbia-dev; DESPUÉS EJECUTAR PRECHECK + DEPLOY + SMOKE REMOTO AUTOMÁTICO`.
