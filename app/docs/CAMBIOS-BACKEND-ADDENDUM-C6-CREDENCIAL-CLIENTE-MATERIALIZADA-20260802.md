# CAMBIOS BACKEND — C6 CREDENCIAL CLIENTE MATERIALIZADA

**Fecha:** 2026-08-02  
**Estado:** `PASS_C6_CLIENT_AUTH_MATERIALIZED_AND_RUNTIME_VALIDATED`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Autorización ejecutada

Paula autorizó materializar en Firebase Auth DEV una única credencial Cliente para:

- tenant `tya`;
- proyecto `cinepolis`;
- `role=cliente`;
- `authNamespace=staff`;
- alcance exclusivo `projectIds=['cinepolis']`.

La autorización excluyó Firestore, HR, Rules, Storage, Hosting, Cloud Run, Make, Gemini, pagos, merge y producción.

## 2. Primer intento y rollback real

El primer intento alcanzó:

- snapshot previo PASS;
- creación de la credencial PASS;
- claims PASS;
- idempotencia PASS;
- readback y sign-in por contraseña PASS.

La prueba del Portal Cliente no completó el ingreso visual porque el formulario unificado llamaba `CX.backendAuth.authenticate()` directamente, pero no ejecutaba `CX.app.enter()` después de autenticar.

La cuenta creada fue eliminada automáticamente y se restauró exactamente el estado previo:

- decisión: `FAIL_C6_CLIENT_AUTH_MATERIALIZATION_ROLLED_BACK`;
- acción: `deleted_created_user`;
- `restoredPreState=true`;
- credenciales/tokens expuestos: 0;
- password changes/resets: 0.

## 3. Corrección de causa raíz

Se actualizó `app/adapters/tya-c6-shopper-auth-click-guard-v1.js` a guards protegidos v2.

El adapter ahora conserva dos responsabilidades estrictamente acotadas:

1. impedir que la tarjeta Shopper protegida use `pickShopperDev()`;
2. completar `CX.app.enter()` únicamente después de que Firebase Auth ya devolvió un contexto Cliente autenticado con namespace `staff`.

No se modificó `app.js`, `app/modules/*` ni la lógica UI del prototipo.

## 4. Segundo intento autorizado

Como el primer intento había restaurado el estado previo, se reejecutó la misma autorización sin ampliar alcance.

### Snapshot

- la identidad objetivo no existía;
- cuentas Cliente válidas para `tya/cinepolis`: 0;
- Auth writes previos: 0.

### Materialización

- credenciales creadas: 1;
- Auth writes: 2 — creación del usuario y escritura de claims;
- claims exactos: PASS;
- cuenta habilitada: PASS;
- sign-in por contraseña: PASS;
- password changes: 0;
- password resets: 0.

### Idempotencia

La segunda ejecución del mismo materializador produjo:

- `PASS_C6_CLIENT_AUTH_IDEMPOTENT_NOOP`;
- Auth writes: 0;
- credenciales nuevas: 0;
- claims writes: 0.

### Readback

- cuentas Cliente válidas antes: 0;
- cuentas Cliente válidas después: 1;
- claims exactos: PASS;
- alcance exclusivo `cinepolis`: PASS;
- sign-in: PASS.

## 5. Prueba humana Cliente

Resultado:

`PASS_C6_CLIENT_AUTH_EXISTING_CREDENTIAL_RUNTIME`.

Comprobado:

- rol `cliente`;
- namespace `staff`;
- tenant `tya`;
- proyecto `cinepolis`;
- 14 periodos;
- 616 visitas;
- junio 2025 a julio 2026;
- periodo activo `cinepolis-2026-07`;
- tres recargas estables;
- nueva pestaña estable;
- cero exposición de credenciales o tokens.

## 6. Rollback exacto

El dry-run comprobó:

- preestado: usuario inexistente;
- estado actual: usuario administrado existente;
- rollback exacto disponible: eliminar únicamente el usuario creado;
- `canRollbackExactly=true`;
- writes ejecutados durante la prueba de rollback: 0.

En cualquier falla anterior al commit de evidencia, el workflow ejecuta el rollback real y restaura el preestado.

## 7. Decisión acumulativa

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

Gates acumulativos cerrados:

- Staff humano;
- Shopper humano con identidad exacta;
- Cliente humano;
- carril técnico Staff/Shopper;
- HR viva dinámica;
- dominio, Finanzas, Portal Shopper y Reservas;
- tres recargas y nueva pestaña para los roles probados;
- idempotencia y readback;
- rollback exacto.

## 8. Evidencia vigente

- `CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json`;
- `CORTE6-CLIENT-AUTH-PREWRITE-SNAPSHOT-LATEST.json`;
- `CORTE6-CLIENT-AUTH-APPLY-LATEST.json`;
- `CORTE6-CLIENT-AUTH-IDEMPOTENCY-LATEST.json`;
- `CORTE6-CLIENT-AUTH-READBACK-LATEST.json`;
- `CORTE6-CLIENT-AUTH-RUNTIME-LATEST.json`;
- `CORTE6-CLIENT-AUTH-ROLLBACK-PROOF-LATEST.json`.

## 9. Estado seguro

- credenciales Cliente creadas: 1;
- Auth writes autorizados: 2;
- password changes/resets: 0;
- Firestore/HR/Rules/Storage writes: 0;
- Hosting/Cloud Run deploys: 0;
- Make/Gemini/pagos: 0;
- credenciales/tokens expuestos: 0;
- merge: false;
- producción: false.

## 10. Siguiente bloque exacto

`ACTUALIZAR FUENTES CANÓNICAS → SOLICITAR AUTORIZACIÓN FRESCA PARA UN ÚNICO DEPLOY DEL HOSTING DEV EXISTENTE → PARIDAD REMOTA → GATE ACUMULATIVO REMOTO STAFF/CLIENTE/SHOPPER → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

No existe autorización vigente para deploy.

## 11. Clasificación

- **Reusable CXOrbia:** materialización idempotente, snapshot, readback, rollback y gate multirol.
- **Exclusivo TyA:** credencial Cliente `tya/cinepolis`.
- **Claude/prototipo:** preservar el enter post-Auth sin mover Auth a módulos UI.
- **Academia:** diferencia entre autenticación exitosa y transición visual completada.
- **Sin impacto proveedor adicional:** fuera de los dos Auth writes expresamente autorizados, todos los demás contadores permanecen en cero.
