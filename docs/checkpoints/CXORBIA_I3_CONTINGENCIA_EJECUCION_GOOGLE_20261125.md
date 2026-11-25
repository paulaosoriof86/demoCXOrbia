# Publicación mientras se regulariza GitHub Actions — 25 de noviembre de 2026

## Solicitud y resultado de la revisión

Paula pregunta qué se puede hacer para publicar mientras soluciona la facturación de GitHub. La revisión es de viabilidad: **no se ha ejecutado otro build, despliegue, prueba remota ni cambio IAM** por esta consulta. I3 permanece `HOLD` y producción `DO_NOT_TOUCH` hasta I4 y autorización del artefacto certificado.

Se volvió a leer la rama remota y se confirmó el control `35ec041b5ee3304513daf70b059d0bb9407e4dd7`, con fuente aprobada `8d70a09d1c58d31f5f4b0926f519bb7ac6695749` y DEV todavía servido por `1691a76a7bc095ad4bf444aa0db76df2f359a5f0`. Son identidades de este corte, no nuevos punteros permanentes.

**Alternativa identificada:** ejecutar los comandos del mismo despliegue emparejado desde Google Cloud Shell, usando el proyecto, servicio, fuente y destino existentes. GitHub conservaría fuente y evidencia; la construcción remota y publicación se ejecutarían en Google. No crear otra candidata, repositorio, Firebase, rama ni workflow.

## Qué ya es reutilizable

El job existente `vrm154-156-dev-materialization` construye mediante Cloud Build, actualiza Cloud Run y publica Firebase Hosting. La construcción ya es remota y no requiere Docker local.

- Proyecto DEV: `cxorbia-backend-dev`.
- Servicio: `cxorbia-live-hr-dev`, región `us-central1`.
- Hosting target existente: `cxorbia-dev`.
- URL DEV: `https://cxorbia-backend-dev.web.app`.
- Fuente: extracción exacta de la aprobada con `git archive`, no despliegue del HEAD completo.
- Pruebas y autoridad: `tools/qa/cxorbia-i3-paired-source-checks.sh`.
- Predecesor: `tools/qa/cxorbia-i3-f2-predeploy-proven-predecessor.mjs`.
- Build: `backend/runtime/hr-live-service/cloudbuild.yaml`.
- Runtime: `tools/release/cxorbia-i3-update-dev-runtime.sh`.
- Sellado/readback: `tools/qa/cxorbia-i3-paired-dev-seal.sh`.
- Ventana e histórico: scripts existentes `cxorbia-i3-hr-period-history-seed.mjs` y `cxorbia-i3-hr-period-window-dev-readback.mjs`.

F3 cambia dos owners del backend. Publicar únicamente archivos de Hosting no aplica esa reparación. La publicación debe conservar la correspondencia de runtime, digest, Hosting, archivos servidos y HR.

## Requisitos pendientes antes de ejecutar

1. **Acceso Google comprobado.** En el entorno local de esta revisión no están instalados gcloud/Firebase ni se encontraron credenciales ADC o Firebase en las ubicaciones y variables habituales consultadas. Esto no demuestra que Paula carezca de permisos en Google. La conexión del navegador respondió que requiere el contexto del navegador de origen; no fue posible inspeccionar una sesión Google desde esa conexión.
2. **Permisos para publicar y para probar.** Verificar Cloud Build, Cloud Run y Hosting. Las pruebas autenticadas usan Firebase Admin y creación de tokens QA; una sesión de usuario Google no acredita automáticamente la identidad de servicio o su capacidad de firma. No extraer secretos de Actions ni generar claves permanentes por rutina.
3. **Adaptar el inicio y la procedencia de la ejecución.** Los comandos actuales transportan variables por GITHUB_ENV/GITHUB_WORKSPACE/RUNNER_TEMP. El preflight consulta runs y journals mediante GH_TOKEN. Estas dependencias deben resolverse con la autoridad real del nuevo ejecutor, no con IDs inventados.
4. **Conservar el histórico aceptado.** El script actual recupera el artefacto `14934489092` y valida sus hashes. Si se entrega el mismo archivo mediante el conector, comprobar metadata/digest/snapshot y reutilizar la conservación idempotente existente. No reconstruir ni reimportar datos operacionales.
5. **Recibo externo verificable.** El normalizador actual exige run/job/attempt/artifact reales de Actions. Una ejecución Google debe acreditar su build ID, estado, digest, revisión Cloud Run, versión Hosting y evidencia con hash. Adaptar su incorporación en los controles existentes antes de desplegar; no simular un SUCCESS de GitHub ni dejar la versión servida sin registrar.

La alternativa es técnicamente viable, pero **no existe hoy un comando externo listo que cumpla por sí solo esos cinco requisitos**. No informar que ya fue habilitada o que ya se publicó.

## Secuencia de continuación

Primero comprobar acceso Google en Cloud Shell, antes de invertir en la adaptación del ejecutor. Si los permisos existen, reutilizar los runners de Finanzas y Academia sobre la fuente servida `1691`, respetando sus solicitudes actuales. A continuación completar la procedencia externa y ejecutar el despliegue emparejado de la fuente aprobada, verificar sus bytes y registrar su recibo antes de las escrituras F3. La siguiente acción se resuelve otra vez desde el HEAD vivo.

Si GitHub se restablece antes, el rerun exacto de RUN2787 ya documentado sigue disponible; no crear una segunda publicación en paralelo.

La salida productiva conserva los contratos y la autorización I4. Su verificador actual también requiere un Gate21 de GitHub real; una futura ejecución externa de certificación/I4 necesitaría procedencia equivalente comprobable. Cambiar de ejecutor no acredita procesos ni autoriza el reemplazo productivo.

## Fuentes oficiales consultadas

- Firebase Cloud Shell: https://firebase.google.com/docs/cloud-shell — CLI preinstaladas y autenticación con la cuenta de la consola.
- Autorización temporal de Cloud Shell: https://docs.cloud.google.com/shell/docs/auth.
- Publicación Cloud Run desde código: https://docs.cloud.google.com/run/docs/deploying-source-code.

Intervención mínima de Paula, si la conexión vuelve a estar disponible: abrir el proyecto Google existente y autorizar la sesión de Cloud Shell cuando Google lo pida. El trabajo técnico continúa con la autorización DEV ya vigente. No solicitar contraseñas, tokens o archivos de cuenta de servicio en el chat.
