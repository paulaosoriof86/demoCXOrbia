# CXOrbia Recovery — continuidad al 24 de noviembre de 2026

**Iteración:** I3 — Functional Closure. **Estado:** HOLD. **Gate20/Gate21:** HOLD. **I4:** no autorizada. **Producción:** `DO_NOT_TOUCH`.

Checkpoint de continuidad del plan vigente y del trabajo paralelo. Complementa el lock del 22 de noviembre; no crea otro plan, candidata, rama, workflow, fuente de verdad ni escritor.

## Autoridad y corte técnico

| Elemento | Corte que debe conservarse |
|---|---|
| Repositorio / rama | `paulaosoriof86/demoCXOrbia` / `recovery/cxorbia-phase-a-20260831` |
| Plan congelado | `PLAN_TRAZABLE_I3_I4_FROZEN_V1_1.json`: **82 tareas**; 63 I3, 7 I4, 6 estabilización y 6 evolución |
| Cobertura / aceptación | **21 dominios, 6 MATCH** conservados en su alcance documentado. Las aceptaciones **B4/B5/B6/B7** permanecen; no reabrirlas sin drift reproducible. Preparación de fuente y runner PASS no equivalen a cierre integral |
| Parent observado del paquete | `123d62ea1664f0d7b70be254da34998faa519175`; referencia de integración, no puntero futuro |
| Nuevo source / tree | `9b6ee21643406be44e822dad5cd0031de6c0ce9b` / `a73f5579a5d791012e911d5ca3e74d343b716a1d` |
| Nuevo HEAD/control / matriz / ledger | `commit que contiene este checkpoint; resolver HEAD vivo en GitHub` / `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261124-V392.json` / `CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V719_2026-11-24.json` |
| Source realmente servido | `cbe7bb9d79805782d256fa432a406c1843beee85` |
| Tree servido | `f07d810e2f2787df49f4df3e970a0aa2a5723175` |
| Runtime DEV | `cxorbia-live-hr-dev-00389-p4r` |
| Digest runtime | `sha256:cbe7eb5b4595848d3044dd41434881bfda3d89a047dd69d5473ac21065123580` |
| Hosting DEV | `sites/cxorbia-backend-dev/versions/49fecd39bac8b307` |
| Recibo del DEV pareado | `docs/checkpoints/CXORBIA_I3_RUN2767_F3_SAME_ARTIFACT_ENV_PASS_20261124.json` |

Source y control quedan ligados por los hashes del descriptor. Resolver HEAD vivo, descriptor, matriz y ledger dinámicamente antes de la siguiente escritura. Este paquete publicado acredita fuente y controles; no acredita un despliegue ni reemplaza la evidencia LIVE anterior.

## Evidencia nueva y trabajo integrado

Root integró el paquete acumulativo y comprobó **584 pruebas locales en 24 suites, cero FAIL**, incluidos los 12 casos de preparación del secreto de correo sin red. La CI canónica del commit de control aporta el readback remoto correspondiente. Son pruebas de fuente/control; no acreditan autenticación SMTP, durabilidad real después de reinicio, escritura bidireccional remota ni aceptación integral de dominios.

- **VRM-370:** el owner `materialize` conserva el digest original Excel en `source.sourceRevision` y publica la revisión runtime coherente en el nivel superior. La rematerialización durable es idempotente; se mantiene el guard de discrepancias.
- **VRM-371:** vista interna HR durable por tenant/proyecto/binding/versión de lector; fragmentos inmutables y puntero transaccional en Firestore existente. Autenticación antes de persistir, frescura visible, sin fallback de comandos/KPI. El watcher descarta prefetch antiguo cuando detecta otra revisión.
- **VRM-367 / E08:** source de envío/respuesta SMTP por usuario integrado en los owners existentes, con idempotencia y estados de aceptación/incertidumbre veraces. POP3 y TLS ya tenían evidencia; falta la prueba autenticada externa.
- **A08:** reparado el control que exigía 41 assets frente al inventario aprobado de 47. Ahora se exige inventario exacto del manifest vigente; no se reduce la cobertura para lograr PASS.
- **Finanzas:** ejecución focal del segundo anticipo preparada en el job existente, sin cambios de producto. Scope con `commandDispatchAllowed:false`.
- **RUN2771:** limpieza CAS del lock QA huérfano F3 acreditada con readback. No implica ACK de asignación remota ni certificación de F3. No repetir limpieza amplia.

## Bloqueos vigentes

**Make — PROVIDER_FAILURE.** RUN2769 comprobó la organización pausada y capacidad agotada: 14067 consumidos sobre 14000 disponibles. El lector Graph no recupera servicio simplemente activando el escenario. No repetir D08/F3/A08 ni otros intentos que dependan de HR mientras siga este bloqueo. No hubo compra de créditos; precio e impuestos efectivos de la cuenta no están cotizados. La decisión de capacidad/coste pertenece a Paula cuando no pueda resolverse dentro de una autorización existente.

**Correo — autenticación y configuración aún no acreditadas.** El PASS TLS de POP995/SMTP465 de RUN2766 comprueba transporte/certificado, no credencial ni envío/recepción. Falta credencial propia utilizable y activación protegida del buzón, seguida de una prueba consentida con ID/ACK externo, readback e aislamiento por usuario. No afirmar enviado ni repetir TLS por rutina.

**Dependencia financiera real.** El runtime servido llama `buildSnapshot` antes de configurar todo comando; finance también puede esperar Make/Excel al expirar el cache. El nuevo control no elude ese owner. Con el scope actual solo se permite preflight ADC, lectura del CAS y comando/evidencia cifrados; HOLD antes de sesión Auth y endpoint. La corrección ya fue autorizada y no necesita nueva aprobación al recuperarse la dependencia.

## Frentes paralelos y residual exacto

| Frente | Evidencia que se conserva | Residual y criterio de continuación |
|---|---|---|
| HR original / rendimiento / vista durable | Lecturas y paridad aceptadas en su revisión; observaciones T&A source; VRM-371 probado offline | Tras recuperación de Make y materialización pareada, primera lectura fresca protegida para **poblar** el modelo del nuevo lector; luego reinicio/otra instancia, recuperación visible con fecha original, actualización posterior y bloqueo estricto de comandos/KPI ante falta de fuente fresca. Un modelo todavía inexistente no puede resolver el primer arranque |
| F3 / B03 bidireccional | Contrato, fixture aislada, corrección de revisión y limpieza QA exacta | En la fixture autorizada: comando → ACK remoto → readback independiente; pérdida de respuesta/replay, conflicto, eco, cero duplicados y limpieza. No extrapolar sondas Graph ni escribir libros operativos para probar |
| D08 Academia | RUN2768: curso/lecciones/evaluación/progreso Admin con ACK y readback; aserción visible de nueva sesión alcanzada. Limpiezas exactas de RUN2760 y RUN2768 verificadas | Completar UI real Admin/Shopper/Cliente, sesiones independientes, replay, recursos, edición Admin y negativos; evidencia de los seis owners, incluido `backend-ai`. Mantener scope real tenant/curso: **no fabricar `periodId`** para C3; adjudicar/adaptar el control solo por owner probado. B7 aceptado no cierra D08 completo |
| A08 / ingreso ordinario | API cuatro casos PASS de RUN2760 y controles ya aceptados; QA de inventario corregida | Solo las **tres excepciones exactas de contraseña ordinaria**, con primer ingreso, restauración/recarga y logout/login según su scope. Login/restore/relogin aún dependen de HR. No recenso, refusión, cambio masivo de claves ni sustitución por custom token |
| Finanzas / segundo anticipo | Comando VRM-369 servido; identidad exacta de ambos registros preservada; RUN2595 privado verificado | Cambiar solo `cat="Remesa de anticipo Noviembre Cinépolis"` y `fecha="2026-10-31"` en el segundo registro. Releer CAS, conservar Q7300/caja octubre/sourceRef/desc/primer registro y resto de hechos; ACK, readback, replay y mismo total. Sin tercera fila, asignación de fondos, pago ni recreación. Mantener dispatch deshabilitado mientras HR esté bloqueada |
| E08 correo | POP3 source y TLS comprobados; SMTP source integrado | Materialización del owner, credencial/activación y envío/recepción consentidos por usuario con ACK externo, sesión nueva e idempotencia. No confundir SMTP aceptado con entrega final ni abrir otro carril |
| C3 / 21 dominios | 6 MATCH, B4–B7 y cláusulas históricas válidas | Acreditación incremental de lo descubierto, con owners, bytes servidos, rol/scope, revisión externa y E2E/visual coincidentes. No nueva auditoría general ni promoción automática por sourceReady o tests. Revalidar únicamente dependencia impactada por un delta probado |

### Cláusulas que no deben perderse al retomar

- **D07:** conservar la cláusula de PDF real Admin/Shopper de RUN1991 y su carry-forward; no repetirla como descubrimiento. Sigue pendiente el ciclo completo de alta/metadatos/versión/retiro seguro, documento ajeno denegado, read-ACK durable y vínculo visita/revisión, con los siete owners, incluido `manuales-data.js`. TXT o preview parcial no cierran ese ciclo.
- **A07/A09:** completitud, edición permitida de perfil y minimización; Admin autorizado ve lo permitido y otro shopper no lo recibe. Preservar UID, credencial e historial; contraseña expuesta no es requisito de perfil. Conservar pruebas ordinarias y población aceptadas; atender solo excepciones concretas.
- **B09, bloque check-in:** cámara/archivo, GPS/fecha/visita, Storage y ACK; negativos de permisos/carga y ausencia de huérfanos, dentro de los casos aún no cubiertos. No reabrir pruebas focales ya aceptadas.
- **B10/B11:** cuestionario/fuente publicada por proyecto, revisión/submit real y estados; elegibilidad/disponibilidad/KPIs GT/HN por proyecto y periodo contra la **misma revisión externa independiente**, sin fabricar submit ni usar otro derivado local como oráculo.
- **D06, B13, C09/C10 y demás obligaciones congeladas:** conservar intentos y aprobaciones existentes; completar solo elegibilidad/recertificación/roles, avisos y soporte, ledger/beneficios/export/sesiones aún no acreditados. Se mantienen los cortes financieros históricos y los casos de septiembre pendientes de autoridad; esta corrección de metadatos no los liquida.
- **Legal:** sigue no bloqueante según la excepción congelada; no autoaceptar ni fabricar consentimiento. ROLA y Phase B conservan su alcance y dependencias, sin usar etapas posteriores para diferir P0 de Fase A.

## Siguiente acción y disciplina de continuidad

1. Conservar el único paquete acumulativo de source/control y su readback CI; mantener LIVE actual mientras la verificación necesaria dependa del proveedor bloqueado. No atribuir al nuevo source una materialización que no ocurrió.
2. Resolver capacidad Make y credencial/configuración de correo por el acceso autorizado disponible. No crear compra, envío o autorización productiva implícitos.
3. Con capacidad restituida: una lectura HR original fresca; materialización serial del source exacto por el carril existente; seed y readback durable; retomar únicamente los residuales anteriores. Source, configuración, runtime, Hosting y evidencia deben corresponder.
4. Mantener aceptación incremental; completar I3 y Gate20/Gate21 antes de solicitar I4 para el artefacto exacto. Publicación productiva sin rebuild y PRODUCTION_LOCK solo bajo autorización explícita. No hay I5.

**Autorización:** ninguna nueva para preparar/publicar fuente y continuar las correcciones focales ya autorizadas. Paula interviene solo en decisión de coste no autorizada, credencial/IAM irresoluble o autorización I4. No hay plazos comprometidos ni tareas en segundo plano creadas por este checkpoint.

## Referencias de continuidad

- `docs/checkpoints/CXORBIA_I3_20261120_82_TASK_EXECUTION_COVERAGE_FREEZE_V1.json` y `CXORBIA_I3_PLAN_CHOQUE_CONTINUIDAD_FROZEN_20261122.md`.
- `CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json`, `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` y matriz/ledger que seleccionen al publicar.
- Recibos `CXORBIA_I3_RUN2767_F3_SAME_ARTIFACT_ENV_PASS_20261124.json`, `CXORBIA_I3_RUN2768_D08_CLEANUP_CAPTURE_P0_20261124.json`, `CXORBIA_I3_RUN2769_MAKE_ORG_QUOTA_READONLY_20261124.json`, `CXORBIA_I3_RUN2770_A08_CURRENT_INVENTORY_SCOPE_20261124.json` y `CXORBIA_I3_RUN2771_F3_QA_CLEANUP_VERIFIED_20261124.json`, todos bajo `docs/checkpoints/`.
- Scopes/pre-edit truth de VRM-370, VRM-371, VRM-367 y `docs/checkpoints/CXORBIA_I3_NOVEMBER_ADVANCE_METADATA_SCOPE_20261124.json`.

## Preparación de activación de correo

El updater DEV existente conserva o crea la clave de cifrado únicamente bajo las condiciones probadas, monta versión numérica y prepara MAILBOX=true / SEND=false. La política de proveedor permite la capacidad SMTP, pero la variable de envío permanece cerrada. No se creó un secreto, cambió IAM, autenticó un buzón ni envió correo en esta entrega. La preparación usa el carril único y no añade YAML/jobs. El inventario del siguiente paired DEV incluye 48 rutas, añadiendo core/data-source.js; el artefacto actualmente servido conserva sus 47 rutas acreditadas.
