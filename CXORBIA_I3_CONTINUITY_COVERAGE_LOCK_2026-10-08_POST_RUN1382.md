# CXOrbia I3 — LOCK CANÓNICO DE CONTINUIDAD, COBERTURA Y HALLAZGOS HUMANOS

**Fecha local:** 2026-10-08. **Estado:** `FROZEN_CONTROL_ONLY / I3=HOLD / I4=NO_AUTORIZADO`.
**Repositorio:** `paulaosoriof86/demoCXOrbia`. **Rama única:** `recovery/cxorbia-phase-a-20260831`.
**Product source:** `7e44f271191878b48c4aaadeaf8eb2f0a74a786c`. **Product tree:** `295b54908e98023cda3eda2008edd50acb2b8cda`.
**HEAD comprobado antes de este lock:** `d946617032dfd06177332178a72797091703ce26`. Diferenciar siempre el HEAD posterior de control del source publicado.
**Materialización DEV exacta:** run 1381, `cxorbia-live-hr-dev-00277-9dn`, Hosting `sites/cxorbia-backend-dev/versions/171460de6c0c33b5`, runtime digest `sha256:cd49569dc4cf5938a2d8fc42967d212a14476ee9b51477e5ffb0a2bc4034a90d`.
**Run 1382:** `37837306768` / mismo artefacto / **SUCCESS** (representative authenticated Shopper & Admin, provider scheduling, exhaustive click-visual inventory, Admin postulations/reservations, finance, certifications and resources).
**No significa I3 GO:** validaciones humanas, defectos funcionales concretos y gates finales siguen abiertos. No tocar `https://tya-plataforma.web.app/`.

## 0. Regla de responsabilidad y respuesta a Paula
El 08-10-2026 Paula manifestó que su revisión detectó fallos en lugares que NO estaban dentro de la ruta corta sugerida por el asistente. El asistente OMITIÓ responder suficientemente si sólo se trabajó lo pedido. La respuesta comprobable por diff es: NO, hubo cambios en 10 archivos de producto, pero el trabajo se concentró en B1/B3/B5, integración Admin de postulaciones/notificaciones y sus owners backend/HR; **NO hubo rediseño de Mi Perfil ni nueva corrección de reconciliación de pagos históricos en esos cambios**. Un PASS técnico de E2E NO los declara cerrados. En futuras conversaciones el asistente es responsable de verificar proactivamente el inventario completo Phase A y sus flujos transversales; la memoria de Paula no es el mecanismo de cobertura.

## 1. Autoridades inmutables; no perder ni sobrescribir
- Lecturas del Project: `00_START_HERE_CXORBIA_RECOVERY.md`, `ADDENDUM_PREVALENTE_RECUPERACION_CXORBIA.md`, `PLAN_RECTOR_RECUPERACION_CXORBIA.md`, `CONTRATOS_FUNCIONALES_CXORBIA_RECOVERY.md`, `CHECKPOINT_INICIAL_RECUPERACION_CXORBIA.md`, todos los addenda posteriores, especialmente lock 2026-10-06; consultar GitHub vivo.
- Ledger íntegro, append-only: `CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V333_2026-10-08.json`; SHA Git blob `ed32f5723ed78289fa0d0203d222f604495db364`; **270 VRM**, conservar IDs, estados y pruebas por hallazgo. Nunca reemplazar ledger por un subconjunto ni inferir cierre por omisión.
- Matriz modular: `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261008-V37.json`; SHA Git blob `d675a11a695194fa779d59b50cf2e6bfc9bc26d9`; **21 dominios, 13 MATCH, 8 SOURCE_FIXED_PENDING_DEV_E2E_HUMAN** al momento de la matriz. Un nuevo run PASS no cambia automáticamente la clasificación histórica; emitir readback actualizado cuando corresponda.
- `RECOVERY-I3-HUMAN-VISUAL-FAIL-OBSERVATION-MAP-20261006.json`; blob `3145e068f06eb69b5976a31fa76f7f87a7e9b6bc`; **45 observaciones** con hallazgos previos. No cerrarlas en masa.
- `CXORBIA_I3_HUMAN_VISUAL_CHECKPOINT_2026-10-08_B1_B2_B3_B5_B7_B8.json`; blob `74c5cb7931e0e28f852d731e4331468f04573947`; **18 observaciones** y referencias a **8 capturas**; los estados de ese receipt son de su fecha y deben complementarse con evidencia posterior, NUNCA borrarse.
- PASS humano de **Mi Día sólo en superficie visual** (jerarquía, fecha, tarjetas, progreso, acciones). NO equivale a PASS de carga inicial, HR, B1 completo, B3, Admin ni I3. La otra experiencia visual humana debe revisarse.
- Baseline de producción es LEGACY_ORACLE solamente; no reimportar, no usar localStorage de verdad, no hardcode global, no copiar legacy.

## 2. Qué se cambió realmente desde la source del 07-10
Source previo `8cdd461bd4b19185c007db18631a2470891a3327`; source actual `7e44f271191878b48c4aaadeaf8eb2f0a74a786c`. Diff de estos **10 archivos de producto**:
- `app/adapters/cxorbia-cxdata-command-boundary-v1.js`
- `app/adapters/tya-cumulative-read-model-v2.js`
- `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`
- `app/modules/beneficios.js`
- `app/modules/midia.js`
- `app/modules/misvisitas.js`
- `app/modules/postulaciones.js`
- `app/styles/layout.css`
- `backend/runtime/cxorbia-operational-command-provider-v1.mjs`
- `backend/runtime/hr-live-service/server.mjs`
Interpretación: B1 carga/identidad/HR, B3 UI/fechas/solicitudes/cancelación/check-in y puente Admin, B5 presentación/orden/KPIs y backend para reads protegidos. **No confundir edición de código con prueba real, ni vista/lectura de Admin con CRUD completo en Admin.** Los tests y archivos de control son adicionales. Mi Perfil `app/modules/operacion-extra.js` y liquidaciones financieras reales no fueron rediseñados ni reconciliados por este diff.

## 3. Próximo control: no reabrir lo que pasó, pero tampoco declarar un falso cierre
- Primer paso en chat nuevo: **confirmar HEAD vivo** posterior a este lock, descriptor, ledger/hash, source/tree y run 1382 readback; si hay ejecución posterior, ésta prevalece tras readback. El run 1382 fue SUCCESS pero el descriptor previo mantiene `I3=HOLD`. Adjudicar ese resultado **sin promover I3=GO automáticamente**.
- Los E2E ya PASS en run 1382 incluyen representante Admin/Shopper, muestras autenticadas (Paula/Julissa/Priscila), navegación/visual de rutas, programación proveedor, postulación/reserva Admin, finanzas/certificación/recursos. No demuestran por sí solos camera nativa móvil, envío bidireccional efectivo de una reprogramación del usuario de muestra, cada pago histórico, edición perfil aprobada ni el 100% de las 45+18 observaciones humanas.
- Rendimiento última prueba: Julissa 6297ms, Priscila 5647ms, Paula 5900ms, Admin 7060ms hasta autoridad; prefetch HR 5205/4519/4727ms. Medir cold/warm, primera pantalla útil, Auth/HR/Firestore y p50/p95 con los mismos scopes. Objetivo: eliminar espera molesta >10s sin mostrar slice incompleto ni datos de otro usuario.
- Si aparece FAIL, **owner exacto** y taxonomía cerrada; un solo source successor y un solo workflow/artifact DEV, no otra candidata/overlay/carril. En I3 únicamente P0_PROVEN. No exigir prueba manual rutinaria a Paula.

## 4. Matriz de REVISIÓN COMPLETA Phase A por rol (no depender de memoria humana)
Usar para cada fila: [baseline aprobada, source/latest blob, DEV artifact, rol, tenant/proyecto/período, HR revision, esperado vs observado, screenshot/DOM, comando provider ACK y recarga cuando aplica, estado OPEN/PASS con evidencia]. No reemplazar Gate20/21 por clicks sintéticos. Cubrir por defecto GT/HN y varios periodos/proyectos configurables cuando el contrato exija ambos.
1. **Transversal:** login/identidad exacta/roles, tenant logo, sidebar, proyecto y período independientes, navegación, pantallas 1440/390/320, sin labels técnicos, contraste/tipografía/scroll/modales, alertas, campanita y notificaciones, tiempos de inicio.
2. **B1 Shopper Mi Día:** conservar PASS visual; identidad correcta, próxima visita, fecha fuente HR vs Firestore 'pendiente HR' cuando corresponda, elegibilidad y estado, instructivo, cert, agenda/reagenda, progreso correcto, redirección a Mis Visitas, estados de solicitudes pendientes, no duplicados y performance.
3. **B2 Shopper Mi Perfil + Admin Shoppers:** **REDISEÑO HUMANO PENDIENTE**, resumen primero y detalle contextual después; editar nombre/apellido con alias HR durable, identidad/contacto/país/acceso/banco, control permisos privados, KPIs TODOS con drill exacto, histórico integral por persona/periodo, perfil y fusión sólo por Admin autorizado, no fuzzy merge, identidad Julissa y país visibles. No declarar PASS por que existan botones.
4. **B3 Shopper Mis Visitas:** tarjetas más compactas sin microtipografía; activas/histórico/postulaciones; fechas y ventanas configuradas (día habilitado, franja, quincena, periodo, timezone); validar frontend Y proveedor; solicitud reprogramar motivo, ACK, pendiente, decisión Admin, notificación exacta e idempotencia tras reload; cancelar con confirmación+motivo+aprobación, no liberar HR sin decisión; check-in cámara/foto/GPS/timestamp/visitId/Storage ACK/readback, fecha habilitada y fallback escritorio/móvil; evidencia externa cuestionario y finalización del flujo.
5. **B4 Shopper Academia, Certificaciones, Recursos/Documentos:** preserve aprobaciones; múltiples bancos, recertificaciones y carryover sólo con evidencia de identidad exacta, generación IA/errores reales, cursos y quiz, lectura confirmada y durable, documentos project/period scoped; acciones desde Mi Día/Mis Visitas.
6. **B5 Shopper Mis Beneficios y Mis Reportes:** notas discretas/contraste (sin quitar protagonismo liquidaciones), 4 overview KPI con detalle, KPIs por moneda y exact match, histórico más reciente primero, acciones visibles por fila y comprobantes, descarga, vista de honorarios vs reembolsos por moneda. **Finanzas históricas no se corrigen inventando badges**: todo hasta julio 2026 pagado según autoridad congelada; agosto y septiembre confirmar por evidencia individual; nunca inferir septiembre entero. Fila 2025 con “Pend. submitir” y pago requiere contraste HR+finanzas. Scope GT/HN/moneda.
7. **B6 Shopper Soporte/Novedades/Notificaciones/Mis Reportes:** tickets creables y persistentes, lectura/unread tras recarga, notificaciones de reprogramación/cancelación/aprobación/rechazo, campanita/lista y navegación al caso correcto; readback en dos sesiones; no falsas notificaciones.
8. **B7 Admin Dashboard/Visitas/Postulaciones/Reservas/Shoppers:** recuperar layout funcional aprobado, multiselección, acciones masivas/individuales WhatsApp/email según proveedor, asignar/reasignar, visitas elegibles HR, detalle completo y acciones por estado, revisiones, cuestionarios, aprobar/rechazar/standby/eliminar postulaciones con readback y sin reaparición, decidir reprogramación/cancelación y notificar shopper, edición configuración sólo donde autorizado, KPIs contra revisión HR externa independiente.
9. **B8 Admin Financiero/Liquidaciones/Movimientos/Lotes/CxP/CxC/Costos:** histórico contra revisión exacta, conciliar individual/masivo, registrar validación/pago sólo por Admin habilitado y soporte real, comprobante Storage/readback, periodos y monedas correctos; pagos hasta julio 2026 reconciliados por visita, agosto y septiembre no presumir sin fuente; acciones por fila/lote; etiquetas humanas en CxP/CxC; no emitir pago por simples clicks de shopper.
10. **B9 Gate20/Gate21 / Publicación:** inventario completo de 21 dominios y todos los hallazgos, E2E de ambos roles, múltiples scopes, proveedor/ACK/idempotencia, no duplicados, comparación DOM visual y certificación artefacto único; I3=GO sólo si P0 PASS y humano PASS; pedir autorización I4 sólo entonces. Deploy producción EXACTAMENTE artifact certificado sin rebuild; PRODUCTION_LOCK al final.

## 5. Listado original de 45 observaciones humanas de 06-10 (preservar textualmente)
| ID HV-06 | Observación original | Existing VRM |
|---|---|---|
| 01 | Login Julissa shows Paula Osorio in sidebar | VRM-197, VRM-258 |
| 02 | Mi Día greets Paula while C. Miraflores belongs to Julissa | VRM-197, VRM-258 |
| 03 | Julissa Illescas/Flores is one human; Flores is canonical | VRM-207, VRM-211, VRM-213, VRM-243, VRM-258 |
| 04 | Illescas still displayed transversally | VRM-258 |
| 05 | Shopper may self-correct first/last name; HR name retained as alias evidence | VRM-054, VRM-099 |
| 06 | Mi Perfil must edit first/last name | VRM-054, VRM-099 |
| 07 | Country required in Profile/Admin and Shoppers country filter | VRM-133 |
| 08 | Authorized Admin needs full shopper profile incl banking | VRM-099 |
| 09 | Mi Día visual hierarchy inferior to Mis Visitas | VRM-144, VRM-165 |
| 10 | Mi Día operational home must surface relevant next actions | VRM-097, VRM-144, VRM-165 |
| 11 | Agendar failed in human test | VRM-125, VRM-168 |
| 12 | Preserve current Mis Visitas direction; improve contrast/hierarchy only | VRM-155, VRM-165 |
| 13 | Check-in should open camera if possible and bind photo+GPS+timestamp+visitId with ACK | VRM-169 |
| 14 | Certification vigente contradicts certification module empty/pending state | VRM-036, VRM-171 |
| 15 | Existing Cinépolis certification must be recovered before recreation | VRM-036, VRM-171 |
| 16 | Multiple certifications/recertification and selector required | VRM-112, VRM-119, VRM-173 |
| 17 | Create certification with IA returns AI_PROVIDER_RESPONSE_INVALID | VRM-111, VRM-148 |
| 18 | Benefits cards visual hierarchy regressed | VRM-165 |
| 19 | Benefits historical table visual design regressed | VRM-101, VRM-165 |
| 20 | Benefits states need unambiguous human headings | VRM-084, VRM-165 |
| 21 | Benefits history still shows Illescas | VRM-258 |
| 22 | Approved frontend regressed transversally | — |
| 23 | Preserve Academia, improved Profile direction, current Mis Visitas direction | — |
| 24 | Future visual deltas require BEFORE/AFTER and scope | — |
| 25 | Dashboard lost multi-select/bulk/WA/email/schedule/context/detail actions | VRM-177 |
| 26 | Dashboard shows Illescas for C. Miraflores | VRM-258 |
| 27 | Visit detail sparse, technical label, wrong name, incomplete history | VRM-038, VRM-258 |
| 28 | VRM-259 badge remains closed unless exact drift | VRM-259 |
| 29 | Postulations/Assignments management UI/actions degraded | VRM-092 |
| 30 | Pedir acción al shopper lacks expected applicable targets | VRM-092, VRM-129, VRM-167 |
| 31 | Postulations must not become another Visits list | VRM-092 |
| 32 | Restore full postulation/assignment action contract with durable readback | VRM-092, VRM-123, VRM-125 |
| 33 | Identity merge function appears working | VRM-221, VRM-243 |
| 34 | Merge modal visually degraded | VRM-221 |
| 35 | No fuzzy/name automatic merges | VRM-207, VRM-213, VRM-243 |
| 36 | Finance dashboard mostly pending source/configuration and visually unusable | VRM-039, VRM-094, VRM-132 |
| 37 | Sep liquidations lack useful row/bulk actions and pay action | VRM-094, VRM-132, VRM-179 |
| 38 | Individual and batch payment flows required | VRM-132, VRM-151, VRM-179 |
| 39 | Payment support upload/storage/mapping required; no WhatsApp dependency | VRM-132, VRM-151 |
| 40 | Reconciliation must be human-clear | VRM-132, VRM-151 |
| 41 | Historical finance cut: through Jul paid; Aug+some Sep paid Oct 2; Oct live start | VRM-151, VRM-174, VRM-183 |
| 42 | Prove Movements/AP/AR/Liquidations/Batches/Reconciliation/Support/individual+bulk payments | VRM-132, VRM-179 |
| 43 | Human labels for AP/AR | VRM-094, VRM-132 |
| 44 | Evaluate embedded/live HR Sheet view/edit with provider authority | VRM-078, VRM-191 |
| 45 | Critical acceptance must execute real flows with ACK/readback/persistence/no duplicates/no technical labels | VRM-035, VRM-196 |

## 6. Listado completo de 18 observaciones humanas del 08-10 (estados iniciales son históricos)
| ID | Bloque | Tipo | Observación | Estado al capturar |
|---|---|---|---|---|
| HF-20261008-01 | B1 | FUNCTIONAL_DEFECT | Carga inicial observada superior a 10 s; gate 'Sincronizando operación' bloquea superficie útil | OPEN_PERFORMANCE_MEASUREMENT_PENDING |
| HF-20261008-02 | B1 | VISUAL_DEFECT | Mi Día: Paula aprueba expresamente jerarquía visual, progreso, fecha, tarjetas y acciones sobre source vigente | HUMAN_VISUAL_PASS_SURFACE_ONLY |
| HF-20261008-03 | B2 | VISUAL_DEFECT | Mi Perfil conserva cuatro tarjetas resumen pero muestra inmediatamente todos los detalles personales y bancarios | OPEN |
| HF-20261008-04 | B3 | VISUAL_DEFECT | Tarjeta Mis Visitas mejoró y muestra fecha, pero ocupa altura excesiva | OPEN_PARTIAL_VISUAL_IMPROVEMENT |
| HF-20261008-05 | B3 | FUNCTIONAL_DEFECT | Se admitió solicitud 2026-10-10 (sábado) para visita entre semana; frontend no valida franja; assertSchedulableDate backend sólo valida formato y fecha mínima | OPEN_P0_PROVEN_VALIDATION_GAP |
| HF-20261008-06 | B3 | FUNCTIONAL_DEFECT | Shopper 'Cancelar' dispara requestVisitCancel sin diálogo ni motivo humano | OPEN_P0_PROVEN_UI_GAP |
| HF-20261008-07 | B3/B7 | MAPPING_FAILURE | Proveedor registra cancelRequest.status=pending_review pero UI de visita sólo muestra fase HR; tras sincronización visita reaparece sin seguimiento visible | OPEN_P0_PROVEN_PROJECTION_GAP |
| HF-20261008-08 | B3 | FUNCTIONAL_DEFECT | Check-in no abre captura de cámara según observación; código sólo ofrece input file capture=environment, sin API cámara explícita | OPEN_LIVE_REPRO_PENDING |
| HF-20261008-09 | B3 | FUNCTIONAL_DEFECT | Banner Check-in 'Guardado con ACK' se muestra por geoOn incluso sin evidencia confirmada de visita individual | OPEN_P0_PROVEN_FALSE_SUCCESS_PRESENTATION |
| HF-20261008-10 | B3/B7 | MAPPING_FAILURE | visit.reschedule guarda visit.rescheduleRequest; Gestión de Postulaciones cuenta activePosts.filter(x=>x.reprog) y no consume visit.rescheduleRequest | OPEN_P0_PROVEN_CROSSROLE_GAP |
| HF-20261008-11 | B3/B7 | PERSISTENCE_FAILURE | Camino shopper CX.automations.fire(reprog) usa CX.notif.push sin esperar pushDurable ACK; no prueba de campanita/Admin/Notificaciones en segunda sesión | OPEN_P0_DURABILITY_GAP |
| HF-20261008-12 | B5 | VISUAL_DEFECT | Notas 'Tu beneficio total' y 'Honorarios vs reembolsos' son grandes y minimizan protagonismo de liquidaciones; contraste desigual | OPEN |
| HF-20261008-13 | B2/B5 | FUNCTIONAL_DEFECT | No todos los KPIs muestran detalle; en Beneficios overview histórico/confirmados/pendientes no tiene drill, sólo KPIs por moneda | OPEN |
| HF-20261008-14 | B5/B8 | FUNCTIONAL_DEFECT | Histórico de beneficios no ofrece acción contextual explícita por fila para evidencia, revisión y comprobante; fila completa clickable no suficientemente descubrible | OPEN |
| HF-20261008-15 | B5/B8 | MAPPING_FAILURE | Histórico junio 2025 y diciembre 2025 aparece pendiente pese al corte congelado de pago completo hasta julio 2026; agosto pagado 02-10 y septiembre sólo ítems evidenciados | OPEN_P0_FINANCIAL_AUTHORITY_DRIFT |
| HF-20261008-16 | B5 | VISUAL_DEFECT | La tabla y el copy dicen antigua a reciente; código allSorted fecha ascendente | OPEN_PROVEN_SORT |
| HF-20261008-17 | B3/B5 | FUNCTIONAL_DEFECT | Fila histórica 2025 aún dice 'Pend. submitir' junto a estado financiero pendiente; verificar fase HR exacta e identidad de liquidación | OPEN_SOURCE_VERIFICATION |
| HF-20261008-18 | B1/B3 | MAPPING_FAILURE | Mi Día y modal muestran 'Agendada/Confirmada en HR' 2026-10-09; revisión anterior de HR tenía fecha vacía. Verificar revisión HR nueva antes de dar verdad operacional confirmada | OPEN_LIVE_HR_REVISION_CHECK |

## 7. Matriz modular V37 literal (historical as-of 08-10; no autocierre)
| Dominio | Clasificación en V37 |
|---|---|
| auth-protected-data-runtime | MATCH |
| base-router-shell-cache | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| benefits | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| canonical-hr-state-adapters | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| certifications | MATCH |
| client-portal-reportkit | MATCH |
| core-config-data-router-permissions | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| dashboard-operation | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| documents-resources | MATCH |
| finance-core-liquidation-costs | MATCH |
| historical | MATCH |
| human-runtime-domain-consistency | MATCH |
| identity-membership-roll-forward | MATCH |
| persistence-command-ack-boundary | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| phase-a-supporting-core | MATCH |
| projects-periods-hr-source-wizard-multiproject | MATCH |
| questionnaire-shopper | MATCH |
| reports-admin-shopper | MATCH |
| shoppers-mi-visitas-profile | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| visits-review-postulations-reservations | SOURCE_FIXED_PENDING_DEV_E2E_HUMAN |
| tenant-admin-config-branding | MATCH |

## 8. Estados y siguiente acción exacta
**I3 HOLD**, aunque run 1382 haya cerrado PASS el E2E ejecutado. **No I4, no producción, no nuevas ramas/repositorios/Firebase, no reimport/overlays**.
**Siguiente acción única:** resolver HEAD/descriptor/run 1382, consignar receipt técnico con métricas y alcance de verdad; ejecutar un `PHASE_A_FINDINGS_COVERAGE_READBACK` de las 270 VRM + 45 HV-06 + 18 HF-08 + matriz de 21 dominios, separando `SOURCE_FIXED`, `E2E_PASS` y `HUMAN_PASS` por elemento. Examinar las brechas probadas (B2 perfil, B3 camera + pending cross-role end to end, B5/B8 histórico financiero/acciones, B7 admin), clasificarlas por owner y corregir sólo P0_PROVEN en I3. Mantener listado de omisiones de pruebas automatizadas y cubrirlas por contract E2E, NO preguntar a Paula qué más recuerda. Después entregar un único enlace DEV al artefacto técnico PASS y una ruta **completa aunque eficiente** de aceptación humana. Nunca hacer pasar check rápido por aceptación de todas las rutas.

**Política de cierre por hallazgo:** un PASS requiere ID, rol, tenant/project/period, HR sourceRevision y financiera cuando aplique, expected, observed, command ACK/reload si corresponde, hash/source/runtime/Hosting, prueba visual/humana si es requisito; si no hay evidencia queda OPEN/HOLD. No borrar lo ya construido ni lo aprobado; no reutilizar un antiguo run para otra source.
