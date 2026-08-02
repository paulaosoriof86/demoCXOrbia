# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__DEPLOY_COMMAND_FAILED_BEFORE_RELEASE__ROOT_CAUSE_FIXED__FRESH_AUTH_REQUIRED`

## 1. P0 bloqueante actual

No queda pendiente una credencial Cliente ni una corrección funcional del runtime.

El único bloqueante para continuar Corte 6 es una autorización fresca para un único deploy del Hosting DEV existente. La autorización anterior quedó consumida porque el comando de deploy fue intentado, aunque no creó una release.

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

## 3. Incidente de deploy DEV

Resultado:

- source lock: PASS;
- gate estático: PASS;
- credenciales read-only: PASS;
- deploy command attempted: 1;
- deploy succeeded: 0;
- Hosting releases: 0;
- gates remotos: no ejecutados.

Causa raíz:

`FIREBASE_CLI_ALTERNATE_CONFIG_PATH_RESOLUTION`.

El archivo de configuración alternativo existía solo dentro de `.tmp`, pero Firebase CLI lo resolvía por basename en la raíz del proyecto.

## 4. Corrección cerrada antes de otro intento

- `firebase.json` conserva el rewrite HR vivo.
- `firebase.deploy.json` existe en la raíz.
- target `cxorbia-dev`.
- public `app`.
- endpoint HR vivo hacia `cxorbia-live-hr-dev/us-central1`.
- wildcard SPA posterior.
- cero nuevo deploy después del fix.

## 5. Siguiente bloque técnico

Con autorización fresca:

1. source lock actual;
2. gate estático;
3. credenciales read-only;
4. un único deploy al Hosting DEV existente;
5. paridad remota;
6. Auth remota Staff/Cliente/Shopper;
7. HR viva, dominio, Finanzas, portales y Reservas;
8. tres recargas y nueva pestaña;
9. evidencia PASS/FAIL;
10. validación humana acumulativa;
11. `APROBADO C6 → FREEZE`.

Ante un nuevo fallo no existe segundo deploy automático.

## 6. Pendientes Claude/prototipo por archivo

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

## 7. No reabrir

- no nueva candidata, rama o PR;
- no nuevo Firebase o Hosting;
- no bypass de Auth;
- no dedupe por nombre/teléfono;
- no regalías globales;
- no honorario Shopper como ingreso delegado;
- no configuración de deploy fuera de la raíz resoluble;
- no PowerShell para Paula;
- no deploy por ensayo.

## 8. P1/P2 después del freeze

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto;
- optimización de carga;
- review queue y certificaciones.

## 9. Agosto

Paula agregará agosto solo después del freeze de Corte 6. El sistema debe detectarlo desde HR y nunca crearlo por fecha del sistema.
