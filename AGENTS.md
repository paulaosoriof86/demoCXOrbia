# CXOrbia Recovery — autoridad operativa raíz

Este archivo aplica a todo el repositorio salvo que un `AGENTS.md` más profundo restrinja todavía más el alcance. Su función es resolver autoridad y continuidad; no sustituye manifests, checkpoints ni evidencia de una candidata.

## 1. Autoridad prevalente

Para cualquier trabajo de Recovery, leer y aplicar en este orden las fuentes del Project CXOrbia Recovery:

1. `00_START_HERE_CXORBIA_RECOVERY.md`;
2. `ADDENDUM_PREVALENTE_RECUPERACION_CXORBIA.md`;
3. `PLAN_RECTOR_RECUPERACION_CXORBIA.md`;
4. `CONTRATOS_FUNCIONALES_CXORBIA_RECOVERY.md`;
5. `CHECKPOINT_INICIAL_RECUPERACION_CXORBIA.md`;
6. cualquier addendum Recovery posterior expresamente aprobado, en orden cronológico; actualmente el addendum de 2026-09-03 complementa y prevalece sobre reglas anteriores cuando existe conflicto;
7. después, resolver dinámicamente en GitHub la rama Recovery viva, sus locks/checkpoints, manifest F9 aplicable, HEAD, tree, checks y evidencia vinculada al intento exacto.

Las fuentes del Project pueden estar montadas fuera del árbol Git. No crear copias divergentes para sustituirlas. Si una ejecución técnica no puede leer la autoridad Recovery necesaria, debe detener el write funcional en vez de inferir reglas desde documentación histórica.

## 2. Rama operativa y precedencia histórica

- Repositorio único: `paulaosoriof86/demoCXOrbia`.
- Carril operativo Recovery: `recovery/cxorbia-phase-a-20260831`.
- `docs-tya-v6-v71-audit`, PR #7, índices/checkpoints/direct-runner contracts históricos y demás carriles previos son evidencia o autoridad histórica solamente cuando no contradicen Recovery.
- No crear otra rama principal, PR paralelo, candidata paralela, overlay, materializador, workflow transportador ni metodología adicional para resolver un FAIL.
- El HEAD de trabajo nunca equivale por sí solo a release aprobada ni a artefacto certificado.

## 3. Resolución dinámica del estado vivo

Nunca hardcodear un SHA como autoridad permanente.

Antes de cada write técnico:

1. leer la rama Recovery remota;
2. capturar `expectedParentSha` y tree del intento;
3. comprobar que coinciden con el paquete/issue/checkpoint que autoriza el cambio;
4. limitar el write a owners y archivos allowlisted;
5. si HEAD/tree cambiaron antes del write, clasificar `SOURCE_FAILURE`, no escribir y re-resolver el intento sobre el nuevo estado vivo;
6. después del write, hacer readback del commit, parent, tree, diff y HEAD remoto;
7. ejecutar únicamente los gates DEV focales previstos para ese paquete.

Un manifest o checkpoint histórico es evidencia inmutable. No se reescribe para convertirlo en puntero vivo. Cada candidata certificable debe producir su propio manifest/receipt ligado al source y artefacto exactos.

## 4. Escritor único por intento — decisión prevalente ratificada 2026-09-10

La decisión operativa posterior de Paula sustituye, para Recovery, la restricción histórica que exigía Codex como escritor ordinario.

- Escritor técnico primario: la sesión de ChatGPT que opera directamente sobre GitHub en el carril Recovery, con `expectedParentSha`/tree, allowlist focal, readback y gates reproducibles.
- Codex no es prerrequisito de I2, I3 ni I4. Queda como excepción opcional únicamente si Paula lo solicita expresamente o una limitación técnica demostrable impide ejecutar el paquete de forma segura desde el carril directo.
- Solo puede existir un escritor activo por intento. No alternar ChatGPT/Codex/agentes sobre el mismo paquete ni crear carriles paralelos.
- I0 e I1 conservan sus restricciones de modificación definidas por el Plan Rector y sus gates.
- I2 permite el paquete técnico autosuficiente previsto por el Plan, ejecutado por el escritor primario vigente.
- I3 permite únicamente correcciones P0 `PROVEN`, con owner/archivo exactos, alcance mínimo y tests focales. No autoriza “arreglar todo CXOrbia”.
- I4 no permite cambios de código salvo un P0 de código nuevamente demostrado; el deploy sigue siendo por el carril único del artefacto ya certificado y requiere autorización productiva explícita.

Control de cambio de gobernanza:

- BEFORE: el router raíz heredaba la política inicial “Codex-only” para I2/I3.
- AFTER: ChatGPT directo es el escritor primario de Recovery; Codex es opcional/excepcional.
- Gates impactados: solo mecanismo de ejecución/continuidad; no altera por sí mismo ningún PASS funcional ni autoriza producción.
- Criterio de aceptación: todo write directo debe cumplir sección 3, limitarse al owner probado, producir readback y no crear una segunda candidata.
- Owner: autoridad Recovery ratificada por Paula; este `AGENTS.md` actúa como router operativo, no como sustituto de los documentos fuente.

## 5. Reglas anti-bucle

Todo FAIL se clasifica únicamente como:

`SOURCE_FAILURE`, `MAPPING_FAILURE`, `PROVIDER_FAILURE`, `PERSISTENCE_FAILURE`, `AUTH_FAILURE`, `FUNCTIONAL_DEFECT`, `VISUAL_DEFECT`, `RELEASE_COMPOSITION_FAILURE` o `ENVIRONMENT_FAILURE`.

Un FAIL no autoriza reauditoría general, reimport, nueva candidata, rama paralela, overlay, materializador o workflow nuevo. Se corrige dentro de la iteración vigente por el owner probado y se repite el gate afectado.

No reabrir un gate PASS sin drift reproducible del producto, contrato, provider, persistencia, auth, release composition o ambiente que afecte ese gate.

## 6. Invariantes de producto P0

- Plataforma multi-tenant por `tenantId` y multi-proyecto por `projectId`.
- `projectId`, `periodId` y execution cut son conceptos distintos.
- Proyecto, periodo, país, moneda, fuentes HR/roadmap/cuestionario, Sheet IDs, columnas y mappings son configuración scoped; no defaults globales hardcodeados.
- `routeSource` y fuentes equivalentes deben poder operar como `internal|external/provider` según contrato.
- HR externa manda sobre campos HR-managed y la misma `sourceRevision` debe respaldar disponibilidad, asignaciones, histórico y KPIs.
- Visitas disponibles = elegibles y no asignadas.
- Asignar retira disponibilidad y crea/actualiza la vista shopper sin duplicados.
- Shopper HR inexistente se upserta de forma automática e idempotente y debe poder autenticarse.
- Administradores autorizados deben ver identidad, histórico y KPIs.
- Postulación válida persiste, aparece en Gestión de Postulaciones y no reaparece después de eliminación válida.
- Todo write bidireccional requiere ACK remoto, idempotencia y readback.
- Un guardado únicamente local/preview no certifica persistencia.
- Artifact desplegado debe ser exactamente el artifact certificado; no rebuild entre certificación y deploy.

## 7. Producción

`https://tya-plataforma.web.app/` permanece `LEGACY_ORACLE` y `DO_NOT_TOUCH` hasta I4 y autorización productiva explícita.

No desplegar, mutar datos reales, Firestore/Auth/Storage/HR productivos ni reemplazar Hosting por rutina. No reimportar datos reales ni conectar/copiar la base legacy.

## 8. Evidencia y cierre de cada bloque

No afirmar PASS, commit, push, deploy ni producción sin readback/evidencia reproducible.

Cada cierre debe registrar como mínimo:

- iteración vigente;
- evidencia nueva;
- estado `GO`, `HOLD` o `NO_GO`;
- HEAD/tree anterior y nuevo cuando exista write;
- archivos realmente modificados;
- P0 y clasificación, si existe;
- tests/gates ejecutados y resultado;
- `sourceRevision`/artifact/digest cuando aplique;
- qué no cambió, incluida producción;
- siguiente acción exacta y si requiere autorización.

La continuidad se deriva de estas reglas + fuentes Recovery prevalentes + readback vivo. No depende de memoria conversacional ni de un SHA congelado fuera de su intento.
