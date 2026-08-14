# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 20:29 -06:00
**Estado:** `P0_READONLY_GATE_CONSUMED_HOLD_INCONCLUSIVE__SOURCE_CHAIN_REPAIRED_PASS__REAL_SHOPPER_E2E_PENDING__REAL_CUTOVER_BLOCKED`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- M1–M10: **100% de calificación técnica DEV**, no equivalente a aprobación funcional/go-live.
- Deploy DEV anterior: técnicamente PASS, pero aceptación humana Shopper posterior **RECHAZADA**.
- Source repair actual: **no desplegado**.
- Producción/plataforma oficial TyA: intacta.

## Gate DEV read-only autorizado — consumido una vez

Autorización: revalidar Auth/claims/perfiles/HR con llaves exactas y ejecutar E2E Shopper Firebase real → perfil → HR → histórico + Academia/Certificación, sin writes ni deploy.

Run real: `31762716234`, job `94652243857`, artifact `9205200319`, digest `sha256:7d49035d2610dc35e1bf6b1bca73d49c0ba8487e6242014c01269f0bf8f3526c`.

La lectura observó 231 Auth users, 209 principals Shopper efectivos, 340 perfiles Firestore, 616 visitas protegidas, 572 liquidaciones, 77 certificaciones y HR viva de 15 periodos / 660 visitas / 212 shoppers.

El auditor v1 emitió `62 unique / 137 unmapped / 10 ambiguous-review`, pero **ese resultado no es autoritativo**. No faltaron documentos de perfil. El mismo run, por una ruta independiente, demostró `M616/L208/P194`: 616 matches exactos de visita, 208 relaciones únicas HR→shopper protegido y 194 shoppers protegidos con histórico.

## Por qué el resultado v1 quedó invalidado como verdad del universo

La revisión source-only posterior demostró dos problemas: el auditor v1 filtraba fuentes vinculadas antes de permitir la propagación completa de aliases; y el runtime podía construir la relación HR con un `shopperId` protegido todavía expresado como alias técnico legacy, sin canonicalizarlo primero a profile id.

Por tanto **no hay evidencia para afirmar que existan 147 identidades reales rotas**.

## Reparación source-only posterior

Sin volver a leer proveedor, `app/adapters/tya-canonical-state-semantics-v2.js` quedó como seam reusable que normaliza owners de fuentes protegidas vinculadas mediante `CX_EXACT_IDENTITY_CONTRACT` antes de la composición acumulativa. Solo un match técnico exacto único se canonicaliza; ambiguos/no resueltos quedan fail-closed.

Regresión dedicada: `tools/qa/cxorbia-p0-global-composition-source-selftest.mjs`.

Gate source autoritativo run `31763545130`, job `94654691101`: **SUCCESS**; `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`, `PASS_P0_GLOBAL_COMPOSITION_SOURCE`, `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`; smoke `GO_WITH_WARNINGS_VISUAL_SMOKE_POST_V96`; hard fails 0; artifact `9205478201`; digest `sha256:12c5196203588c70ebe2f2ba86774f77965d7fbb5dbdcdb27007aa916272706a`.

El self-test PASS demuestra source-only la cadena `profile claim → profile alias → protected visit → hrRowId → live HR` y la canonicalización de la visita al profile id correcto.

## Credencial y E2E real

El selector privado disponible estaba ligado al handoff histórico de 109 credenciales. No obtuvo credencial Shopper vigente; no exportó valores y no produjo sign-in. Por ello el navegador E2E real **no se ejecutó**; no se clasifica como FAIL. Academia y Certificación real permanecen pendientes.

## STOP_RETRY y seguridad

El request está `enabled=false`, `consumed=true`, `status=consumed_hold_stop_retry`, `allowedExecutions=0`. Run final de neutralización `31763754714` terminó SUCCESS y dejó **skipped** todos los pasos de autorización/provider/credencial/proxy/E2E. No hubo segundo provider read.

Acumulado del gate: provider read executions 1; provider/Auth/Firestore/HR/Rules/Storage writes 0; password changes/resets 0; Hosting/Cloud Run deploys 0; Make/Gemini/pagos 0; merge false; producción false.

## Academia

Contenido/UI sin cambios. El E2E source ya exige rutas `aprendizaje` y `cert`, pero la identidad Shopper real todavía no fue autenticada sobre el source corregido. No declarar aceptación Academia/Certificación.

## Siguiente bloque exacto

**Source-only:** reconciliar el handoff privado vigente de Shopper/candidatos de credencial usando únicamente material ya existente, sin provider read, sin reset/cambio de contraseña y sin PII en repo. Después de resolver ese mecanismo, una nueva lectura v2 + E2E real requerirá **nueva autorización explícita one-shot**. Solo un PASS real habilitaría solicitar un gate separado de deploy DEV.

Evidencia prevalente: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
