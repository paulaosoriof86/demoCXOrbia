# CXOrbia I3 — UAT administrativa transversal read-only C8D2 · 2026-10-29

Estado: `UAT_ADMIN_READ_ONLY_PARTIAL / I3 HOLD / Gate20 HOLD / Gate21 HOLD / I4 NO AUTORIZADO`.

## Distinción de artefactos (obligatoria)

- La UAT de esta acta se ejecutó **autenticada como Administración** en Chrome local sobre la **Preview anterior C8D2**, `cxorbia-backend-dev--i3-parity-c8d2-40882198130-slaijyo2.web.app`, cuya fuente de Hosting es `c8d2a790df29208c07eafea49d1d62d2d93b09e6`.
- La **nueva** candidata exacta `c2f8a00b3acb4b069ff254b266beb6008cfb0b3b` está publicada y sus bytes se probaron en `cxorbia-backend-dev--i3-recovery-1029-40895297870-30o7o5xu.web.app`, run `40895297870` PASS. Al abrirla, la sesión de C8D2 **no se trasladó automáticamente al otro subdominio**; nueva Preview muestra login. Esta acta **no** es UAT E2E de esa fuente nueva.
- No hubo logout, pagos, guardado de cuestionarios, altas, fusiones, escrituras en HR, datos, Auth, Firebase, Cloud Run, Hosting LIVE ni producción. Recorrido por navegación y lecturas en pantalla únicamente.
- HR de la sesión C8D2 publicada en pantalla: revisión corta `6fd4beb82cc8`, proyecto Cinépolis, período OCT 2026, GT/HN. La fuente reportada en actas previas era distinta: no trasladar conteos a otra revisión sin readback.

## Resultados por módulo visible (mismo actor/periodo)

| Frente / módulo | Observación directa | Clasificación / owner siguiente |
|---|---|---|
| Mi Día | 5 agendadas, 0 para aprobar, 36 realizadas y 3 sin asignar. | `RENDER_OBSERVED`; validar tareas accionables con shopper separado. |
| Dashboard Operativo | 44 visitas: GT34/HN10; asignadas41, sin asignar3, realizadas36, pendientes realizar8, cuestionario pendiente1, sin submitir8, fuera de rango2. | `RENDER_OBSERVED`; conciliar exactamente con HR publicada y filtros. |
| Visitas | 44; **2 disponibles**, 41 asignadas, 36 realizadas, 3 sin asignar, 2 fuera de rango. | El defecto previo “cero disponibles” **no reproduce** en Admin C8D2. 2 elegibles frente a 3 sin asignar requieren causal de exclusión (no inferir). |
| Postulaciones | 0 solicitudes por revisar, 41 asignaciones actuales, 0 reprogramaciones/cancelaciones, 5 agendamientos. | `RENDER_OBSERVED`; el arreglo anterior de `escapeAssignment` debe acreditarse en la misma nueva Preview y flujo GT/HN. |
| Reservas & Asignación | 0 solicitudes / 0 cruzadas en el subsistema de reservas. | `NO_SOURCE_FOR_RESERVATION`; no equivale a que las 41 asignaciones HR sean cero. |
| Shoppers | 204, activos recientes95, inactivos109; perfiles completos1/incompletos203. Banner global avisa 270 identidades pendientes, panel de Shoppers muestra 355 en “Requieren revisión / decisión”. | `COUNT_DEFINITION_RECONCILIATION`: investigar fuentes/universos diferentes antes de tratar cifras como contradicción; conservar cohorte de 83 grupos y fusiones ACK, sin merge fuzzy. |
| Clientes / Proyectos | 4 fichas de clientes visibles; una ficha TyA enlaza Cinépolis/748 visitas, otras fichas Cinépolis/demo muestran cero; proyecto Cinépolis único con 17 períodos y 748 visitas, 44 sucursales. | `CLIENT_PROJECT_SCOPE_REVIEW`: comprobar pertenencia de registros y posibles demos antes de depurar; no borrar/fusionar. |
| Períodos | 17 detectados de JUN 2025 a OCT 2026; **17 Activos, 0 Cerrados, 0 Archivados**, también en rondas antiguas. | `P0 PERIOD_LIFECYCLE_AUTHORITY_DRIFT`: determinar estados realmente persistidos por Firestore y correspondencia de IDs, sin cerrar períodos por su antigüedad. |
| Histórico | Predeterminado “cerrados/archivados”: **0 períodos / 0 visitas** porque el módulo filtra `periodState` y los 17 se muestran activos. | `P0 UPSTREAM_BLOCKER`: arreglo de país `236b5f6` de la nueva Preview no resuelve el upstream de estados. C8D2 no acredita ese arreglo. |
| Hojas de Ruta | 44 filas OCT 2026 visibles, fuente revisada `6fd4beb82cc8` y aviso “Fuente externa pendiente de vínculo seguro”; los detalles GT/HN, fecha y shopper están representados. | `HR_ROWS_RENDER_PASS`; distinguir fuente HR operativa de metadata del vínculo externo. |
| Fuente de HR | Pantalla “Conectado”, pero última lectura/vista previa `—` y sin vista previa; otras vistas sí proyectan HR con revisión. | `SOURCE_CONTROL_PLANE_PRESENTATION_DRIFT`: metadatos/vista previa del módulo no acreditan por sí solos una pérdida de las 748 visitas. |
| Cuestionarios | Programa General visible con secciones ponderadas 100%, preguntas editables, control “Guardar programa”. | `READ_ONLY_RENDER`; no ejecutar guardado sin caso de prueba autorizado y readback. |
| Reportes & KPIs | Dashboard y comparación entre meses renderizan; períodos anteriores mostraron métricas `—`/“sin fuente” en comparativo. | `UPSTREAM_PERIOD_HISTORY_CHECK`; fuente de verdad vs estados. |
| Academia | 14 cursos, 67 lecciones, 0 completados/certificaciones para audiencia “Consultora”; módulos y categorías disponibles. | `RENDER_OBSERVED`; no implica completitud/función shopper. |
| Certificación | 2 bancos, 5 evidencias históricas, 3 shoppers vinculados, 4 aprobaciones históricas; un banco IA pendiente de revisión, preguntas visibles. | `PARTIAL_SOURCE_CARRYOVER`; recertificación/eligibilidad completa aún NO certificada. |
| Recursos del proyecto | “Instructivo Shopper Cinépolis”; al abrirlo con sesión Administración muestra `RESOURCE_READ_GET_FAILED`, etapa `GET`, token `SI`, HTTP `NO_RESPONSE`, bytes `NO`, tipo `TypeError`; descarga deshabilitada. | `P0 D07 GET_AUTH_FAIL` reproducido. OPTIONS histórico 200 no constituye GET PASS. No alterar Storage Rules/credenciales sin causa exacta. |
| Dashboard Financiero | GT: honorarios Q1,560 + reembolsos Q4,025 = Q5,585; HN: L2,000 + L3,632 = L5,632; 36 revisiones financieras. | `READ_MODEL_COUNTRY_TOTALS_OBSERVED`; no equivale a pagos ni conciliación. |
| Movimientos & Tesorería | GT/HN Q/L separadas; transacciones/CxP/CxC en cero; 36 liquidaciones en revisión **excluidas** de CxP pagable. | `SOURCE_NOT_READY_FOR_PAYMENT`, no automatizar pago por número de visitas. |
| Liquidaciones | 36 en revisión financiera, 0 listas/conciliadas/abonadas; faltan soportes/ACK bancario para cierre. | `FINANCE_EXTERNAL_SOURCE_HOLD`; conservar 2 conceptos honorarios/reembolso. |
| Lotes de Pago | Indica “pendiente de fuente”; no lotes reales pagados. | `CORRECT_HOLD_IF_NO_PROVIDER_ACK`; no crear egresos ficticios. |
| Costos & Propuestas | Calculadora responde con valores precargados (p. ej. honorario Q8), ajenos a la tarifa operativa aprobada para visitas GT Q60. | `DEMO_DEFAULT_NOT_PRICING_AUTHORITY`; no presentar cálculo como cotización aprobada. |
| CRM Comercial | Vista de pipeline renderiza sin oportunidades ni actividades; meta precargada Q100k. | `NO_EVIDENCE_OF_LIVE_CRM_SOURCE`; no inferir que hay pipeline comercial real ni vaciar. |
| Marketing & Contenidos | Calendario visible en **junio de 2026** mientras sesión de proyecto está en OCT 2026; cero contenidos cargados. | `DEFAULT_DATE_SCOPE_DRIFT` secundario; no prueba fuente comercial. |
| Usuarios & Permisos | Estado “Administración conectada”; edición durable requiere Super Admin, sin formularios de guardado en este rol. | `PERMISSION_GUARD_OBSERVED`; no calificar como módulo roto. |
| Configuración | “Conectado”, “sincronización activa: sí”, una advertencia, accesos marca/planes/países/permisos. | `READ_ONLY_RENDER`; permisos/escritura aún sin UAT super. |

## Recuperación histórica que explica el ciclo de reprocesos

1. `app/core/tya-phase-a-period-history-integrity.js` ya implementó un **adaptador source-safe** que derivaba `operationState` (13 cerrados / 1 activo en su cohorte de 14) y sustituía `data.periodState` para la vista histórica **en esa ruta preview**. **Esto sí se había trabajado**; el código original no debe reconstruirse desde cero ni confundirse con el estado autorizado actual de Firestore.
2. El consumidor canónico actual `app/core/data.js` lee `__protectedPeriods` y en `_periodMeta()` usa `p.state || 'activo'`; `periodState(id)` retorna ese mapa o `activo` por defecto. El bridge autenticado `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` compone **17 períodos HR** por un lado y estados protegidos `protectedState.periods` por otro. Si un ID no coincide, falta un registro, o `state` viene vacío, **se mostrará “activo” sin prueba de cierre**. La combinación exacta de esas condiciones en Firestore está aún **no leída**, no debe afirmarse cuál es la causa final ni ejecutar cierres automáticos.
3. El readback previo de Firestore documentó 14 registros de períodos. El HR vivo ahora indica 17; es obligatoria reconciliación de los 3 más recientes y de los 14 anteriores por ID, `state` y revisión. La solución source-safe demuestra el diseño anterior, **pero no autoriza copiar 13 cierres derivados al proveedor protegido**.
4. El defecto PDF D07 tiene traza reproducida ya en el expediente del 29-oct (A2BE GET `TypeError`). Repetir OPTIONS o “Abrir” no es un plan de reparación: aislar cadena URL GET → host → credenciales admitidas → CORS/redirect → función → Storage con herramientas de red autorizadas, sin secretos ni reglas amplias.
5. No transformar la falta de metadata de “Fuente HR” o la falta de pago externo en 16 “bugs nuevos”. Cada frente tiene owner y evidencia histórica que debe preservarse. El nuevo bloqueo P0 no invalida automáticamente los 5 MATCH certificados de la matriz.

## Salida operativa sin nueva auditoría general

- **P0 paralelo**: (A) `canonical-hr-state-adapters`/Períodos/Histórico: leer estados protegidos exactos y reconciliar IDs de 17 períodos; (B) `documents-resources`: D07 GET autenticado; (C) `certifications`: elegibilidad, recertificación; (D) `finance-core-liquidation-costs`: proveedor financiero/soportes; (E) shoppers/postulaciones: multi-caso GT/HN, filtros de disponibilidad y 83 grupos ACK/human review.
- **P1 de transporte**: login Administración en **la nueva Preview** con bytes c2f8 y ejecutar el mismo smoke con revisión HR única; luego shopper en sesión separada y Cliente con scope. La sesión C8D2 no demuestra que la nueva app esté autenticada.
- **Gates**: conservar matriz V193 5 MATCH / 11 fuente / 2 compuestos / 3 defectos, hasta PASS en **la misma fuente servida** y aceptación humana. I3, Gate20 y Gate21 continúan HOLD; I4 LIVE no autorizado.
