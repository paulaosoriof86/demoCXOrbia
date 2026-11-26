# I3 — revisión focal de lectura y consumo

**Estado: HOLD.** Revisión económica y de evidencia para acompañar el correctivo existente. No añade método, gate, compra ni requisito de repetir el ensayo completo de 1.184 créditos. Control revisado: `6fe5b16f`; fuente servida de referencia: `d727f3be`.

## Lo observado

Root inspeccionó el código servido del legado `v5.86.44`: `readGoogleSheets`, `_hrFetchTabV58627` y `_readActiveHRV58627` utilizan Google Sheets values con `cache:no-store`. El intervalo `_HR_ACTIVE_POLL_MS_V58627` es cinco minutos; hay hooks en `enterApp`, `renderVisitas`, `pageshow`, `online` y `visibilitychange`. No se observó una petición HR registrada ni se leyeron datos operacionales o credenciales. Esta inspección estática no certifica frescura, latencia ni escritura del legado, que permanece como oráculo funcional.

Recovery usa los **Excel originales** mediante la conexión OneDrive delegada de Make `9089470`, cuyo acceso ya estaba probado. La evidencia explica reutilización de acceso; no demuestra que Make fuera la alternativa económica óptima. Firestore ya conserva una proyección interna durable y el journal de comandos. Persistir internamente no sustituye el ACK del Excel cuando el campo es bidireccional. Volver al espejo Google obsoleto no es una alternativa autorizada. [Decisión F2](CXORBIA_I3_F2_ORIGINAL_EXCEL_AUTHORITY_OWNER_DECISION_20261122.json) · [Acceso existente](CXORBIA_I3_B14_MAKE_ORIGINAL_HR_INVENTORY_RECEIPT_20261119.json).

A las **20:46:56 de Guatemala del 25/11**, una única llamada `get_drive_item` del conector SharePoint existente al libro original GT devolvió **403 accessDenied**, según readback de root. No hubo retry, impersonación ni extracción de tokens. Prueba falta de acceso de esa identidad a ese recurso en ese intento; no prueba que Graph directo sea imposible ni identifica el permiso concreto faltante.

## Modelo de consumo, sin convertirlo en factura

Dos ejecuciones reales del lector costaron **3 créditos cada una**: `627c075d3fb14881b5f3fcc06314aafb` y `283b1ce28ba7402197f8a31f234438a0`. Los dos GET Graph internos ya están incluidos en esos 3 créditos. [Recibo de costes unitarios](CXORBIA_I3_F3_MAKE_CAPACITY_ESTIMATE_20261125.json).

Supuesto uniforme: una lectura externa completa cada **5 minutos**, **8 horas al día**, **22 días**, una worksheet por binding país-período. Son **96 comprobaciones al día y 2.112 al mes por sesión activa**. Fórmula: usuarios × 2.112 × bindings × 3 créditos.

La ventana aceptada tenía dos meses disponibles, octubre/noviembre, y dos países: **4 bindings**. Si existe el mes siguiente serían tres meses y **6 bindings**. Los períodos antiguos siguen por demanda; se conserva el histórico confirmado de 836 visitas/19 períodos. [Contrato y prueba de ventana](CXORBIA_I3_VRM375_HR_PERIOD_WINDOW_SCOPE_20261124.json).

| Usuarios activos | Lectura por sesión: 4 bindings | Lectura por sesión: 6 bindings | Una sincronización compartida: 4 bindings | Una sincronización compartida: 6 bindings |
|---:|---:|---:|---:|---:|
| 1 | 25.344 | 38.016 | 25.344 | 38.016 |
| 5 | 126.720 | 190.080 | 25.344 | 38.016 |
| 10 | 253.440 | 380.160 | 25.344 | 38.016 |

Cifras en **créditos Make modelados por mes**, sin precio en USD. No afirman consumo real ocurrido. Una petición de metadatos frescos que dispara el refresh ya es esa lectura contabilizada: no sumar otra lectura HR para el mismo refresh. El coste completo de 3 créditos tampoco se multiplica por sus dos GET. Inventarios independientes sólo se cuentan adicionalmente si se ejecutan. Coalescencia/caché pueden reducir el resultado; entradas, hooks, comandos, refrescos manuales y reintentos pueden aumentarlo.

## Objetivo dentro del owner existente

Conservar comprobación compartida de **cinco minutos**, una HR interna durable y protegida para todos los módulos, y refresco manual explícito con revisión/fecha/frescura visibles. **No se eligió ralentizar a una hora.** Work publicó la corrección de recuperación con inventario frío y lectura compartida en `ca946220`, con 280 pruebas PASS; está pendiente de DEV. El intervalo compartido del backend es cinco minutos y su exclusión entre instancias usa Firestore. La comprobación se activa por peticiones de sesiones elegibles, sin un programador autónomo que garantice latencia cuando no haya clientes visibles. Work mantiene el F3 acotado; la orden vigente exige eliminar lecturas redundantes sin retirar comprobaciones estrictas. [Orden Work](CXORBIA_I3_WORK_ORDER_HR_DELTA_20261125.md).

Graph directo queda condicionado a acceso delegado realmente disponible y autorizado. El `GET driveItem` admite `If-None-Match` y respuesta 304 cuando coincide el tag; puede servir para comprobar metadatos antes de releer rangos necesarios. No equivale a push por celda ni demuestra soporte condicional de los rangos Excel. Los endpoints de rangos y worksheets requieren permisos delegados `Files.ReadWrite`; no admiten permisos de aplicación. No basta una service account Google ni extraer un token de Make. [Metadatos condicionales](https://learn.microsoft.com/en-us/graph/api/driveitem-get?view=graph-rest-1.0) · [Rangos](https://learn.microsoft.com/en-us/graph/api/range-get?view=graph-rest-1.0) · [Worksheets](https://learn.microsoft.com/en-us/graph/api/workbook-list-worksheets?view=graph-rest-1.0).

Si el transporte independiente de lectura pasa completamente a Graph directo, su consumo Make sería **0 créditos de lectura**; eso no significa infraestructura gratuita ni elimina las inspecciones del writer. Mantener ACK, lectura independiente, idempotencia, concurrencia y comprobación fresca necesaria antes de escribir. Mientras falta acceso directo probado, conservar el proveedor válido y compartir las lecturas; no bloquear otros cierres por una migración OAuth.

## Avance y límites de este corte

- Root ejecutó **14 pruebas focales aprobadas** del parche de refresco manual en `app/modules/visitas.js`; el parche queda preparado y probado fuera de la candidata activa. [Prueba reproducible](CXORBIA_I3_MANUAL_HR_REFRESH_PROOF_20261125.json). No es una publicación DEV.
- `221a687e` añade observaciones **offline** Shopper/Cliente y E10; no acredita nuevas sesiones Firebase, ACK remoto o persistencia de importación. [Recibo](CXORBIA_I3_D08_E10_COMPONENT_READBACK_20261125.json).
- Root confirmó a las **20:53:39 de Guatemala** cero ejecuciones del lector/escritor Make observado desde **20:34 de Guatemala**. Esta revisión tampoco ejecutó escenarios.
- `fb7f8028` implementa el F3 acotado a GT/escenario/L2 y registra 267 pruebas técnicas PASS. La confirmación remota sigue pendiente en ese recibo. [Implementación F3](CXORBIA_I3_F3_BOUNDED_QA_IMPLEMENTATION_20261125.json).
- El transporte F3 exige `CURRENT_SOURCE_SERVING` y candidata igual a `d727`. Work conserva explícitamente el productor QA `fb7f8028` para F3 sobre `d727`, mientras prepara el sucesor compartido `ca946220`. Este paquete deja el parche manual listo para la admisión controlada en el mismo historial; no modifica la fuente activa, los controles ni las ejecuciones ya vinculadas.
- B14 y fase A permanecen **HOLD**. Continúan los owners y la orden existentes; no se reabren PASS ni se exige el recorrido completo de 1.184 créditos. No se compraron créditos ni se activaron compras automáticas.

Este documento y su JSON separan hechos observados, reportes de root y estimaciones; no son un certificado funcional.
