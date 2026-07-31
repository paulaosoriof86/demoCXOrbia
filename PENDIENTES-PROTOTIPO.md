# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_COMPOSITION_REGRESSION__PERMANENT_STABILITY_LOCK_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Human no-credential access: auto-entry Admin + picker Shopper PASS.

## 2. P0 vigente — composición no idempotente
La validación humana del Hosting acumulativo mostró:
-88 visitas al primer render y44 después del refresh;
- badge con1,232 visitas y546 shoppers;
- movimiento de scroll/pantalla al actualizar;
- duplicados Shopper;
- perfil/credenciales/histórico repartidos;
- comparativo histórico incompleto;
- estados variables entre render inicial y refresh.

La HR viva está disponible; el P0 está en el read model/overlay acumulativo.

## 3. Causa raíz
El full visual reutiliza arrays ya compuestos como base de la siguiente reaplicación. Esto rompe idempotencia y permite crecimiento por refresh.

## 4. Corrección permanente obligatoria
- baseline HR inmutable por revisión;
- composer idempotente;
- reconcile visitas por `visitId/hrRowId/sourceTab+sourceRow` exactos;
- no append histórico protegido duplicado;
- crosswalk Shopper técnico y auditado;
- preservación de periodo/ruta/filtros/modal/scroll;
- regression gate con3 reaplicaciones sin crecimiento;
- una sola prueba acumulativa incluye Dashboard, histórico, Shopper, Beneficios y Finanzas.

## 5. Lock para prototipo/Claude
Activo `app/docs/ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Toda candidata futura debe preservar funcionalidades ya aprobadas; un cambio de etapa no puede reintroducir fixtures, fallbacks, estados antiguos ni pérdidas de fuente.

## 6. 31 perfiles sin canonical — HOLD
No resolvibles por vínculo técnico actual. No usar nombre/teléfono/email para emparejar.

## 7. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 8. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6 bajo el nuevo regression lock. HR live/auto-month debe permanecer operativa.

## 9. Siguiente bloque
`ROOT FIX IDEMPOTENTE + CROSSWALK + UI STATE → REGRESSION GATE ACUMULATIVO → DEV VISUAL → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
