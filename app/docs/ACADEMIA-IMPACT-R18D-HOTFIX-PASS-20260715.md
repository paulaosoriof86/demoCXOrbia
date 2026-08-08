# ACADEMIA — IMPACTO R18D HOTFIX PASS

Fecha: 2026-07-15

## Clasificación

`Academia`: impacto documental, sin cambio de módulo, curso, ruta, notificación o certificación.

## Qué cambió

- Se corrigió el contrato local usado por el motor financiero para que exponga proyecto, periodo y visitas sin mezclar identidades.
- El cambio permite renderizar Finanzas en el preview source-safe.
- No cambia reglas de liquidación, pago, certificación, agendamiento ni ejecución de visitas.

## Qué debe seguir explicando Academia

- Proyecto y periodo son contextos relacionados pero distintos.
- Liquidación no equivale a pago.
- Control financiero exacto no equivale a pago confirmado.
- Un lote preview no equivale a lote pagado.
- Certificación en HOLD no debe solicitarse nuevamente ni presentarse como aprobada.
- Los datos source-safe pueden ocultar atributos operativos o personales y no deben completarse por inferencia.

## Estado

- No se modifica `app/modules/academia.js`.
- No se requiere paquete Claude adicional por este hotfix.
- Los ajustes visuales source-safe de Shoppers/Finanzas quedan en `PENDIENTES-PROTOTIPO.md` como P1 acumulado.
- Sin deploy, producción, import, writes, Make/Gemini live ni pagos.
