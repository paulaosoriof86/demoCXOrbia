# ACADEMIA — Impacto Corte 3 Hosting DEV R25

**Fecha:** 2026-07-24  
**Estado:** `BACKLOG_ACADEMIA_DOCUMENTED`

## Conceptos que deben incorporarse

1. **Inventario HR**  
   Una visita operacional existe aunque todavía no tenga vínculo financiero exacto.

2. **Fila financiera exacta**  
   Requiere identidad estable y conciliación aceptada. En mayo: 42.

3. **Fila pendiente de conciliación**  
   Permanece visible para revisión, pero no es canónica ni pagada. En mayo: 2.

4. **Fail-closed**  
   Una fila en revisión conserva `paymentState=pending_source_confirmation`, `paymentConfirmed=false` y no entra a lote.

5. **Liquidación vs pago**  
   Visita realizada, cuestionario, submitido y conciliación no equivalen a pago.

6. **Snapshot congelado vs runtime live**  
   Un gate de snapshot puede ver solo filas exactas; el runtime live puede mostrar además revisiones operativas honestas. Los criterios deben distinguir ambos contextos.

7. **Hosting DEV y producción**  
   Publicar y probar en DEV no significa producción, merge ni activación de pagos.

## Caso práctico recomendado

Mayo 2026:

- 44 visitas HR;
- 42 vínculos financieros exactos;
- 2 revisiones fail-closed;
- 32 exactas GT;
- 10 exactas HN;
- 0 pagadas;
- 0 lotes;
- 0 diferencias de monto.

El ejercicio debe pedir al usuario identificar qué puede mostrarse, qué requiere revisión y qué nunca puede inferirse como pagado.

## Rutas por rol

- **Admin/Operativo:** conciliación, revisión, exportación y controles de pago.
- **Shopper:** Beneficios, liquidaciones visibles y diferencia entre por cobrar/pagado.
- **Cliente:** lectura agregada sin datos sensibles ni controles de pago.

## Manuales y checklists

- checklist antes de confirmar pago;
- checklist de contraste UI/PDF/Excel;
- guía de revisión de vínculo y monto;
- guía de Hosting DEV vs producción;
- glosario: exacto, pendiente, revisión, liquidación, lote, pago confirmado.

## Evidencia de referencia

- Deploy Hosting DEV: run `30098823043`.
- Smoke remoto R25: run `30099476156`.
- Artifact R25: `8598990578`.
- Digest: `sha256:09c69c975a0933368b346d27218386b28421616adc039f3a37caf16ca8bbba12`.

## Estado seguro

Academia queda documentada como backlog; no se publicaron cursos ni notificaciones reales.
