# CXOrbia Recovery I3 — Entrega visual exacta DEV RUN1606 — 14-10-2026

**Estado:** HOLD. **No implica Gate20 ni aceptación humana.** El DEV está disponible para revisar lo demostrado, mientras Finanzas B8 y velocidad VRM-134 permanecen abiertos. Producción `https://tya-plataforma.web.app/`: DO_NOT_TOUCH.

## Identidad de la candidata servida
- URL exacta: https://cxorbia-backend-dev.web.app/
- Repo/rama: `paulaosoriof86/demoCXOrbia` / `recovery/cxorbia-phase-a-20260831`
- Product source: `4d4624940ce09c86ec04a3ee59e44ffd40bde612`
- Product tree: `a821c66a92957eae5c62e331420d7f736eb6aab7`
- Materialización: RUN1605 / 38630731956, PASS; runtime `cxorbia-live-hr-dev-00294-ftx`, digest `sha256:e91c6593c5e1e90e8810f911b0c7074fe86d9ffc26410fb7bd978486ff88106a`, Hosting `sites/cxorbia-backend-dev/versions/0b20ba1c5df7295f`, ruleset `projects/cxorbia-backend-dev/rulesets/e9070ca6-234c-4a16-acf2-5ab3372eadb3`.
- E2E sobre ese mismo artefacto: RUN1606 / 38631543465, SUCCESS con pruebas de navegación y acciones existentes. HR revision comprobada `2e3b2aaff2b1ac7a9323c9a69a16d2ad97beb25648c642e1464d72e36917ad70`. No implica que la interfaz esté aceptada por Paula.

## Revisión para Paula: solo cuatro recorridos, sin repetir toda la plataforma
1. **Admin → Gestión de Postulaciones → Cinépolis, octubre 2026.** Ver 7 KPI independientes, tarjetas agrupadas de asignaciones, botones por visita, motivo de cancelación humanizado y solicitud de reprogramación con fecha vencida: no autorizar, sí pedir otra fecha/conservar anterior. No crear ni decidir solicitudes reales solo para revisar. Fuente RUN1606 HR: visitas=44; asignaciones=41; agenda activa=18; reprogramaciones pendientes=1; cancelaciones pendientes=0; postulaciones pendientes/aprobadas/todas=0. Estos conteos son de esa revisión exacta, no fixtures globales ni promesa de dato actual si HR cambia.
2. **Admin → Dashboard Operativo y Asignaciones.** Acciones por fila, selección individual y múltiple, tablas legibles, siete métricas, modales directos, botón WhatsApp como borrador manual autorizado: no significa envío. Revisar contraste, claridad, iconos y estados; no ejecutar acciones con HR real.
3. **Shopper visibleLogin `paula.osorio` → Mi Día, Campana, Tablón.** Evento operacional exacto de RUN1600: una notificación esperada y un registro en cada vista; sin duplicados ni etiquetas técnicas. No marcar leído para preservar su observación. El E2E de este evento fue PASS en RUN1600; no certificar todo el ciclo de notificaciones por ese único ejemplo.
4. **Shopper → Mis Visitas → Activas.** Título de tarjeta 16 px, tarjetas menos altas, progreso compacto y acciones conservadas. Verificar coherencia visual, acciones, contraste, historial y que Mi Día no haya sido rediseñado por esa corrección.

**Observaciones aún no demostradas como cerradas:** tipografía/contraste general, toda la clase de mensajes técnicos, diseño de Reservas, algunos flujos Shopper y B8 Finanzas. Mantener decisiones humanas anteriores en ledger, no reemplazarlas por PASS sintético.

## Resultado VRM-134 RUN1600 frente a RUN1606 (ms)
| Rol | Antes | Después | Diferencia |
|---|---:|---:|---:|
| Julissa | 6857 | 7011 | +154 |
| Priscila | 7884 | 6833 | -1051 |
| Paula | 7098 | 6912 | -186 |
| Admin | 8495 | 9856 | +1361 |

RUN1606 HR fetch shopper Julissa 5636ms, Priscila 5453ms, Paula 5531ms. El resultado es mixto, **NO PASS de rendimiento**. VRM-134 sigue OPEN/P0, no reducir protección, no servir HR obsoleta como vigente. Pruebas de latencia en foco, regreso a pestaña, cambio de período, escritura con ACK y refresh transversal todavía faltan.

## B8 Finanzas — progreso comprobado sin aprobación humana general
- El producto servido incorpora HF21–HF28: jerarquía de dashboard, cinco estados de conciliación/pago, mensajes remotos sanitizados, readback de movimientos/cuentas, CxP/CxC, presupuesto durable, elegibilidad de pago individual/lote y configuración persistente.
- RUN1606 PASS de `PASS_PREI4_FINAL_FOCAL_FINANCE`: ingreso operativo provider ACK, no ingreso duplicado por CxC, financiamiento vinculado a CxP, abono CxP, idempotencia, proyección durable y cleanup, con cero writes a HR y sin pagos bancarios.
- **Aún no probado integralmente:** HF22 seis códigos exactos remotos; HF24/HF28 dos sesiones autenticadas e inspección independiente completa; pago individual vs lote con soporte Storage y readback Shopper; conciliación bancaria real; aceptación visual. No solicitar pagos/transferencias ni usar datos reales para una prueba humana.
- Próximo frente técnico: **B8 HF22 → HF24/HF28**, owner probado y fixture seguro; análisis y source QA read-only antes de cualquier nueva mutación. Después emitir entrega visual propia de Finanzas cuando alcance el gate.

## Regla de aceptación
Separar expresamente: SOURCE_FIXED ≠ DEV_MATERIALIZED ≠ LIVE_E2E_PASS ≠ HUMAN_PASS ≠ Gate20 ≠ Gate21. Las 274 entradas del ledger, 21 dominios y evidencias humanas previas se preservan. Nada de reabrir PASS sin drift reproducible; I4 solo por artefacto inmutable certificado y autorización explícita.
