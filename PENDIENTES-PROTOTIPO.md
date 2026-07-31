# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_CUMULATIVE_HOSTING_PASS__WAITING_HUMAN_VISUAL_CUMULATIVE__31_HOLD__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Human no-credential access: auto-entry Admin + picker Shopper PASS.
- Hosting DEV acumulativo: 1 redeploy autorizado y remote smoke PASS.

## 2. P0 visual anterior — corregido técnicamente, pendiente validación humana
La prueba humana anterior confirmó una regresión acumulativa: Dashboard0, watcher HR deshabilitado, identidades/aliases mezclados, perfil/histórico parcial y Beneficios/Finanzas vacíos.

La causa raíz fue replace de `CX.data` + period IDs desalineados + watcher desactivado. El fix ya está publicado como overlay acumulativo.

## 3. Estado técnico publicado
`PASS_EXISTING_HOSTING_DEV_CUMULATIVE_HR_PROFILE_FINANCE_REMOTE_READY`:
- HR `fresh=1` +616 visitas + auto-discovery PASS;
- Firestore perfil/histórico como overlay por IDs exactos;
- alias legacy solo por `legacyShopperId` exacto;
- fixtures/referencias técnicas no deben agregarse como personas nuevas;
- finance asset canónico preservado;
- full-profile sigue401 sin sesión visual;
- `/app/modules/*` intacto.

## 4. Gate pendiente ahora
Una sola validación humana acumulativa debe comprobar:
- Dashboard/HR JUL con visitas reales y HR viva/auto-mes;
- Shoppers con identidades correctas, perfil, username/pass legacy real cuando exista, PII e histórico;
- portal Shopper con la misma identidad;
- Beneficios con verdad financiera/pagos aprobada;
- Finanzas Administración con datos canónicos.

La sesión visual temporal existente es válida hasta `2026-08-02T00:29:13Z`; no requiere otro deploy.

## 5. 31 perfiles sin canonical — HOLD probado
No resolvibles por legacy exacto, llaves técnicas ni Auth determinístico+claim. No emparejar por nombre/teléfono/email. Requieren decisión/conciliación explícita posterior.

## 6. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 7. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6. HR live/auto-month debe permanecer operativa mientras se cierra C6.

## 8. Siguiente bloque
`HUMAN VISUAL ACUMULATIVA → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
