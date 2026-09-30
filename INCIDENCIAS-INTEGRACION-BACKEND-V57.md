# INCIDENCIAS-INTEGRACION-BACKEND-V57.md

## 2026-06-30 - Estado despues de B2/B3

- El ZIP V57 fue localizado en `C:\Users\paula\Downloads` y usado para portar/comparar `/app`.
- La copia V57 no dejo diferencias visuales adicionales en `app/index.html` ni `/app/modules`.
- El preview backend se mantiene separado en `app/index-backend-dev.html`.
- El adapter global no se activo en `app/index.html`.
- Se elimino la ruta de prompt de navegador para credenciales DEV.
- Las reglas para `bulletins`/`bulletinReads` quedaron preparadas localmente, pero no publicadas.
- El emulador Firestore no pudo validar reglas porque Java no esta disponible en PATH.
- No documentar para Claude errores derivados de `index-backend-dev.html`; Claude debe recibir solo errores visuales reales de V57.

Incidencias o riesgos de integración backend/local detectados al recibir V57. No son pendientes de Claude salvo que indiquen error visual/prototipo.

## 1. V57 aún es demo/localStorage

`app/index.html` no carga backend. Esto es correcto para prototipo, pero producción no puede salir desde ahí como operativa real.

Acción backend:

- Crear/portar `app/index-backend-dev.html` sobre V57.
- Cargar backend solo en preview.

## 2. Auth DEV pendiente en preview anterior

Se mantiene regla:

- No pedir datos sensibles temporales a Paula.
- No compartir credenciales en ChatGPT.
- No usar prompt de navegador.
- Resolver con flujo local/no versionado o control seguro.

## 3. Nuevos roles requieren reglas

V57 agrega `coordinador` y `aliado` con `scopeCountry`. Las reglas Firestore y claims deben ampliarse para:

- `countryScope` o países asignados;
- `projectIds`;
- `tenantId`;
- `role`.

## 4. Storage pasa a ser bloqueante

V57 usa logos, recursos, manuales y archivos embebidos. Para producción, localStorage/base64 no basta.

Acción backend:

- Storage para logos, recursos, evidencias, manuales y documentos.
- Firestore guarda metadata/URL.

## 5. Riesgo IA en cliente

`CX.ai.ask` puede hacer llamadas reales desde frontend si se configura así. Para producción comercial, evaluar función backend/proxy para proteger configuración privada.

## 6. Posible carácter roto

Archivo: `app/modules/aprendizaje.js`.

Hallazgo: fallback de icono contiene posible carácter roto.

Acción: revisar con Claude si el archivo se usa. Si se usa, corregir en prototipo V58.

## 2026-06-30 22:20:17 - Incidencia corregida: falso OK y reglas faltantes
- Incidencia: bloques anteriores reportaron exito aunque el validador imprimia "ok": false.
- Causa: el flujo PowerShell no estaba deteniendo correctamente por contenido "ok": false y/o exit code.
- Correccion: el bloque actual valida exit code, busca "ok": true, bloquea "ok": false y exige que irestore.rules aparezca modificado antes del commit.
- Incidencia funcional: irestore.rules tenia ulletins, ulletinReads, utomations, pero faltaban utomationLogs, integrationSettings, iSettings, iLogs,
esources.
- Estado: corregido en rama
elease/cxorbia-tya-rc-20260630, sujeto a commit/push si todas las validaciones pasan.

## 2026-06-30 22:26:21 - Incidencia: git diff --check bloqueado por CRLF
- Sintoma: git diff --check detuvo el flujo por warning de LF/CRLF en CAMBIOS-BACKEND.md.
- Causa: configuracion local de Git con autocrlf/safecrlf generaba warning de conversion, no un error real de reglas.
- Correccion: configurar Git local en este repo con core.autocrlf=false, core.safecrlf=false, core.eol=lf y repetir validaciones.
- Prevencion: los bloques deben capturar exit code real, no tratar warnings de saltos de linea como exito ni como fallo ambiguo.
- Estado esperado: commit/push solo si rules coverage ok:true, preview static ok:true, firestore.rules staged y git diff checks pasan.

## 2026-06-30 22:29:01 - Incidencia corregida: wrapper PowerShell llamo Git sin comando
- Sintoma: git mostro pantalla de ayuda durante git diff --check.
- Causa: funcion wrapper PowerShell uso argumento reservado/conflictivo y llamo Git sin pasar correctamente el subcomando.
- Correccion: ejecutar Git directo, sin wrapper intermedio.
- Estado: pendiente commit/push en este mismo bloque si validadores pasan.
- Prevencion: no usar wrappers genericos con variable Args para comandos criticos.

## 2026-06-30 22:36:46 - Incidencia corregida: trailing whitespace en documentos
- Sintoma: git diff --check fallo por trailing whitespace en documentos y firestore.rules.
- Causa: documentos acumulados con espacios finales y cambios de line ending durante bloques previos.
- Correccion: normalizar archivos tocados a UTF-8 sin BOM, LF y sin espacios finales.
- Prevencion: todo bloque futuro debe limpiar whitespace antes de stage/commit.
- Estado: se revalida coverage ok:true y preview static antes de commit/push.

## 2026-06-30 22:40:01 - Incidencia corregida: falso negativo staged firestore.rules
- Sintoma: el reporte mostro irestore.rules en staged, pero el bloque concluyo que no estaba staged.
- Causa: validacion por regex demasiado fragil sobre texto convertido con Out-String.
- Correccion: validar git diff --cached --name-only como arreglo, aplicando Trim() y comparacion exacta.
- Estado: se reintenta commit/push sin modificar frontend ni reglas de negocio.

## 2026-06-30 23:13:34 - Resuelto: no pedir claves para Auth preview
- Incidencia: el script existente pedia CXORBIA_DEV_SECRET/CXORBIA_DEV_PASSWORD.
- Decision: no pedir claves a Paula ni pegarlas en chat.
- Correccion: generar credencial DEV ficticia local, actualizar usuarios ficticios DEV y crear helper local ignorado.
- Restricciones respetadas: no deploy, no merge, no produccion, no datos reales, no /app/modules.

## 2026-06-30 23:38:12 - Incidencia local: preview abierto sin servidor
- Sintoma: Chrome mostro ERR_CONNECTION_REFUSED en 127.0.0.1:5184.
- Causa probable: el proceso servidor local no quedo escuchando en el puerto indicado.
- Correccion: iniciar servidor por proceso controlado, validar HTTP 200 y solo despues abrir navegador.
- Estado: se ejecuta en este bloque.
- Restricciones: no deploy, no merge, no produccion, no datos reales, no /app/modules.

## 2026-06-30 23:44:28 - Incidencia corregida: Python no disponible para preview local
- Sintoma: servidor local anterior cerro con codigo 9009 y Chrome mostro ERR_CONNECTION_REFUSED.
- Causa: python -m http.server no estaba disponible correctamente en PATH.
- Correccion: servidor estatico local con Node fuera del repo.
- Restricciones respetadas: no deploy, no merge, no produccion, no datos reales, no /app/modules.
- Siguiente: smoke Firestore, tenant isolation y module render smoke CXOrbia.

## 2026-07-01 00:45:35 - Smoke Backend V58 Node
- Se sincronizaron commits documentales V58 desde GitHub.
- Se parcheo localmente firestore.rules para eliminar helpers indefinidos en bloques V57 y agregar list explicito en projects para operadores.
- Validadores V57 OK.
- Auth DEV OK sin imprimir secretos.
- Tenant isolation ejecutado.
- Preview Node robusto con HTTP 200: True.
- Module render smoke ejecutado: True.
- No deploy, no produccion, no datos reales, no /app/modules.