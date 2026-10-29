# CXOrbia I3 — UAT Admin autenticada sobre candidata servida c2f8 · 2026-10-29

**Estado:** `PASS_PARTIAL_AUTHENTICATED_CROSSFRONT_READONLY / P0_HOLDS_REPRODUCED / I3 HOLD / G20 HOLD / G21 HOLD / I4 NO AUTH`.

## Identidad exacta e integridad

- Proyecto Firebase DEV `cxorbia-backend-dev`, tenant `tya`, Cinépolis, octubre 2026, Guatemala y Honduras.
- Fuente producto/backend `c2f8a00b3acb4b069ff254b266beb6008cfb0b3b`, tree `dedb1766036748f336dd3c7c90814ddc25066a0c`.
- Preview única de este corte: `https://cxorbia-backend-dev--i3-recovery-1029-40895297870-30o7o5xu.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV`.
- GitHub Actions `40895297870` job `123522636994`: deploy aislado y 5/5 bytes servidos PASS; Hosting LIVE, Cloud Run listo/tráfico, ruleset y producción permanecieron idénticos. Se conservan source, artifact digest y receipt `CXORBIA_I3_CROSSFRONT_1029_HOSTING_PREVIEW_READBACK_2026-10-29.md`.
- En el primer acceso al nuevo subdominio se observó pantalla de login; **posteriormente** la misma pestaña mostró sesión `Administración` ya disponible. Se ejecutó esta UAT **en la nueva candidata exacta**, sin pedir credenciales, cerrar sesión ni operar LIVE. Revisión HR publicada en Hojas de Ruta: `6fd4beb82cc8` (prefijo visible).
- Las pruebas fueron navegación, cambio de filtros y lectura de UI, sin guardar, fusionar, pagar, importar ni escribir datos.

## Resultados focales exactos de la nueva candidata

| Control | Readback autenticado | Estado |
|---|---|---|
| Mi Día | 5 agendadas, 0 por aprobar, 36 realizadas, 3 sin asignar. | `READ_UI_PASS` |
| Períodos | 17 de JUN2025–OCT2026; **17 activos, 0 cerrados, 0 archivados**. JUN2025 (44/44) aún aparece Activo; diálogo “Gestionar” ofrece “Cerrar período” pero **no se pulsó**. | `P0 PERIOD_STATE_DRIFT`, no corregido |
| Histórico, filtro predeterminado | “Cerrados/archivados” da **0 períodos / 0 visitas** por el problema de estado anterior. | `P0 BLOCKED_UPSTREAM` |
| Histórico, **todos los estados** | 17 períodos, 748 visitas, 738 ejecutadas. | `PASS_READ_MODEL` para universo cargado |
| Histórico país **GT**, todos los estados | **578** visitas, **570** ejecutadas. | `PASS_COUNTRY_COUNTS_C2F8` |
| Histórico país **HN**, todos los estados | **170** visitas, **168** ejecutadas. | `PASS_COUNTRY_COUNTS_C2F8` |
| Invariante país | GT578 + HN170 = **748**; ejecutadas GT570 + HN168 = **738**. Al regresar a `Todos` se restauran exactamente los totales. | **`PASS`** del fix `236b5f6` servido, limitado a filtros en UI |
| Visitas OCT2026 | 44 visitas, disponibles **2**, asignadas41, realizadas36, sin asignar3, fuera de rango2; honorario unitario GT Q60 visible en filas. | `PASS_READ_UI`; causal de la tercera sin asignar pendiente |
| Hojas de Ruta | 44 filas OCT2026, revisión HR `6fd4beb82cc8`, datos GT/HN de sucursal, visita y shopper. | `PASS_PUBLISHED_HR_READ`; sin nueva lectura al abrir |
| Fuente de HR | Estado “Conectado” pero “Última lectura —” y “Última vista previa —”; importación bloqueada. | `P1 SOURCE_METADATA_DRIFT`, no es prueba de HR vacía |
| Postulaciones | 41 asignaciones vigentes, 0 solicitudes por revisar, 5 agendamientos; filtro HN renderizó sucursales y fichas HN, filtro GT renderizó fichas GT; **sin el ReferenceError anterior**. | `PASS_READ_UI_COUNTRY_RENDER`; flujo de escrituras/Shopper sin UAT |
| Shoppers | 204 en proyecto, 95 activos en 6 meses, 109 inactivos, perfil completo1/incompletos203. Banner 270 revisiones, panel 355 “requieren revisión/decisión”. | `P1 REVIEW_UNIVERSE_RECONCILIATION`; no equivale a fusiones 270/355 |
| Certificación | 2 bancos, 5 evidencias históricas, 3 shoppers vinculados, 4 aprobaciones legacy, banco `main` publicado 8 preguntas, mínimo 80%. | `PASS_CARRYOVER_READ`, validación individual Shopper/recert aún `HOLD` |
| Recursos/PDF D07 | “Instructivo Shopper Cinépolis” → Abrir → tras “Preparando…” aparece `RESOURCE_READ_GET_FAILED | etapa GET | token SI | HTTP NO_RESPONSE | bytes NO | tipo TypeError`, descarga deshabilitada. | **`P0 FAIL_REPRODUCED_ON_C2F8`**; ningún PDF descargado |
| Finanzas | Dashboard GT Q1,560 honorarios + Q4,025 reembolsos = Q5,585; HN L2,000 + L3,632 = L5,632; sin pagos bancarios confirmados. | `PASS_SEPARATE_CURRENCIES_READ`; fuente externa de pago `HOLD` |
| Liquidaciones | 36 pendientes de cruce financiero, 0 conciliadas/listas/lotes/pagadas; sumas por país coherentes. | `PASS_HONEST_PENDING_STATUS`, **no** final de finanzas |
| Clientes | 4 fichas, 1 activa con Cinépolis/748 visitas; otras 0 y una ficha con codificación “CinÃ©polis”. | `P1 CLIENT_SCOPE_AND_TEXT_REVIEW`; no depurar sin autoridad |

El UAT extendido de C8D2 anterior, `CXORBIA_I3_C8D2_AUTHENTICATED_CROSSFRONT_UAT_2026-10-29.md`, también cubre Dashboard, Reservas, Cuestionarios, Academia, Movimientos, Lotes, Comercial, Usuarios y Configuración. **Esas observaciones pertenecen a una fuente previa** y no se suman a PASS nuevo; esta acta confirma solo filas ejecutadas arriba sobre `c2f8`.

## Causa del ciclo y recuperación exacta de owner

1. **Períodos/Histórico**: solución anterior real `app/core/tya-phase-a-period-history-integrity.js` preserva una separación de 13 cerrados/1 activo derivada de un HR source-safe de 14 períodos y sobreescribe `data.periodState` en esa ruta. La ruta canónica de 17 períodos usa `app/core/data.js` (`_periodMeta()`, `periodState`) y `__protectedPeriods` servidos por `tya-protected-auth-hr-authority-bridge-v2.js`. Ante estado sin registro/ID distinto/state vacío, el consumidor cae a `activo`; no se probó todavía el contenido exacto de Firestore actual. **No copiar estados derivados ni cerrar 16 períodos automáticamente.** Readback de provider con IDs/estados/versiones 17/17 es el próximo owner `canonical-hr-state-adapters`.
2. **PDF**: `app/core/backend-resources.js` invoca `fetch(https://firebasestorage.googleapis.com/v0/b/.../o/...?alt=media, Authorization: Firebase <ID token>)`; el error observable no trae status HTTP ni bytes. La documentación Firebase explica que la descarga directa del navegador requiere CORS en el bucket y que el SDK Web v9.5+ ofrece `getBlob`/`getBytes`, pero **no hay prueba aún de que la configuración CORS sea la causa específica**. Revisar read-only respuesta GET/CORS, bucket y roles efectivos antes de editar política; nunca recurrir a URL pública de descarga o reglas abiertas. Owner `documents-resources`/D07.
3. **HR y Disponibles**: la HR está cargada (17 períodos/748 visitas y 44 en OCT); el área de Fuente HR muestra metadata de control incompleta. El contador “2 disponibles” no reproduce el cero reportado antes, pero necesita explicar la exclusión de una de las tres sin asignar. Owner `canonical-hr-state-adapters` + `visits-review-postulations-reservations`.
4. **Shoppers**: conservar 139 pares explícitos / 83 grupos aprobados y fusiones con ACK; identidad exacta y teléfono no bloqueante, contacto a revisar en primer ingreso. El banner de 270 y panel de 355 pueden representar universos distintos; leer definiciones antes de declarar error o fusionar. Shopper GT/HN, perfil y recertificación siguen por probar en sesión aislada.
5. **Finanzas/Certificación**: cantidades cargadas y carriles de datos existentes no acreditan banco, liquidaciones pagables ni certificación individual; se respeta `HOLD` sin materializar cobros o pagos falsos.

## Gate y acción restante

- Subir esta evidencia al **mismo expediente, rama y plan de 82 tareas**, sin reiniciar I0/I1/I2 ni cambiar artificialmente matriz V193 (5 MATCH / 11 fuente / 2 compuestos / 3 defectos).
- Ejecutar diagnóstico autoritativo read-only del estado de los 17 períodos y del GET Storage; preparar solo parches P0 focales y test E2E con nueva fuente, no un rediseño Fase A.
- Completar UAT de Shopper y Cliente en sesiones realmente aisladas, valores GT/HN/beneficios/visitas/certificación/primer ingreso, y escaneo de 21 contratos sobre el **mismo artefacto**.
- **I3/Gate20/Gate21 siguen HOLD. I4 y producción no autorizadas.** No usar PASS parcial como aprobación LIVE.
