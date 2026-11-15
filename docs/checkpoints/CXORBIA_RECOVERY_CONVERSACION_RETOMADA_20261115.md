# CXOrbia Recovery — conversación retomada y cierre de la iteración interrumpida

**Fecha:** 15 de noviembre de 2026. **Iteración:** I3. **Estado:** HOLD.

**Resultado principal:** se recuperó la continuidad comprobable del trabajo interrumpido, se publicó en DEV la corrección de producto que había quedado local y se ejecutó su comprobación autenticada. Q2 está GO sobre la fuente actual; VRM331 quedó comprobado en DEV. Q3 conserva una incidencia de mapeo, VRM043, delimitada a seis referencias de identidad. Gate20, Gate21 e I4 siguen HOLD.

Este cierre reconstruye acciones a partir de commits, archivos, recibos y artefactos verificados. El texto que nunca llegó a publicarse en la conversación no se presenta como una transcripción recuperada.

## 1. Autoridad y continuidad preservadas

Se mantiene el repositorio `paulaosoriof86/demoCXOrbia`, la rama `recovery/cxorbia-phase-a-20260831`, la candidata única y el plan de Recovery I0–I4. La recuperación se hizo sobre el trabajo existente.

Se consultaron los cinco documentos obligatorios de Recovery, sus adendas vigentes, las instrucciones del repositorio, el plan congelado V1.1, los registros de continuidad y el HEAD remoto. La autoridad histórica F9 se conserva para su release exacto; no se tomó como certificado de la fuente actual.

El plan trazable V1.1 íntegro tiene SHA-256 `83e8f2c0a6b190bab1d9dea32bf99158116f3164f419ae72e051fd791fd8576c`. El orden operativo sigue siendo el [plan de choque congelado del 13 de noviembre](../../CXORBIA_I3_I4_PLAN_CHOQUE_20261113_FROZEN.md), desarrollado en el [checkpoint de ejecución del 15 de noviembre](CXORBIA_I3_PLAN_EJECUCION_Y_ACREDITACION_20261115.md).

La producción final `https://tya-plataforma.web.app/` permanece `DO_NOT_TOUCH`, como LEGACY_ORACLE, hasta I4 con autorización explícita para el artefacto exacto. No se creó otro producto, repositorio, Firebase, rama, candidata o carril de despliegue. Las aprobaciones B4–B7 se conservaron.

## 2. Trabajo que sí había quedado ejecutado antes de la interrupción

### RUN2522: Configuración publicada en DEV

[RUN2522 / 43733581384](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/43733581384) publicó la fuente `c44d93a9f8ee69dbff189acc6f3517de850408d0` por el carril existente de Hosting DEV. El cambio focal de `app/modules/configuracion.js` separó la lectura del tenant protegido del permiso de escritura, para impedir una edición local falsa cuando el gate de comandos está apagado.

El recibo comprobó 20 archivos servidos y Hosting `ca8ed29218ca0d7d`. La prueba focal pasó de 6/8 a 8/8. No hubo despliegue de Cloud Run, cambio de reglas, escritura HR ni despliegue productivo en esa publicación. [Recibo de RUN2522](CXORBIA_I3_Q2_HOSTING_DEV_RUN43733581384_ACK_20261115.json).

### RUN2523: se reparó y demostró el transporte de evidencias de Q2

[RUN2523 / 43734391897](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/43734391897) cerró Q2 con 21/21 dominios con fuente acreditada, cero archivos pendientes, 119/119 pruebas y evidencias de diez archivos responsables de los cambios. C3 comprobó 133 archivos activos del navegador y habilitó el job `certify` de I3-Q3.

El consumidor realmente arrancó y recibió el mismo resultado y recibo del productor. El SHA-256 compartido del recibo fue `4043bee7fb36614e566079ae7416cb1f5ce3a7e56e86afc6efbefd8f20ca1736`. Esto demuestra el cierre del fallo de transporte de evidencias; no equivale a certificación funcional integral.

Se conservaron 4/21 MATCH estrictos y B4–B7 aprobados. El consumidor se detuvo inicialmente en preparación del entorno. [Recibo de cierre Q2](CXORBIA_I3_C3_RUN2523_Q2_CLOSED_Q3_ENABLED_20261115.json).

### RUN2524: se corrigió el entorno de ejecución

El runner `ubuntu-latest` había pasado a Ubuntu 26.04, incompatible con la instalación de dependencias utilizada por Playwright 1.56.1. El job terminal existente se fijó a `ubuntu-24.04`. Este fue un `ENVIRONMENT_FAILURE`; el arreglo no necesitó otro despliegue del producto. [Recibo de la corrección](CXORBIA_I3_RUN2524_TERMINAL_UBUNTU_EXACT_REPAIR_20261115.json).

### RUN2525: Q3 sí llegó a ejecutarse

[RUN2525 / 43735893269](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/43735893269) produjo 90 observaciones de rutas, 56 combinaciones únicas de rol y ruta, 93 capturas y cero errores JavaScript. Pasaron los probes de lectura y la comprobación específica de Paula.

El intento quedó HOLD por cuatro entradas de incidencia:

1. Siete referencias de identidad Admin no acreditadas por el lector de adjudicaciones.
2. La pantalla de indicadores del cliente mostraba `null` cuando faltaba un benchmark verificado.
3. Un representante Shopper se rechazaba por tener cero visitas actuales, aunque HR también indicaba cero.
4. Lo mismo ocurría con la comprobación de Paula.

La evidencia completa se conserva en el [recibo funcional de RUN2525](CXORBIA_I3_RUN2525_TERMINAL_FUNCTIONAL_READBACK_20261115.json).

## 3. Corrección rescatada y ejecutada durante esta reanudación

Había quedado local el commit `c4af8dd178b182f0ae31558161a51e289da9d891`. Se recuperaron sus bytes, se revisó el alcance y se publicó el mismo árbol en la rama canónica como fuente `fdc73f7fe925db9edae1e2f73561f7496c451508`.

Ambos identificadores corresponden al árbol `5bbc8da456c58ce116e6506e6d56bfc0a2c36d33`. El hash del commit cambió al publicarlo con la identidad autenticada; el árbol de archivos se verificó idéntico.

El único archivo de producto afectado fue `app/modules/cliente-insights.js`: utiliza un encabezado neutral si no existe benchmark y conserva los valores verificados, incluido cero. La corrección no inventa un promedio.

Las correcciones de QA se limitaron a leer aliases exactos respaldados por adjudicaciones durables y a comparar los representantes con la expectativa de la misma revisión HR. Se mantuvieron los requisitos de autoridad, ámbito, confirmación y ACK. No se cambiaron identidades para conseguir un PASS.

La reanudación verificó 63/63 pruebas focales y 87/87 comprobaciones de continuidad. Los cambios quedaron registrados antes de activar el despliegue. [Recibo de recuperación](CXORBIA_I3_INTERRUPTED_ITERATION_RECOVERED_20261115.json).

### RUN2526: la corrección quedó servida en DEV

[RUN2526 / 43738661042](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/43738661042) terminó `success` y publicó la fuente exacta por Hosting DEV:

| Elemento | Resultado comprobado |
| --- | --- |
| Fuente | `fdc73f7fe925db9edae1e2f73561f7496c451508` |
| Árbol | `5bbc8da456c58ce116e6506e6d56bfc0a2c36d33` |
| Hosting DEV | `sites/cxorbia-backend-dev/versions/698ddedf91a1f5c5` |
| Release Hosting | `sites/cxorbia-backend-dev/channels/live/releases/1794762159732000` |
| Archivos servidos verificados | 21, incluido `modules/cliente-insights.js` |
| Pruebas de fuente | 122/122; once archivos de implementación vinculados a sus suites |
| Runtime conservado | `cxorbia-live-hr-dev-00370-fl2` |
| Digest runtime | `sha256:396cd23f895a98606fa9ca238132a5515065c07fec632cd73c00cc2e6d6c639e` |
| Publicación Hosting | Una |
| Builds/despliegues Cloud Run | Cero |
| Writes HR/directos Firestore, cambios de reglas y despliegues productivos de este job | Cero |

El ZIP de evidencia se cotejó con el digest publicado por GitHub. Cada uno de los 21 archivos servidos se contrastó de nuevo con los bytes de la fuente exacta. La huella del index productivo antes y después fue la misma: `3b0ba999cd5a1738566f7e195ded2b03995ee369b59be8e594f54ad31e70ac7e`.

[Recibo Hosting RUN2526](CXORBIA_I3_VRM331_HOSTING_DEV_RUN43738661042_ACK_20261115.json).

## 4. RUN2527: resultado real de la repetición del gate

[RUN2527 / 43739435360](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/43739435360) ejecutó C3 y el consumidor terminal sobre la fuente ya servida. No hizo otro build o despliegue.

### Q2 permanece GO en la fuente actual

- 21/21 dominios con fuente acreditada.
- Cero archivos pendientes.
- 133 archivos activos del navegador verificados.
- 122/122 pruebas de fuente y once archivos con evidencia de la misma ejecución.
- El job productor `132889318927` y el consumidor `132889630810` utilizaron exactamente el mismo resultado y recibo.
- SHA-256 del recibo compartido: `fd1acae2d22b5b5a671accc88d0aa1c2139c19c43574cd1596716c5d4d51a933`.

[C3 de la fuente actual](CXORBIA_I3_C3_RUN2527_CURRENT_SOURCE_Q2_GO_20261115.json).

### Qué mejoró frente a RUN2525

| Incidencia anterior | Resultado de RUN2527 |
| --- | --- |
| Encabezado del cliente exponía `null` | Resuelta: ruta visible, sin `null/undefined` ni marcador técnico |
| Representante con cero visitas actuales rechazado | Resuelta: expectativa y resultado HR coinciden en cero |
| Paula rechazada por cero visitas actuales | Resuelta: identidad, histórico, periodo, revisión y rutas correctos |
| Siete referencias de identidad sin acreditación | Una referencia quedó acreditada; permanecen seis |

Los tres representantes pasaron. El recorrido volvió a producir 90 observaciones, 56 combinaciones de rol/ruta, 93 capturas y cero errores JavaScript. Las 17 postulaciones existentes de la vista coincidieron con la lectura durable y no aparecieron postulaciones sintéticas derivadas de HR.

VRM331 queda `PASS_EXACT_SOURCE_HOSTING_DEV_AUTHENTICATED_CLIENT_RENDER_RUN2527` para su defecto concreto. Esta comprobación no concede un nuevo MATCH al dominio completo del portal del cliente.

La ejecución global de RUN2527 concluyó `failure`: el gate se detuvo correctamente por `MAPPING_FAILURE:ADMIN_REAL_SHOPPER_IDENTITY_NOT_RENDERABLE`. El oráculo semántico externo posterior, el finalizador de 21 dominios, Gate20 y Gate21 no se ejecutaron después de ese punto. No corresponde presentar todo el workflow como PASS.

[Recibo completo de RUN2527](CXORBIA_I3_RUN2527_RECOVERY_TERMINAL_READBACK_20261115.json).

## 5. Pendiente exacto: VRM043 y seis referencias de identidad

La incidencia ya existe como VRM043; no se crearon seis defectos ni se reabrió la población completa. Son seis referencias hacia cinco destinos canónicos, porque dos referencias apuntan al mismo destino.

El recibo de adjudicaciones no explica por qué esas seis referencias no entraron en su evidencia. El lector omite ciertos candidatos antes de generar `rejected`; también convierte un ACK ausente en el mismo booleano que un ACK falso. Por ello todavía no está probado si falta autoridad durable, si está en otro recibo o si el lector no consume el campo adecuado.

**Siguiente acción exacta:** hacer una lectura focal, sin mutaciones, de `identityResolutionLinks`, `shopperIdentityCrosswalk` y los recibos durables referenciados para esos seis IDs. Conservar la diferencia entre campos ausentes, falsos y verdaderos; cotejar el alias exacto, el destino, el tenant/proyecto, la autoridad y el ACK remoto.

El archivo responsable de la observabilidad es `tools/qa/cxorbia-i3-terminal-human-contract.mjs`; la aceptación se consume en `RECOVERY-I3-HUMAN-LIVE-ACCEPTANCE-20260918.mjs`. La evidencia actual permite delimitar esa lectura; no justifica relajar la aceptación ni crear asociaciones por semejanza de nombres o por compartir destino.

Los IDs, el alcance y los campos requeridos quedaron en el [scope focal de VRM043](CXORBIA_I3_VRM043_SIX_REFERENCES_READBACK_SCOPE_20261115.json). No hace falta repetir todo el recorrido del navegador para obtener seis registros.

## 6. Qué significan los contadores actuales

| Dimensión | Estado al cierre | Interpretación |
| --- | --- | --- |
| Fuente acreditada | 21/21; GO Q2 | Habilita el consumidor funcional |
| Archivos pendientes de acreditación | 0 | El transporte de evidencias no bloquea Q3 |
| MATCH estricto por dominio | 4/21 | No se elevó por pruebas de fuente o navegación parcial |
| Bloques humanos aprobados | B4, B5, B6, B7; 4/9 | Aprobaciones históricas preservadas |
| Bloques del plan de choque con salida comprobada | 0 y 1; 2/7 | Guard I4 focal y Q2; no es porcentaje de producto terminado |
| I3 / Gate20 / Gate21 | HOLD | Faltan contratos y recibos integrales |
| I4 | HOLD; no autorizado | Producción sin modificación |

Como indicadores de gestión, 21/21 equivale a 100% de acreditación de fuente; 4/21 a 19,05% de MATCH estricto; 4/9 a 44,44% de bloques humanos; 2/7 a 28,57% de los bloques de ejecución congelados. Estos denominadores son distintos y no se suman.

La reducción histórica de cinco a cuatro MATCH corresponde al defecto reproducido VRM330 en `tenant-admin-config-branding`. La corrección de Configuración ya está publicada, pero la recuperación del MATCH exige el recibo funcional correspondiente. No es pérdida de código ni revocación de B4–B7.

### Bloque 0: guard I4 comprobado, sin ejecutar producción

Se ejecutó el script exacto del preflight I4 con Git real en lectura, fixtures sintéticas y red bloqueada: un positivo sintético y quince negativos, **16/16 PASS**. Se rechazaron autorización ausente/incorrecta, evento indebido, huellas o bytes alterados, run fallido, árbol o ascendencia incorrectos, drift de producto y discrepancias de Gate20/runtime.

El script no se modificó. Las trazas, el arnés y las huellas quedaron preservados. Esta prueba no es autorización I4, certificado de release, prueba de IAM, rollback real ni E2E productivo.

[Recibo del guard](CXORBIA_I4_GUARD_FOCAL_VALIDATION_20261115_RECEIPT.json) · [Trazas y arnés](CXORBIA_I4_GUARD_FOCAL_VALIDATION_20261115_TRACES.json).

## 7. Plan completo que sigue vigente

| Orden | Bloque | Estado y salida necesaria |
| --- | --- | --- |
| 0 | I4-P0, entrega del artefacto exacto | GO para el guard focal; pruebas 16/16, sin publicación productiva |
| 1 | I3-Q2, acreditación de fuente | GO actual en RUN2527: 21/21, cero pendientes y consumidor real |
| 2 | I3-Q3, B1–B3 Admin/Shopper/HR | HOLD en VRM043. Resolver su evidencia exacta y completar/reutilizar contratos válidos de login, identidad, disponibilidad, postulación, asignación, histórico, países, ACK, recarga e idempotencia |
| 3 | I3-Q4, B8 Finanzas | HOLD. Cerrar cortes históricos, operaciones individuales/lotes, soporte y conciliación sin falso pagado, con fixtures DEV autorizadas |
| 4 | I3-Q5, B9 y 21 dominios | HOLD. Completar contratos por dominio y rol; preservar B4–B7 cuando los archivos/dependencias sean equivalentes |
| 5 | I3-Q6, Gate20 → Gate21 | HOLD. Exige 21/21 MATCH, cero P0 bloqueantes y artefacto/manifest únicos certificados |
| 6 | I4, sustitución productiva | HOLD. Presentar artefacto concreto, obtener autorización explícita, promover sin rebuild y verificar producción antes de PRODUCTION_LOCK |

Las pruebas de esta reanudación acreditan lectura, sesión, identidad representativa y render. El probe de reservas declara `created:false`, `statusAck:false`, `deleted:false`; no prueba crear, cambiar estado o eliminar. La lectura de postulaciones existentes tampoco demuestra crear/borrar una postulación o que no reaparezca después de eliminarla. Las operaciones de asignación, upsert e idempotencia requieren sus propios recibos.

Los PASS anteriores deben consumirse cuando sus archivos, dependencias y alcance lo permitan. Los registros históricos pendientes del finalizador no se convierten automáticamente en defectos nuevos ni se borran para obtener GO.

## 8. Punto de continuidad para la próxima ejecución

La autoridad actual está en el descriptor canónico, la matriz V311 y el ledger V635, con 331 hallazgos preservados y `VRM-332` como siguiente ID disponible. El trabajo pendiente actual sigue siendo **VRM043**, no un hallazgo nuevo.

- Fuente servida: `fdc73f7fe925db9edae1e2f73561f7496c451508`.
- Hosting DEV: `698ddedf91a1f5c5`.
- Runtime: `cxorbia-live-hr-dev-00370-fl2`, digest conservado.
- Última comprobación funcional: RUN2527; Q2 GO, VRM331 PASS, VRM043 HOLD.
- Siguiente acción: readback focal de las seis referencias y su autoridad/ACK, según el scope enlazado.
- Autorización nueva para continuar ese trabajo DEV: no requerida.
- Autorización I4: no concedida; solicitarla únicamente con Gate20/21 GO y el artefacto exacto listo.

Consultar HEAD remoto antes de la siguiente acción. No regresar al fallo ya corregido de Ubuntu ni a la acreditación fuente 16/21 de RUN2521; preservar el GO Q2 y los resultados funcionales efectivamente comprobados.
