# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__SECOND_DEPLOY_COMMAND_FAILED_BEFORE_RELEASE__EXECUTION_PATH_FIXED__FRESH_AUTH_REQUIRED`

## 1. P0 bloqueante actual

No queda pendiente una credencial Cliente ni una corrección funcional del runtime.

El único bloqueante para continuar Corte 6 es una autorización fresca para un único deploy del Hosting DEV existente. La autorización anterior quedó consumida porque el comando fue iniciado, aunque no creó una release.

Hasta entonces no hay freeze, agosto, postulaciones, merge ni producción.

## 2. Gates cerrados

PASS:

- gate estático acumulativo;
- HR viva dinámica desde junio 2025 hasta julio 2026;
- dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas;
- Staff, Cliente y Shopper humanos autenticados;
- identidad Shopper exacta;
- carril técnico Staff/Shopper aislado;
- tres recargas y nueva pestaña;
- credencial Cliente idempotente y readback PASS;
- rollback exacto probado;
- Cinépolis delegado, regalías 0 y Q60/L200.

## 3. Segundo incidente de deploy DEV

Request: `c6-hosting-dev-deploy-remote-gates-20260802-03`.

Resultado:

- source lock: PASS;
- gate estático: PASS;
- credenciales read-only: PASS;
- deploy command attempted: 1;
- deploy succeeded: 0;
- Hosting releases: 0;
- gates remotos: no ejecutados.

Se respetó `noAutomaticSecondDeploy=true`.

## 4. Causa raíz metodológica

`RUNNER_AUTHORIZED_ROOT_CONFIG_NOT_APPLIED`.

La autorización exigía la configuración raíz `firebase.deploy.json`, pero el workflow todavía generaba una copia dentro de `.tmp` y la usaba en el comando.

El fix documentado no estaba conectado al paso ejecutable. El runner tampoco preservó el error exacto del CLI, por lo que no se atribuye el fallo a IAM, proveedor, aplicación, HR, Auth o Cloud Run sin evidencia.

## 5. Corrección cerrada antes de otro intento

- el workflow existente valida la configuración raíz autorizada;
- ejecutará `--config firebase.deploy.json`;
- valida target `cxorbia-dev`, public `app` y orden de rewrites;
- valida que no exista segundo deploy automático;
- registra versión de Firebase CLI;
- persiste logs sanitizados ante fallo;
- no se creó workflow nuevo;
- no se ejecutó otro deploy después del fix.

## 6. Siguiente bloque técnico

Con autorización fresca:

1. source lock actual;
2. gate estático;
3. validación de `firebase.deploy.json` raíz;
4. credenciales read-only;
5. un único deploy al Hosting DEV existente;
6. paridad remota;
7. Auth remota Staff/Cliente/Shopper;
8. HR viva, dominio, Finanzas, portales y Reservas;
9. tres recargas y nueva pestaña;
10. evidencia PASS/FAIL;
11. validación humana acumulativa;
12. `APROBADO C6 → FREEZE`.

Ante un nuevo fallo no existe segundo deploy automático.

## 7. Pendientes Claude/prototipo por archivo

### `app/modules/proyecto-wizard.js`

- agregar opción `Regional`;
- conservar directo/delegado;
- ocultar regalías para delegado/regional.

### `app/modules/finanzas.js`

- corregir el texto delegado;
- explicar comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no usar `pickShopperDev()` en rutas protegidas.

## 8. No reabrir

- no nueva candidata, rama o PR;
- no nuevo Firebase o Hosting;
- no bypass de Auth;
- no dedupe por nombre/teléfono;
- no regalías globales;
- no honorario Shopper como ingreso delegado;
- no fix únicamente documental sin conexión al runner;
- no PowerShell para Paula;
- no deploy por ensayo.

## 9. P1/P2 después del freeze

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto;
- optimización de carga;
- review queue y certificaciones.

## 10. Agosto

Paula agregará agosto solo después del freeze de Corte 6. El sistema debe detectarlo desde HR y nunca crearlo por fecha del sistema.
