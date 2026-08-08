# CAMBIOS BACKEND — Finanzas y Liquidaciones canónicas Corte 6

**Fecha:** 2026-07-31  
**Estado:** CODE PASS / QA PASS / PENDIENTE HOSTING DEV

## 1. Hallazgo raíz adicional
La liquidación base usaba un `switch(v.estado)` que solo reconocía `realizada`, `cuestionario` y `liquidada`. Las33 visitas JUL ya `submitidas` quedaban fuera de `CX.liq.forProject`, por eso la pantalla mostraba únicamente las7 visitas todavía pendientes de cuestionario/submit y omitía la mayoría del ciclo financiero.

Este error también fragmentaba:
- Liquidaciones Admin;
- generación de CxP/Movimientos;
- Beneficios del shopper;
- detalle y trazabilidad de pago.

## 2. Solución canónica
Nuevo `app/adapters/tya-canonical-finance-read-model-v2.js`:
- incluye toda visita realizada en Liquidaciones;
- reconoce progresión mediante `canonicalFacets`, no literales antiguos;
- conserva como autoridad cualquier match financiero exacto y pago histórico confirmado;
- una visita submitida sin cruce financiero aparece, pero queda `reviewRequired` y no puede entrar silenciosamente a lote/pago;
- identidad, periodo, país, moneda y visitId se toman del read model canónico;
- no ejecuta pagos ni crea movimientos reales.

`app/index-backend-dev.html` fue actualizado para cargar este adapter después del snapshot financiero canónico y antes de los módulos.

## 3. Gate reusable
Nuevo `tools/qa/tya-c6-canonical-finance-read-model-gate.mjs` demuestra en escenario JUL representativo:
-44 visitas totales;
-40 realizadas presentes en Liquidaciones;
-33 submitidas no omitidas;
-5 pendientes de submit;
-2 pendientes de cuestionario;
-1 pago exacto preservado cuando existe fuente;
-visitas no realizadas excluidas;
-llaves de liquidación únicas;
-ejecución de pagos deshabilitada.

Decisión integrada al workflow read-only:
`PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`.

La evidencia vigente `CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json` registra simultáneamente:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

## 4. Impacto Phase A
Recupera el alcance ya aprobado de liquidaciones/beneficios sin afirmar pagos inexistentes. Julio debe mostrar las40 visitas realizadas dentro del ciclo de liquidación, diferenciando:
-2 pendientes de cuestionario;
-5 pendientes de submit;
-33 submitidas/candidatas de cruce financiero;
-0 pagos confirmados en julio según la fuente vigente.

## 5. Claude/prototipo
Claude debe eliminar el `switch` literal como autoridad financiera. Liquidaciones, Movimientos y Beneficios deben consumir las mismas facetas canónicas y nunca omitir estados posteriores como `submitida`.

## 6. Academia
Actualizar manuales con la diferencia entre:
- avance operativo;
- candidata de liquidación;
- cruce financiero;
- lote;
- pago confirmado.

## 7. Estado seguro
Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; merge=false; producción=false.
