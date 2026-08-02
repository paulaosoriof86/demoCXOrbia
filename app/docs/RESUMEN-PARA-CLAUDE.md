# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__ROOT_CAUSE_FIXED__FRESH_AUTH_REQUIRED`

## 1. Baseline única

Claude debe continuar sobre el HEAD vivo de `docs-tya-v6-v71-audit`. No puede crear una versión paralela, shell reducido ni escoger módulos aislados.

La HR viva observada contiene 14 periodos desde junio 2025 hasta julio 2026, 616 visitas y 208 shoppers. Agosto todavía no existe. Los conteos son fotografía, no contrato permanente.

## 2. Contrato acumulativo comprobado

PASS:

- entrada humana `authenticated-human-canonical`;
- Firebase Auth/claims para Staff, Cliente y Shopper;
- HR viva dinámica;
- Firestore exacto para identidad/perfil/certificación;
- dominio/Finanzas/Portal Cliente/Portal Shopper/Reservas canónicos;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- materialización, idempotencia, readback y rollback Cliente.

Decisión funcional:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 3. Credencial Cliente vigente

Existe una única credencial Cliente DEV con:

- `role=cliente`;
- `authNamespace=staff`;
- `tenantId=tya`;
- alcance exclusivo `cinepolis`.

La contraseña no se almacena en repo/evidencias y no debe incorporarse a UI, fixtures o documentación.

## 4. Resultado del intento de deploy

El comando del único deploy autorizado fue iniciado, pero no creó release:

- source lock: PASS;
- gate estático: PASS;
- credenciales read-only: PASS;
- deploy command attempted: 1;
- deploy succeeded: 0;
- Hosting releases: 0;
- gates remotos: no ejecutados.

No atribuir este fallo a la aplicación, HR, Auth, Finanzas o UI.

## 5. Causa raíz de Hosting

El runner escribía la configuración alternativa solo en `.tmp/c6-hosting-dev-deploy/firebase.deploy.json`.

Firebase CLI resuelve el basename de `--config` dentro de la raíz del proyecto. Al no existir `<root>/firebase.deploy.json`, el comando terminó antes de publicar.

Corrección protegida:

- `firebase.json` conserva el rewrite HR vivo;
- `firebase.deploy.json` existe en la raíz;
- target `cxorbia-dev`;
- public `app`;
- endpoint `/api/tya/cinepolis/hr-live` hacia `cxorbia-live-hr-dev` en `us-central1`;
- wildcard SPA posterior;
- no Cloud Run deploy.

Claude no debe eliminar, duplicar o cambiar estos rewrites desde frontend.

## 6. Regresiones que no se pueden repetir

- entrada humana sin Auth real;
- clic rápido que use handler directo;
- Shopper protegido ejecutando `pickShopperDev()`;
- autenticación Cliente sin completar la entrada a la app;
- KPI/fases divergentes;
- histórico incompleto;
- regalías globales;
- clasificación por nombre;
- honorario Shopper usado como ingreso delegado;
- configuración Firebase alternativa fuera de la raíz esperada por CLI;
- deploy que omita el rewrite HR vivo.

## 7. Modelo financiero por proyecto

Cinépolis:

- delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca es ingreso delegado;
- margen solo con comisión/distribución exactas.

## 8. Ajustes frontend exactos para Claude

### `app/modules/proyecto-wizard.js`

- conservar directo/delegado;
- agregar `Regional`;
- mostrar regalías solo para directo.

### `app/modules/finanzas.js`

- sustituir “honorario recibido menos lo pagado al shopper”;
- describir comisión de coordinación y distribución configurable;
- mostrar `pending_or_review` cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada;
- no usar `pickShopperDev()` en rutas protegidas;
- no mover Auth a módulos UI.

## 9. Gate pendiente

Requiere autorización fresca porque el comando anterior sí fue intentado:

`SOURCE LOCK ACTUAL → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → STAFF/CLIENTE/SHOPPER → HR/DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → VALIDACIÓN HUMANA → FREEZE`.

No nueva candidata, rama, PR, Firebase, Hosting, merge ni producción.
