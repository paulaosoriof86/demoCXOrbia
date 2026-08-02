# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_RUNTIME_PASS_EXCEPT_CLIENT_CREDENTIAL__HOLD_NO_AUTH_WRITE`

## 1. P0 bloqueante único

Materializar y validar una credencial Cliente DEV con claims correctos para tenant `tya` y proyecto `cinepolis`.

La búsqueda read-only comprobó que no existe actualmente una credencial utilizable. Crear o resetearla implica Auth write y requiere autorización específica.

Hasta entonces no hay freeze, deploy, agosto, postulaciones, merge ni producción.

## 2. Gates cerrados

PASS:

- gate estático acumulativo;
- HR viva dinámica desde junio 2025 hasta julio 2026;
- dominio, Finanzas, Portal Shopper y Reservas;
- Staff humano autenticado;
- Shopper humano autenticado con identidad exacta;
- carril técnico Staff/Shopper aislado;
- tres recargas y nueva pestaña;
- ruta integrada Cliente Usuario + Contraseña;
- Cinépolis delegado, regalías 0 y Q60/L200;
- ingreso delegado separado del honorario Shopper.

## 3. Root fixes aplicados

- guard de clic temprano antes del wrapper oficial de Auth;
- guard específico para impedir `pickShopperDev()` en la tarjeta Shopper protegida;
- formulario técnico estable `cxDevEntryAuth`;
- metadata `technical-auth-e2e-isolated`;
- modelo financiero Local/Delegado/Regional/Unconfigured;
- guard de comisión delegada fail-closed.

## 4. Evidencia del HOLD Cliente

- registros candidatos examinados: 4;
- usuarios Auth existentes relacionados: 3;
- claims válidos Cliente para `tya/cinepolis`: 0;
- hashes válidos: 0;
- sign-ins Cliente: 0;
- Auth writes: 0;
- cambios/resets de contraseña: 0.

Decisión:

`HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND`.

## 5. Siguiente bloque técnico condicionado

Con autorización específica:

1. snapshot de usuarios/claims Cliente;
2. materialización de una única credencial Cliente DEV;
3. claims `role=cliente`, `authNamespace=staff`, `tenantId=tya`, alcance `cinepolis`;
4. idempotencia;
5. Auth humana Cliente;
6. tres recargas y nueva pestaña;
7. readback;
8. rollback exacto probado;
9. gate acumulativo completo;
10. evidencia PASS/FAIL.

No crear cuenta ni resetear contraseña por inferencia.

## 6. Pendientes Claude/prototipo por archivo

### `app/modules/proyecto-wizard.js`

- agregar opción `Regional`;
- conservar directo/delegado;
- ocultar regalías para delegado/regional;
- no duplicar contratos backend.

### `app/modules/finanzas.js`

- sustituir el texto “honorario recibido menos lo pagado al shopper”;
- explicar comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no volver a usar `pickShopperDev()` en una ruta protegida;
- cualquier cambio frontend debe pasar el gate multirol.

## 7. No reabrir

- no nueva candidata, rama o PR;
- no nuevo Firebase o Hosting;
- no restauración manual de pantallas;
- no bypass de Auth por estar en DEV;
- no dedupe por nombre/teléfono;
- no regalías globales;
- no clasificación por nombre;
- no honorario Shopper como ingreso delegado;
- no comisión/reparto inventados;
- no PowerShell para Paula;
- no deploy por ensayo.

## 8. P1/P2 después del P0

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto con fuente real;
- optimización de carga;
- refinamiento de review queue y certificaciones.

## 9. Agosto

Paula agregará agosto solo después del freeze de Corte 6. El sistema debe detectarlo desde HR y nunca crearlo por fecha del sistema.
