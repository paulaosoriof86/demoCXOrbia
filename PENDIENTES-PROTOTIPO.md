# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL_PARTIAL__CUMULATIVE_HR_PROFILE_FINANCE_FIX_PREPARED__HOSTING_GATE_WAITING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Human no-credential access: auto-entry Admin + picker Shopper PASS.

## 2. P0 actual — visual no acumulativa
La prueba humana confirmó que el acceso funciona pero los datos no se componen correctamente:
- Dashboard JUL2026 mostraba0 visitas;
- watcher HR viva se había deshabilitado en full visual;
- Shoppers mezclaba identidades reales con fixtures/aliases/referencias técnicas;
- perfil/histórico/credenciales no se reflejaban completos en todos los exactos;
- Beneficios y Finanzas aparecían vacíos.

No congelar Corte6.

## 3. Fix de raíz preparado, no desplegado
- human full visual pasa de replace a overlay;
- HR viva conserva periodos/visitas/auto-mes;
- Firestore protegido agrega perfil e histórico solo por IDs exactos;
- aliases legacy se suprimen solo por `legacyShopperId` exacto;
- fixtures y referencias técnicas sin identidad operacional no se añaden a la lista humana;
- watcher HR permanece activo y reaplica overlay;
- finanzas/pagos canónicos permanecen autoridad;
- módulos UI intactos.

## 4. Gate pendiente
`backend/config/corte6-cumulative-human-visual-hosting-request.json` preparado pero disabled.

Pendiente autorización de máximo 1 redeploy del Hosting DEV existente. No requiere Cloud Run nuevo ni data writes.

## 5. Validación acumulativa requerida después del gate
Una sola ronda debe comprobar conjuntamente:
- Dashboard/HR JUL con visitas reales y HR viva/auto-mes preservada;
- Shoppers con identidades correctas, perfil, username/pass real cuando exista, teléfonos/PII e histórico;
- Shopper portal con misma identidad e histórico;
- Beneficios con verdad financiera/pagos aprobada;
- Finanzas Administración con datos canónicos aplicables.

## 6. 31 perfiles sin canonical — HOLD probado
No resolvibles por legacy exacto, llaves técnicas ni Auth determinístico+claim. No emparejar por nombre/teléfono/email. Requieren decisión/conciliación explícita posterior.

## 7. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 8. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6. HR live/auto-month debe permanecer operativa mientras se cierra C6.

## 9. Siguiente bloque
`AUTORIZACIÓN 1x HOSTING DEV ACUMULATIVO → PREFLIGHT READ-ONLY → DEPLOY → HUMAN VISUAL ACUMULATIVA → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
