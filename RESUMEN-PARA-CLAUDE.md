# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL_PARTIAL__CUMULATIVE_HR_PROFILE_FINANCE_FIX_PREPARED__HOSTING_GATE_WAITING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe aprobados se preservan.
- PR#7 draft/open/no merge; producción intacta.

## 2. Human visual — resultado
El acceso sin credenciales ya funciona: auto-entry Admin y picker Shopper real están disponibles. La prueba humana falló por **composición de fuentes**, no por UI ni por pérdida del histórico.

Capturas reales mostraron:
- Dashboard JUL2026 en0 visitas;
- HR viva/auto-refresh no visible;
- Shoppers mezclando datos reales, fixtures, aliases legacy y referencias técnicas;
- ficha correcta sin username/pass/datos completos en algunos casos;
- histórico/KPI incompleto;
- Beneficios y Finanzas vacíos.

## 3. Causa raíz
`tya-dev-full-visual-bridge.js` reemplazaba la base `CX.data` por Firestore protegido. Además, el watcher HR estaba deshabilitado en full visual y coexistían IDs de periodo `cinepolis::YYYY-MM` / `cinepolis-YYYY-MM`, dejando `CX.data.visitas()` vacío para el periodo activo. Los340 docs Firestore no son por sí mismos el listado operacional humano: contienen aliases/fixtures/referencias que deben reconciliarse por llave estable.

## 4. Regla de precedencia acumulativa — obligatoria
Claude no debe rediseñar ni parchear módulos por este hallazgo. El contrato correcto es:
1. **HR viva:** periodos, periodo activo, visitas operativas, auto-mes/refresh.
2. **Firestore protegido:** identidad/perfil/PII/username/pass legacy ya materializado + facetas/histórico, como overlay exacto.
3. **Finanzas/pagos canónicos:** autoridad para Finanzas, Beneficios, liquidaciones y pagos históricos.

Ninguna capa nueva puede reemplazar otra previamente aprobada.

## 5. Fix preparado en backend/adapters — no desplegado
- `tya-dev-full-visual-bridge.js` ahora hace overlay acumulativo exacto por `id/shopperId/legacyShopperId`;
- no usa nombre/teléfono/email para dedupe;
- alias legacy se oculta solo si otro perfil canónico tiene `legacyShopperId` exacto igual al id del alias;
- fixtures demo y referencias técnicas sin identidad operacional no se agregan como personas nuevas;
- visitas protegidas enriquecen por `visitId` y preservan period/project IDs de HR;
- watcher HR sigue activo en full visual y reaplica overlay después de refresh;
- fuente financiera canónica no se reemplaza;
- `/app/modules/*` no fue tocado.

## 6. Provider gate pendiente
Request `backend/config/corte6-cumulative-human-visual-hosting-request.json` preparado disabled. Solo requerirá, si se autoriza:
- 1 Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- 0 Cloud Run redeploy;
- 0 Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes;
- no nuevo Firebase/Hosting, no merge, no producción.

## 7. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. Nunca resolver por nombre/teléfono/email ni crear silenciosamente.

## 8. Siguiente gate
`1x HOSTING DEV ACUMULATIVO → HUMAN VISUAL ÚNICA HR+SHOPPER+BENEFICIOS+FINANZAS → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.
