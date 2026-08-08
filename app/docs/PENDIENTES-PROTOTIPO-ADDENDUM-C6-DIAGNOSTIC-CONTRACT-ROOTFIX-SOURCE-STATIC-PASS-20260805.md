# PENDIENTES PROTOTIPO — C6 diagnostic-contract root fix source/static PASS

## Pendiente real

Una nueva autorización provider read-only debe regenerar:

- las tres métricas de completitud;
- los vectores source-safe de los HOLD;
- el vector y margen del multi-Auth;
- la reconciliación de grupos por `shopper-visible-login-group-v1`;
- el plan no superpuesto de 340 filas.

## Gates de la próxima lectura

- `preConsensus = completedByConsensus + remaining`;
- crosswalk `101/8`;
- plan `340`;
- cero UID, correo, nombre, login o contraseña crudos en artifacts;
- cualquier HOLD residual aplica STOP_RETRY;
- cero aplicación parcial.

## No autorizado

Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, Make, Gemini, pagos, merge y producción.

No existen pendientes frontend derivados de este bloque.
