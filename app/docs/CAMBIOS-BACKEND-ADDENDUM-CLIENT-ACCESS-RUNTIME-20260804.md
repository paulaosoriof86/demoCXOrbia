# CAMBIOS BACKEND — Acceso Cliente y runtime Phase A

**Fecha:** 2026-08-04  
**Estado:** `FINAL_RUNTIME_RETRY_CONSUMED_FAIL__CLIENT_PORTAL_ROUTE_ASSERTION__ROLLBACK_EXACT_PASS__NO_PRODUCTION`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Alcance autorizado

Paula autorizó una única reejecución final DEV para:

- identidad Cliente canónica existente;
- snapshot sanitizado;
- máximo un membership write y, solo si era necesario, un claims write;
- idempotencia y readback;
- runtime acumulativo Staff, Cliente y Shopper;
- tres recargas y nueva pestaña;
- HR dinámica, Finanzas, portales y Reservas;
- conservación del membership solo con PASS completo;
- rollback automático ante cualquier fallo.

Quedaron prohibidos usuarios nuevos, cambios o resets de contraseña, deploy, Hosting, Cloud Run, Firestore de negocio, HR, Rules, Storage, Make, Gemini, pagos, merge y producción.

## 2. Solicitud one-shot

Se consumió exactamente una solicitud:

- request: `c6-client-access-repair-runtime-20260804-final-01`;
- authorization: `C6_CLIENT_ACCESS_FINAL_RUNTIME_RETRY_20260804`;
- parent autorizado: `181f19615385cd7dbd70f225f1b8e756a93a96dc`;
- commit de autorización: `a6a7f984aae362d465e6070660f480217511e1e1`;
- commit de evidencia: `56c71b796d58cf0429d87bc09d226b725c6d20ff`.

La solicitud quedó `consumed_fail`, `enabled=false`, `consumed=true`. No existe autorización reutilizable.

## 3. Resultado

Decisión:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

La ejecución avanzó hasta:

- identidad Cliente exacta;
- snapshot;
- membership temporal;
- idempotencia;
- readback;
- selección Staff/Shopper/Cliente;
- autoridad HR dinámica;
- paridad remota;
- runtime Staff/Shopper;
- runtime Cliente;
- gate de dominio/Finanzas/portales/Reservas.

El fallo ocurrió en:

`client_assertions → CLIENT_PORTAL_INVALID`.

## 4. Causa raíz comprobada

La aserción del gate era compuesta:

```text
client.clientModule && client.panorama && !client.blocked
```

El propio flujo previo ya había probado:

- módulo canónico `cli_dashboard` cargado durante las aserciones Staff;
- acceso Cliente autenticado;
- app activa;
- HR y contexto con paridad;
- ausencia de los estados bloqueados comprobados por el smoke Cliente.

Por estructura del gate y por los PASS inmediatamente anteriores, la condición residual no satisfecha fue la expectativa de que la vista abierta después del login contuviera uno de estos textos:

- `Panorama`;
- `Operación del periodo`;
- `Resultados de evaluación`.

El gate no navega explícitamente a `cli_dashboard`; asume que la pantalla posterior al login ya es el Portal Cliente y utiliza copy visible como prueba de ruta. Por ello, el fallo no demuestra pérdida de datos, ausencia del módulo ni fallo de Auth. Demuestra una aserción de ruta/copy no aislada.

La evidencia pública no preservó los tres booleanos por separado; esta identificación es una inferencia determinística sustentada en el orden de PASS y en el código de la aserción, no una captura directa de `client.panorama=false`.

## 5. Owner y solución exacta

**Owner:** gate runtime, no UI ni proveedor.

Archivo focal:

`tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`.

Corrección fuente requerida antes de cualquier ejecución futura:

1. navegar explícitamente a la ruta canónica `cli_dashboard` después del login Cliente;
2. esperar el render de esa ruta;
3. registrar por separado `clientModule`, `route`, `panorama` y `blocked`;
4. validar un selector/marker estable del módulo, no solamente copy incidental;
5. conservar las validaciones de Auth, membership, HR, proyecto y paridad;
6. ejecutar solo un gate source-only/local antes de solicitar otra escritura DEV.

No se aplicó esta corrección en el macrobloque consumido porque la autorización ordenó detenerse ante cualquier fallo y prohibió otro reintento.

## 6. Rollback exacto

Resultado:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado restaurado:

- `restoredPreState=true`;
- claims writes finales: 0;
- membership temporal eliminado: 1 write de rollback;
- identidad Auth creada: 0;
- password changes: 0;
- password resets: 0;
- Firestore de negocio: 0;
- HR/Rules/Storage: 0;
- Hosting/Cloud Run: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 7. Evidencia

- `app/docs/evidence/CORTE6-CLIENT-ACCESS-RUNTIME-FAILURE-LATEST.json`;
- `backend/config/corte6-client-auth-materialization-request.json`;
- commit `56c71b796d58cf0429d87bc09d226b725c6d20ff`.

## 8. Estado Phase A

Preservado:

- source/static PASS;
- 29 autoridades cerradas;
- HR dinámica;
- Staff y Shopper;
- identidad Cliente canónica;
- Finanzas y Reservas sin writes;
- producción intacta.

No cerrado:

- PASS final del Portal Cliente dentro del gate acumulativo.

## 9. Siguiente bloque exacto

```text
SOURCE-ONLY ROOT FIX DEL GATE CLIENTE
→ NAVEGACIÓN EXPLÍCITA A cli_dashboard
→ EVIDENCIA BOOLEANA SEPARADA
→ GATE LOCAL/ESTÁTICO SIN PROVIDER WRITES
→ DETENERSE PARA NUEVA AUTORIZACIÓN
```

No corresponde reintentar el runtime con la autorización consumida.

## 10. Clasificación

- **Reusable CXOrbia:** navegación explícita y aserciones observables por condición.
- **Exclusivo cliente:** membership `tya/cinepolis`.
- **Cloud/prototipo:** sin impacto; Cloud permanece frontend-only.
- **Academia:** diferenciar Auth, membership, ruta renderizada y copy de pantalla.
- **Sin impacto frontend:** no se modificó `app/`.
