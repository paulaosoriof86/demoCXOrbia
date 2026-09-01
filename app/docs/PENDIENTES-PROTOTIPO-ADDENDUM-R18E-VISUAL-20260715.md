# PENDIENTES PROTOTIPO — ADDENDUM R18E VALIDACIÓN VISUAL

Fecha: 2026-07-15

## Estado

- R18D y Hosting DEV: PASS.
- No queda P0 técnico abierto del hotfix de Finanzas.
- No se requiere nueva candidata ni paquete Claude antes de la revisión visual.

## Validación visual pendiente

1. Login/tenant: confirmar que no exista doble título y que el nombre del tenant se muestre una sola vez.
2. Banderas: confirmar que dependan del país configurado y no de valores fijos del proyecto.
3. Proyecto/periodo: verificar un único estado coherente entre topbar, sidebar, dashboard y módulos.
4. Histórico: confirmar que los 14 periodos sean navegables sin mezclar operación activa.
5. Shoppers source-safe: no presentar 216 referencias protegidas automáticamente como 216 activos o perfiles completos.
6. Finanzas source-safe: no presentar ingresos, márgenes, tendencias o análisis como confirmados cuando la fuente no los contiene.
7. Certificación: mantener HOLD/pendiente de fuente sin solicitar nuevamente ni inventar resultados.
8. Pagos: 196 controles exactos y 92 revisiones no equivalen a pagos confirmados.

## Clasificación

- Los puntos 1–6 son `Claude/prototipo` solamente si Paula confirma visualmente la diferencia.
- Los puntos 7–8 son gates backend ya aplicados y no deben reabrirse sin evidencia funcional.
- Academia/manuales deben reflejar cualquier cambio futuro de proyecto/periodo, estados financieros o certificación.

## Regla de continuidad

La revisión visual no reinicia V131, HR, R11D, R14C, importadores, R18D ni R18E. Solo genera un paquete acumulado si existen diferencias confirmadas y suficientemente relacionadas para justificar una nueva candidata.
