# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_SINGLE_LOGIN_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

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
- `PASS_EXACT_AUTH_IMPORT_READBACK`: imported91; readback91/91; shopper88 + super1 + coordinador2; Auth17→108; resets0; deletes0; overwrite0.
- HOLD:21 shopper sin match canónico exacto + demo1 + ambiguos18/77; no inferir.

## 4. P0 doble login — cerrado técnicamente en DEV
El build previo fue rechazado por Paula por mostrar `Acceso seguro` antes del login normal. La causa raíz fue corregida focalizadamente sin tocar módulos.

Single-login vigente:
- login normal TyA/CXOrbia como único punto visible;
- Auth detrás del producto;
- Usuario + Contraseña dentro de la misma tarjeta cuando corresponde;
- sesión Firebase válida restaurable silenciosamente;
- logout real;
- `product-login-session`;
- gates bloquean el overlay paralelo histórico.

## 5. Redeploy focalizado autorizado — PASS
La autorización de Paula fue consumida una sola vez.

`PASS_EXISTING_HOSTING_DEV_SINGLE_LOGIN_REMOTE_VERIFIED`

- request `corte6-single-login-redeploy-20260730-02`;
- hosting deploy executions1;
- versión `sites/cxorbia-backend-dev/versions/a4b90bd224b28329`;
- release `sites/cxorbia-backend-dev/releases/1785448336285000`;
- browserAuth remoto true;
- entrypoint true;
- proof true;
- usernamePasswordNamespaced true;
- singleVisibleLogin true;
- parallelAuthGate false;
- preservedLegacyAuthUsers91.

Seguridad: nuevo Firebase0; nuevo Hosting0; Auth writes durante Hosting0; Firestore data writes0; Rules0; Storage0; HR0; legacy0; pagos0; Functions0; Make/Gemini0; merge=false; producción=false.

## 6. Gate vivo actual
`VALIDACIÓN VISUAL HUMANA DEL NUEVO SINGLE-LOGIN DEV → SI APRUEBA: FREEZE CORTE6`.

No pedir a Paula password, PowerShell ni nueva prueba del build viejo.

## 7. Agosto
- Fuente materializada llega hasta julio 2026:14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 8. Claude / prototipo
- No nueva candidata.
- No tocar `app/modules/*` por este P0.
- Fix ya aplicado y publicado focalizadamente.
- P1/P2 no bloqueante: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 9. Academia
`ACADEMIA-IMPACTO-CORTE6-SINGLE-LOGIN-REMOTE-PASS-20260730.md`: un único flujo visible, provider interno, namespaces, sesión/refresh/logout, recuperación, scopes y troubleshooting.

## 10. Siguiente bloque exacto
`VISUAL PAULA → FREEZE CORTE6 → REFRESH HR → RESOLVER AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.
