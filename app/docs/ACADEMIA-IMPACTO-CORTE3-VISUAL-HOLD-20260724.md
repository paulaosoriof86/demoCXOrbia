# ACADEMIA — Impacto Corte 3 Visual HOLD

**Fecha:** 2026-07-24  
**Estado:** `PENDING_AFTER_VISUAL_CORRECTION`

## Contenido que debe actualizarse

- diferencia entre honorario devengado, liquidado, por pagar y pagado;
- prohibición de sumar monedas sin conversión y lectura por país;
- cómo cambiar proyecto y periodo desde una sola fuente de contexto;
- cómo identificar y resolver filas `pendiente_fuente_financiera`;
- cómo leer `visitId`, `hrRowId`, shopper, país y motivo de revisión;
- cómo validar PDF y Excel contra la UI;
- qué significa conciliación de reembolsos y qué fuente la confirma;
- diferencia entre análisis local por reglas e IA/Gemini realmente conectada;
- ruta Admin y ruta Shopper para revisar beneficios;
- checklist móvil: tablas, scroll, monedas, estados y exportación.

## Regla de publicación

No publicar ni actualizar cursos como cerrados hasta que la corrección visual y funcional sea aprobada en Hosting DEV. Todo contenido generado o sugerido por IA requiere revisión humana.
# ADDENDUM ACADEMIA - CORTE 3 FOCAL FIX 2026-07-28

Conceptos a ensenar en Academia:

- Fuente financiera exacta: la liquidacion ya tiene pais/moneda y conciliacion de monto suficiente para metricas, CxP y export.
- Revision financiera: falta fuente, pais, moneda o existe estado explicito `pending_or_review` / `pending_financial_source`; se muestra, pero no se paga, no entra a lote y no contamina CxP monetaria.
- Pago pendiente: `paymentState=pending_source_confirmation` no invalida la fuente exacta. Una liquidacion puede estar conciliada y seguir sin pago confirmado.
- Cambio automatico de periodo: el adapter activa el mes calendario actual si existe; evita saltar a periodos futuros precreados y conserva el ultimo no futuro cuando el mes actual aun no existe.

Clasificacion:

- Reusable CXOrbia: separacion fuente exacta / revision / pago pendiente, predicado financiero unico, rollover current-month-safe.
- Exclusivo TyA: nombres mensuales HR Cinepolis y monedas GT/HN.
- Claude/prototipo: KPI Liquidaciones, export, copy y preservacion de fixes focales.
