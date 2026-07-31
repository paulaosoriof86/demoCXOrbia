# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_CUMULATIVE_HOSTING_PASS__WAITING_HUMAN_VISUAL_CUMULATIVE__31_HOLD__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe aprobados se preservan.
- PR#7 draft/open/no merge; producción intacta.

## 2. Hallazgo visual ya reproducido
El acceso humano sin credenciales funciona. El FAIL fue de composición: full visual reemplazaba `CX.data`, desactivaba watcher HR y podía desalinear period IDs, causando Dashboard0, identidades mezcladas y Beneficios/Finanzas vacíos.

## 3. Contrato acumulativo obligatorio
1. **HR viva:** periodos, visitas, periodo activo, auto-mes/refresh.
2. **Firestore protegido:** identidad/perfil/PII/username/pass legacy e histórico como overlay por llave técnica exacta.
3. **Finanzas/pagos canónicos:** autoridad para Finanzas, Beneficios, liquidaciones y pagos históricos.

No dedupe por nombre/teléfono/email. Ninguna capa nueva puede reemplazar una fuente aprobada.

## 4. Fix acumulativo publicado PASS
Authorization `chat-20260731-c6-cumulative-human-visual-hosting-01` consumida.

- Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`: **1 redeploy**;
- Cloud Run: **0 redeploy**;
- decisión `PASS_EXISTING_HOSTING_DEV_CUMULATIVE_HR_PROFILE_FINANCE_REMOTE_READY`;
- HR fresh/runtimeRead +616 visitas + auto-discovery PASS;
- overlay protegido + alias exacto PASS;
- finance asset canónico preservado PASS;
- full-profile fail-closed401 sin sesión visual PASS;
- `/app/modules/*` intacto.

El primer intento del gate falló antes de provider mutation por un grep literal frágil. Se corrigió a validación semántica `cumulativeVisual:true`; con deploy count0 se reejecutó la misma autorización aún no consumida. No hubo deploy duplicado.

## 5. Qué NO debe hacer Claude
- no rediseñar login;
- no tocar módulos por este hallazgo;
- no volver a fixtures/demo;
- no resolver identidades por nombre/teléfono/email;
- no reemplazar HR viva ni finanzas canónicas.

## 6. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. Requieren conciliación/alta explícita posterior.

## 7. Gate humano siguiente
Una sola prueba acumulativa:
`Dashboard HR/auto-mes → Shoppers identidad/perfil/credenciales/histórico → portal Shopper → Beneficios → Finanzas Admin → PASS/FAIL`.

La sesión visual existente es válida hasta `2026-08-02T00:29:13Z`; no requiere otro deploy.

## 8. Siguiente bloque Phase A
`HUMAN VISUAL ACUMULATIVA → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.
