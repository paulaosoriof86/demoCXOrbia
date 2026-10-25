# RESUMEN PARA CLAUDE — R19 VISUAL NO-GO

Fecha: 2026-07-15

## Baseline obligatoria

V131 + hotfix R18D reconciliado.

No volver a V110, no crear baseline paralela y no sustituir el árbol activo sin comparación.

## Paquete

`PAQUETE-EXCLUSIVO-CLAUDE-R19-CIERRE-OPERATIVO-VISUAL-20260715.zip`

Incluye reglas confirmadas, cinco bloques P0, matriz de aceptación, protocolo de empalme y 15 evidencias visuales.

## P0 requeridos

1. Estados ortogonales, KPIs, detalle y periodo activo.
2. Proyecto configurable: frecuencia, periodo de medición, HR, cuestionario, tenant, países y monedas.
3. Shopper/cliente con proyecto distinto de periodo y selector multiproyecto.
4. Finanzas: Dashboard solo análisis; creación en Movimientos/Configuración; no series o narrativa sin fuente.
5. PWA: prompt nativo en Chromium/Edge/Android; guía únicamente cuando el navegador no ofrece prompt programático.

## Reglas confirmadas

- Pend. realizar incluye toda visita no realizada del periodo activo aunque esté sin asignar o sin agendar.
- Activo shopper = cuenta activa y al menos una visita realizada en los seis meses previos a la referencia del periodo.
- Visitas Disponibles = postulables: sin shopper, no realizadas y del periodo activo.
- País agregado habilita bandera, moneda, filtros, alcance, shoppers y HR.
- Cinépolis: mensual con medición quincenal; la HR asigna la quincena de cada visita.

## No tocar

- backend;
- tools/workflows;
- R11D/R14C;
- datos TyA;
- Firebase/Make/Gemini;
- pagos/certificaciones confirmados;
- hotfix protegido de Finanzas.

## Entrega

Candidata completa derivada de la baseline, listado exacto de archivos, manifest/source lock y PASS/FAIL por cada gate de aceptación.

No declarar cerrado por render o cero errores de consola. Después de la entrega habrá auditoría delta, gates semánticos, empalme, Hosting DEV, validación visual y congelación.
