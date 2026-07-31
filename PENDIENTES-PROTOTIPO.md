# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_SESSION_CONTINUITY_HOSTING_PASS__WAITING_ONE_REAL_LOGIN_REFRESH_NO_REPROMPT_HUMAN_VISUAL__31_IDENTITY_HOLD__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Protected session continuity Hosting DEV redeploy PASS.

## 2. Login repetitivo — corregido técnicamente
La causa raíz fue persistencia Auth `SESSION` en el carril protegido/browser-auth. El runtime protegido ahora fuerza Firebase Auth `LOCAL` mediante `backend-protected-dev-session-continuity.js`, conserva claims/Rules reales y logout explícito.

Authorization `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida PASS. Version `1e8c37163e7451be`; release `1785515981786000`. No hubo otros provider writes/deploys.

## 3. Validación visual aún pendiente
- ejecutar una primera autenticación real válida en el navegador;
- hacer refresh sobre la misma URL y confirmar que no reaparece usuario/contraseña;
- Admin/Coordinación: perfil completo, username/password legacy real cuando exista, teléfonos/WhatsApp, DPI y demás campos materializados;
- KPI de shoppers con drill/detail;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper real con shopperId claim y módulos propios.

## 4. 31 perfiles sin canonical — HOLD probado
No resolvibles por legacy exacto, llaves técnicas ni Auth determinístico+claim. No emparejar por nombre/teléfono/email. Requieren alta/conciliación explícita.

## 5. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 6. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6.

## 7. Siguiente bloque
`1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
