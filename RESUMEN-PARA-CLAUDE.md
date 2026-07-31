# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_COMPOSITION_REGRESSION__PERMANENT_STABILITY_LOCK_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe aprobados se preservan.
- PR#7 draft/open/no merge; producción intacta.

## 2. P0 actual reproducido
La visual acumulativa posterior al último Hosting DEV mostró un fallo estructural de composición:
- primer render JUL con88 visitas y posterior44;
- badge1,232 visitas/546 shoppers;
- scroll/pantalla cambia al refrescar;
- shoppers repetidos;
- perfil/username/password/PII e histórico divididos entre identidades;
- comparativo histórico incompleto;
- estados cambian entre render inicial y refresh.

La HR viva sí responde y la HR canónica actual mantiene34 GT +10 HN en julio. El fallo no es falta de HR, sino un overlay no idempotente.

## 3. Causa raíz técnica
`app/adapters/tya-dev-full-visual-bridge.js` usa los arrays actuales de `CX.data` como nueva base en cada reapply. Si ya contienen un overlay anterior, la siguiente composición puede volver a anexar visitas/perfiles.

## 4. Lock permanente obligatorio
Leer y respetar:
`app/docs/ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Ninguna candidata futura puede romper un corte anterior. Toda etapa debe pasar una regression suite acumulativa antes de considerarse válida.

## 5. Ownership de datos
1. HR viva: periodos, visitas, auto-mes y estado operacional.
2. Firestore protegido: identidad/perfil/PII/username/pass como overlay exacto.
3. Finanzas/pagos canónicos: Beneficios, liquidaciones, movimientos y pagos.
4. Auth/RBAC: acceso/scope.
5. Plataforma-origin: delta reconciliado, no duplicado con HR.

## 6. Qué NO debe hacer Claude
- no reconstruir lógica HR, identidad o finanzas en módulos;
- no rediseñar login por este P0;
- no volver a fixtures/demo;
- no resolver identidades por nombre/teléfono/email;
- no reemplazar HR viva ni finanzas canónicas;
- no reintroducir estados superados al cambiar de etapa.

## 7. Regla de estabilidad para prototipo
Toda candidata futura debe conservar la matriz de invariantes ya aprobada. Si una nueva pantalla o etapa altera Dashboard, Shoppers, histórico, Beneficios, Finanzas, periodos o source behavior, es regresión y no se acepta aunque el delta nuevo funcione aisladamente.

## 8. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. Requieren conciliación/alta explícita posterior; no emparejar por similitud.

## 9. Siguiente bloque
`ROOT FIX IDEMPOTENTE + CROSSWALK TÉCNICO + PRESERVACIÓN UI STATE → REGRESSION GATE ACUMULATIVO → solo si PASS deploy DEV y human visual → FREEZE C6 → AGOSTO`.
