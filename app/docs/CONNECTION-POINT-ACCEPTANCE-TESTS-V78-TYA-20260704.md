# Connection point acceptance tests V78 TyA

Fecha: 2026-07-04

## Proposito

Definir pruebas de aceptacion para el punto unico de conexion futuro entre `CX.data` y el backend adapter.

## Pruebas antes de conectar

| Prueba | Resultado esperado |
|---|---|
| Archivo no importado en estado disabled | No altera el prototipo |
| `status()` | Devuelve estado disabled o unavailable |
| `resolveSource('demo')` | No rompe y reporta fuente solicitada |
| `resolveSource('local')` | No rompe y reporta fuente solicitada |
| `resolveSource('backend-dev-preview')` | No habilita backend mientras este disabled |
| `canUseBackendPreview()` | Devuelve false mientras no exista autorizacion |
| Modulos existentes | Siguen usando `CX.data` actual |
| Dashboard | No cambia visual ni datos visibles |
| Visitas | No cambia visual ni datos visibles |
| Shoppers | No cambia visual ni datos visibles |
| Postulaciones | No cambia visual ni datos visibles |
| Fallback | No rompe navegacion si backend esta unavailable |

## Pruebas cuando se autorice conexion futura

1. Fuente local permanece igual.
2. Fuente demo permanece igual.
3. Fuente backend DEV preview solo lee rutas preview.
4. Las acciones de cambio siguen bloqueadas salvo autorizacion especifica.
5. Las respuestas conservan forma compatible.
6. Todos los datos tienen tenantId, projectId y batchId cuando vienen de DEV preview.
7. El usuario no ve errores tecnicos crudos.

## Estado

- Pruebas documentales.
- Sin cambios visuales.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
