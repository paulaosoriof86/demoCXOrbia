# CXOrbia Recovery — congelamiento operativo de prioridades I3 / objetivo I4

**ID:** `CXORBIA-I3-PRIORITY-EXECUTION-FREEZE-20261028`  
**Fecha y zona:** 2026-10-28, America/Guatemala  
**Decisión de Paula:** congelar el plan de cierre, acelerar la ejecución transversal de Phase A, permitir trabajo independiente en varios frentes, priorizar estabilidad y lograr producción hoy si y sólo si se cumplen los gates.  
**Tipo:** adenda de prioridad y ejecución, `CONTROL_ONLY` / `FROZEN`; no es autorización de deploy productivo, escritura de datos ni cambio funcional indiscriminado.  
**Iteración:** I3 `HOLD`; I4 `NOT_AUTHORIZED`; producción `DO_NOT_TOUCH`.

## 1. Autoridades preservadas y efecto de esta decisión

Se preservan íntegramente el Plan Rector, contratos funcionales, addenda prevalentes, plan congelado V1.1 del 16-10, ledger VRM vivo, aprobaciones por owner/contrato/artefacto y todos los hallazgos históricos no cerrados. Esta decisión no reemplaza sus criterios funcionales o Gate20/Gate21. La fuente de estado es el descriptor y la matriz del HEAD Recovery vivo, no una cifra antigua congelada.

**BEFORE — ejecución observada:** sucesivas iteraciones focales D07/PDF consumieron el carril principal a pesar de que el documento original era legible y la falta de una prueba Admin+Shopper actual, más que un código causal nuevo demostrado, mantenía D07 abierto.

**AFTER — ejecución obligatoria:** D07 pasa a un smoke test real acotado y transversal; HR/ACK, identidad, visitas/asignaciones, finanzas y certificaciones conducen las prioridades I3. Se permite preparar y probar dominios/owners independientes concurrentemente, sin múltiples escritores de producto, ramas, candidatas ni artefactos finales. Se integra cada reparación P0 reproducida de forma serial sobre la única source successor acumulativa. No se reinician los PASS sin drift.

**Causa del ajuste:** urgencia operativa y desproporción entre esfuerzo D07 y otros bloqueos Phase A, tras observación directa reportada por Paula de lectura/descarga del PDF Admin y Shopper. Se registra como `USER_REPORTED`, no se inventa `LIVE_E2E_PASS` ni aprobación por hash sin readback del contexto exacto.

## 2. Estado nuevo leído el 28-10 (no cierre)

- Repo/branch: `paulaosoriof86/demoCXOrbia` / `recovery/cxorbia-phase-a-20260831`.
- Product source vigente al readback: `77fd283349ce46033a95235fd2fae632e856fe35`; tree `9e3c446c829edbcb7cc5d2f6ab179ddacb246248`.
- Matriz `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261028-V187.json`: 21 dominios, 4 `MATCH`, 17 no-MATCH de distintas clases; `phaseAComplete=false`, `allModulesMatch=false`. No inferir 17 defectos de código.
- Ledger seleccionado: `CXORBIA_I3_CANONICAL_CUMULATIVE_FINDINGS_LEDGER_FULL_V519_2026-10-28.json`.
- D07: instrumentación DEV Hosting-only RUN40639605095, Hosting `a1cd7ecc1a12db34`, source QA RUN1898 `62/62 PASS`; `latestAdminSafeDiagnostic`, `pdfLiveE2e` y Shopper E2E aún `NOT_VERIFIED`. Gate20/Gate21 `HOLD`.
- G03: cuatro diferencias preexistentes de linaje/source-owner frente a última autoridad aprobada, que exigen readback/adjudicación semántica y no revert indiscriminado.

## 3. Priorización inmediata en carriles de verificación concurrente

1. **P0-A — HR, identidad, sesión y ACK durable:** `canonical-hr-state-adapters=TRUE_FUNCTIONAL_DEFECT`, `persistence-command-ack-boundary=COMPOSED_NOT_DEPLOYED`. Evidencia de fuente fresca, canonical owner, escritura permitida con ACK remoto/readback/no duplicados. No consultar endpoints con side effects de reconciliación sin autorización y scope.
2. **P0-B — operación Admin/Shopper:** Visitas, Gestión de Postulaciones, asignaciones, elegibilidad, Mis Visitas, perfil, Agendar, check-in, disponibilidad HR. Source parcialmente corregido; faltan E2E y aceptación de owners concretos.
3. **P0-C — finanzas:** movimientos, CxP/CxC, liquidaciones, pagos individuales/lotes, soportes, estados y conciliación, con readback proveedor y cortes históricos conservados.
4. **P0-D — certificaciones, proyectos y periodos:** banco Cinépolis, carryover autorizado, recertificación, cuestionarios, recursos correctos por tenant/proyecto/periodo y aprobaciones.
5. **Cierre transversal — visual, dashboard, beneficios, portal del cliente, G03:** paridad con autoridad aprobada, acciones reales, sin regresiones; validar por bloque cuando sirva DEV y conservar aprobaciones independientes.
6. **D07 — prueba focal no dominante:** una comprobación real en la vista integrada DEV Cinépolis OCT 2026 con Admin y Shopper: abrir documento, confirmar páginas y contenido, descargar y verificar el PDF. Si ambos roles PASS, registrar evidencia y cerrar el bloqueo funcional correspondiente. Si falla, clasificar y corregir sólo el defecto causal reproducido. No repetir ciclos de diagnóstico PDF sin nueva evidencia.

La paralelización es de análisis, lecturas read-only, QA y preparación de paquetes independientes. **Escritor único por intento, fuente sucesora única, integración/commits seriales, artefacto final único.** Ninguna QA sintética sustituye ACK proveedor o E2E real.

## 4. HR viva: requisito de verdad y dato histórico disponible

El último sello de `hrRevision` DEV verificado es `d19eb12ad8c1c5140b5711ea390deaae50b0edd35ff4f982a69bfdcabbc86dd2` en RUN1852 del **24-10-2026** (Cinépolis OCT GT: 44 visitas, 43 asignadas, 1 sin asignar, 24 realizadas), runtime entonces `cxorbia-live-hr-dev-00326-z9j`. Hosting diagnóstico actual apunta a runtime `cxorbia-live-hr-dev-00327-xsc`, pero `hrRevisionFresh=NOT_RECHECKED`, `runtimeDigestFresh=NOT_RECHECKED`.

Este sello histórico **NO prueba la última modificación externa HR del 28-10 ni que la plataforma consuma en vivo esa última revisión**. `readAt`, `modifiedTime` global y hash de fuente no son timestamps de edición de campo. Para afirmarlo, obtener lectura independiente read-only de HR actual, su sourceRevision, lectura consumida por DEV sobre el mismo universo, y paridad de campos relevantes, con readback y sin activar reconciliación escritora. RUN1852 documenta tres visitas con diferencias de campos operativos HR vs top-level Firestore; nueva reconciliación/ACK no consta ejecutada ni autorizada.

## 5. Secuencia de salida hoy y reglas de stop/go

1. Releer HEAD, descriptor/matriz/ledger de la única rama; delimitar owners y P0 actuales. Verificar HR fresh por canal seguro sin side effects y los flujos críticos Admin/Shopper en paralelo; D07 una sola pasada acotada.
2. Para P0 probado: `OWNER_PROVEN` -> corrección mínima con parent SHA/allowlist -> source proof -> DEV served-byte readback -> E2E real/ACK -> aprobación humana de owner/contrato afectado. Conservar aprobaciones no afectadas.
3. Completar Phase A con 21/21 `MATCH` vigentes, regresión transversal y artifact único. Gate20 semántico/visual y Gate21 de identidad del **mismo** artifact. I3 `GO` sólo con todas las obligaciones bloqueantes comprobadas.
4. Solicitar a Paula autorización I4 **para el artefacto exacto**. Promoverlo sin rebuild a producción, verificar Hosting/runtime/HR/Admin/Shopper/operación/KPIs y generar `PRODUCTION_LOCK`.

**Objetivo temporal:** miércoles 28-10-2026; no es permiso para omitir un P0 ni declarar un PASS no observado. Si cualquier bloqueo P0 impide estabilidad, mantener `HOLD`, indicar owner/evidencia y próximo remedio exacto. No tocar `tya-plataforma.web.app` hasta I3 `GO` y autorización expresa de I4.

## 6. Mutabilidad / evidencia de esta congelación

Documento `FROZEN` y aditivo: no sobrescribir. Una supersession necesita BEFORE/AFTER, causa, autor, impacto, evidencia y nuevo checksum/identidad Git. Este recibo no cambia source de producto, configuración, Firestore, Auth, Storage, HR ni producción. No concede PASS ni despliegue. Las verificaciones concurrentes posteriores avanzan mediante recibos con HEAD/source/owner/test/readback, no mediante edición retroactiva de este freeze.
