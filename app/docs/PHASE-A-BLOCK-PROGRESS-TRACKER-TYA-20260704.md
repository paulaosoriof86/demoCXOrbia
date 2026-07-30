# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_DEV_MATERIALIZED_1406_CXDATA_PASS__C6_AUTH_RULES_HOSTING_TECH_PASS__HUMAN_VISUAL_PENDING`

## 1. Estado general
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Baseline frontend `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV canónico `cxorbia-backend-dev`.
- Hosting DEV existente `cxorbia-backend-dev.web.app`, target `cxorbia-dev`.
- Hosting público final futuro `tya-plataforma`.
- No nueva candidata/base/rama/PR/Hosting.

## 2. Bloques cerrados
### Corte 1 / 2A / 3
FROZEN/APROBADO. Corte 3: 14 periodos/616 visitas, mayo44 pagadas, junio2 pagadas/42 pendientes.

### Corte 4 — preparación/mapping
CERRADO para materialización: HR hasta julio, 208/208 refs, 194 perfiles canónicos, 77 certificaciones, write plan idempotente.

### Corte 5 — materialización DEV + CX.data
- 1,406/1,406 Firestore data writes y readback; mismatch0.
- 616 visitas, 572 controles de liquidación, 77 certificaciones.
- P0 proyecto/periodo corregido focalmente.
- Re-smoke final PASS: source=firestore, fallback=false, projects1, periods14, visits616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`, blockers0.
- No repetir materialización.

### Corte 6 — Auth/RBAC + Rules + Hosting DEV técnico
**PASS técnico.**
- Auth custom claims: 5/5 updates sobre cuentas existentes (cliente2 + shopper3 exactos).
- Cuarto shopper sin vínculo: no tocado.
- Usuario nuevo/password/delete: 0/0/0.
- Readback: operador ready7, cliente ready2, shopper ready3.
- Firestore data writes Corte6: 0.
- Rules canónicas `status` + compatibilidad `estado`: desplegadas/readback PASS por API oficial.
- Hosting DEV existente: 1/1 deploy consumido, sin nuevo Firebase/Hosting.
- Release `sites/cxorbia-backend-dev/releases/1785431702100000`.
- Version `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED.
- Remote proof/config/browser Auth/`index-backend-dev.html`: PASS.
- Root `/` sirve `app/index.html` por precedencia exact-static; no bloqueante.

## 3. Gate vivo — validación visual autenticada
URL DEV canónico:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

Validar Admin/Ops, Cliente y Shopper con cuentas DEV existentes. No compartir credenciales por chat.

Criterios:
- alcance por proyecto correcto;
- identidad shopper real y exacta;
- disponibles autorizadas;
- shopper no vinculado fail-closed;
- no regresión en módulos Phase A/Academia;
- no copy técnico en UI normal.

## 4. Agosto
- Fuente canónica materializada termina julio 2026.
- Agosto HN HOLD por inconsistencia país/tab.
- Después del PASS visual: FREEZE Corte6 → refresh fuente → resolver HOLD → validar periodo/visitas → materializar solo delta agosto.

## 5. Siguiente bloque exacto
`VISUAL AUTENTICADA → FREEZE CORTE6 → AGOSTO DELTA → CORTE8 PREPROD/CUTOVER`.

## 6. Claude/prototipo
No nueva candidata. Solo tarea localizada si el smoke visual demuestra P0 frontend reproducible. P1/P2 preservados: PDF gráfica, Excel formato, reportKit/copy.

## 7. Academia
Actualizar identidad autenticada vs selector de rol, tenant/proyecto/claims, shopperId exacto, mínimo privilegio, visitas disponibles protegidas, CLI vs API y exact-static vs rewrite.

## 8. Clasificación
- `Reusable CXOrbia`: Auth browser, principal-scoped reads, claim migration fail-closed, Rules/Hosting API gates.
- `Exclusivo cliente`: TyA/Cinépolis, scopes stale y agosto.
- `Claude/prototipo`: sin tarea hasta visual.
- `Academia`: Auth/RBAC/Hosting/Rules.
- `Sin impacto Claude`: runners/requests/evidencia/release IDs.

## 9. Estado seguro
R17N previo: 1,406 data writes. Corte6: Auth claim writes5; Firestore data writes0; Rules release1 verificada; Hosting1/1; usuarios nuevos/password/deletes0; Storage/HR/legacy0; payments0; merge=false; production=false; Make/Gemini0; PII/secrets crudos0.
