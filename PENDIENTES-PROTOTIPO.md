# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__VISUAL_LOGIN_REPRO_P0__SESSION_CONTINUITY_FIX_PREPARED__WAITING_ONE_HOSTING_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.

## 2. P0 visual actual — reproceso de login
La visual protegida volvió a pedir Usuario/Contraseña para Administración/Coordinación. No es un problema de datos ni de Firestore. Causa raíz: persistencia Auth `SESSION` en el carril protegido y en browser-auth.

## 3. Fix preparado
- nuevo `backend-protected-dev-session-continuity.js` protected-only;
- Firebase Auth persistence `LOCAL` para reutilizar sesión ya validada;
- config protegida alineada con `persist:'local'` y `reuseAuthenticatedSession:true`;
- carga antes de browser-auth;
- sin credenciales embebidas, sin bypass claims/Rules y sin provider writes.

Después del próximo redeploy: autenticación real una sola vez por navegador y refresh sucesivos sin re-prompt mientras no haya logout explícito.

## 4. Validación visual que sigue pendiente
- Admin/Coordinación: perfil completo, username/password legacy real cuando exista, teléfonos/WhatsApp, DPI y demás campos materializados;
- KPI de shoppers con drill/detail;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper real con shopperId claim y módulos propios.

## 5. 31 perfiles sin canonical — HOLD probado
No resolvibles por legacy exacto, llaves técnicas ni Auth determinístico+claim. No emparejar por nombre/teléfono/email. Requieren alta/conciliación explícita.

## 6. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 7. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6.

## 8. Siguiente bloque
`NUEVA AUTORIZACIÓN 1x HOSTING DEV SESSION CONTINUITY → REMOTE SMOKE → LOGIN REAL 1 VEZ → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → 31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
