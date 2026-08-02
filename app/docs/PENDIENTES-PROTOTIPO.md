# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_AUTH_RUNTIME_ALL_ROLES_PASS__PENDING_FRESH_DEV_DEPLOY_AUTHORIZATION`

## 1. P0 bloqueante actual

No queda pendiente una credencial Cliente.

El único bloqueante para continuar Corte 6 es obtener autorización fresca para un único deploy del Hosting DEV existente y repetir el gate acumulativo remoto.

Hasta entonces no hay freeze, agosto, postulaciones, merge ni producción.

## 2. Gates cerrados

PASS:

- gate estático acumulativo;
- HR viva dinámica desde junio 2025 hasta julio 2026;
- dominio, Finanzas, Portal Shopper y Reservas;
- Staff humano autenticado;
- Shopper humano autenticado con identidad exacta;
- Cliente humano autenticado con alcance exclusivo `cinepolis`;
- carril técnico Staff/Shopper aislado;
- tres recargas y nueva pestaña;
- idempotencia y readback Cliente;
- rollback exacto probado;
- Cinépolis delegado, regalías 0 y Q60/L200.

## 3. Credencial Cliente

Cerrado:

- una credencial Cliente DEV creada;
- claims exactos `cliente/staff/tya/cinepolis`;
- sign-in PASS;
- segunda ejecución idempotente con 0 writes;
- password changes/resets 0;
- secretos no expuestos.

El primer intento fue revertido automáticamente porque Auth no completaba la entrada visual. Se corrigió la causa raíz y el segundo intento quedó PASS.

## 4. Root fixes aplicados

- guard de clic temprano antes del wrapper oficial;
- guard Shopper contra `pickShopperDev()`;
- transición Cliente post-Auth con `CX.app.enter()`;
- formulario técnico estable `cxDevEntryAuth`;
- metadata `technical-auth-e2e-isolated`;
- modelo financiero Local/Delegado/Regional/Unconfigured;
- guard de comisión delegada fail-closed.

## 5. Siguiente bloque técnico

Con autorización fresca:

1. un único deploy al Hosting DEV existente;
2. comprobación de paridad build/source;
3. Auth remota Staff;
4. Auth remota Cliente;
5. Auth remota Shopper;
6. HR viva, dominio, Finanzas, portales y Reservas;
7. tres recargas y nueva pestaña;
8. evidencia PASS/FAIL;
9. validación humana acumulativa;
10. `APROBADO C6 → FREEZE`.

No reutilizar autorizaciones anteriores.

## 6. Pendientes Claude/prototipo por archivo

### `app/modules/proyecto-wizard.js`

- agregar opción `Regional`;
- conservar directo/delegado;
- ocultar regalías para delegado/regional;
- no duplicar contratos backend.

### `app/modules/finanzas.js`

- sustituir “honorario recibido menos lo pagado al shopper”;
- explicar comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no volver a usar `pickShopperDev()` en una ruta protegida;
- cualquier cambio frontend debe pasar el gate multirol.

## 7. No reabrir

- no nueva candidata, rama o PR;
- no nuevo Firebase o Hosting;
- no bypass de Auth por estar en DEV;
- no dedupe por nombre/teléfono;
- no regalías globales;
- no clasificación por nombre;
- no honorario Shopper como ingreso delegado;
- no comisión/reparto inventados;
- no PowerShell para Paula;
- no deploy por ensayo.

## 8. P1/P2 después del freeze

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto con fuente real;
- optimización de carga;
- refinamiento de review queue y certificaciones.

## 9. Agosto

Paula agregará agosto solo después del freeze de Corte 6. El sistema debe detectarlo desde HR y nunca crearlo por fecha del sistema.
