# Estado lectura HR, historico y logicas TyA

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Respuesta ejecutiva

No quedo en el olvido. El problema original era real: la lectura de la Hoja de Ruta y del historico por meses/tabs no era suficientemente completa cuando se intentaba leer desde el prototipo o desde exportaciones parciales. Por eso se incorporaron fuentes y logicas de la plataforma actual/obsoleta, donde la HR ya estaba siendo interpretada de forma util para la operacion.

Estado actual:

- Las logicas TyA/Cinepolis ya fueron entendidas y documentadas.
- La HR viva se reanclo como fuente de verdad operativa.
- El historico fue mapeado para migracion controlada.
- La RTDB anterior complementa shoppers, postulaciones, notificaciones y trazabilidad.
- La lectura multi-tab completa ya tiene herramienta backend local preparada por XLSX/export, pero aun falta prueba local final contra la fuente privada real y autorizada.
- Todavia no se puede afirmar que todos los meses/tabs vivos ya fueron leidos perfectamente en ejecucion final, porque falta ejecutar el flow check privado con la URL real local y revisar el reporte generado.

## Que ya se corrigio respecto al problema original

### Antes

- Lectura parcial de HR.
- Riesgo de leer un solo mes, un solo gid o tabs incompletos.
- Riesgo de que el prototipo asumiera datos demo/localStorage.
- Logicas operativas dispersas entre HR, RTDB y plataforma anterior.

### Ahora

- HR viva es fuente de verdad para visitas, fechas, cuestionario, submitido y base de liquidaciones.
- V6 normaliza historico para migracion.
- V7.1 complementa trazabilidad RTDB.
- Se incorporo parser/preview multi-tab por XLSX local.
- Endpoint DEV puede combinar staging preview + señales live.
- UI V75 muestra flujo `sourceRef` opaco y no promete importacion.

## Estado tecnico de lectura HR

### Lectura single-gid / CSV

Disponible como fallback. No es suficiente para historico completo si la HR usa multiples tabs/meses.

### Lectura XLSX multi-tab

Preparada con:

- `tools/hr-source/tya-hr-source-xlsx-lite.mjs`
- `tools/hr-source/tya-hr-source-multitab-preview.mjs`
- integracion en `tools/hr-source/tya-hr-source-dev-server.mjs`

Objetivo:

- descargar workbook XLSX,
- detectar hojas,
- contar filas,
- contar columnas,
- leer encabezados,
- reportar tabs/periodos,
- no escribir Firestore.

### Endpoint DEV

Preparado para:

- `test`,
- `preview`,
- `sync-request`,
- mantener `canImport=false`,
- bloquear sincronizacion,
- combinar staging preview con live HR.

## Estado de logicas entendidas

Preservadas:

- cada fila HR representa una visita planificada u operativa,
- sin shopper asignado = pendiente por asignar,
- shopper asignado sin fecha programada = pendiente por agendar,
- fecha programada sin realizada = agendada,
- fecha realizada sin cuestionario = pendiente cuestionario,
- cuestionario sin submitido = pendiente submitido TyA,
- submitido habilita liquidacion candidata,
- liquidado requiere cruce financiero antes de definitivo,
- Q1 y Q2 no son equivalentes,
- Q2 depende de Q1 realizada/submitida cuando aplica,
- `Disponible desde` debe ser dinamico,
- Honduras normalmente tiene 10 visitas,
- JUNIO 26 HN con 11 filas queda en revision,
- Julio 2026 queda como preparacion, no historico cerrado.

## Que falta para poder afirmar lectura completa final

Falta ejecutar una prueba local guiada contra la fuente privada real:

1. Registrar la URL HR solo localmente.
2. Obtener `sourceRef` opaco.
3. Ejecutar `tya-hr-source-dev-full-check.mjs`.
4. Confirmar que detecta todos los tabs/meses esperados.
5. Confirmar filas por pais/periodo.
6. Comparar contra conteos esperados.
7. Marcar diferencias como `review_required`, no importar.

## Decision de trabajo

No saltar de plan. El siguiente bloque correcto es cerrar esta validacion de lectura HR/historico antes de escritura DEV.

Mientras no se valide:

- no importacion,
- no Firestore writes,
- no deploy,
- no produccion,
- `canImport=false`.

## Ruta agil inmediata

### Bloque 1 - Validacion de lectura HR multi-tab

Preparar y ejecutar flow check local contra fuente privada.

### Bloque 2 - Reporte de cobertura historica

Documento esperado:

- tabs detectados,
- filas por tab,
- columnas por tab,
- encabezados,
- meses/paises reconocidos,
- diferencias vs esperado,
- registros en revision.

### Bloque 3 - Staging canonico

Una vez validada la lectura:

- generar staging canonico importable,
- separar historico/importable/revision/descartado,
- mantener trazabilidad completa.

### Bloque 4 - Runner DEV auditado

Solo despues de staging canonico y bloqueantes resueltos:

- runner dry-run,
- runner write bloqueado por autorizacion,
- rollback plan.
