# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_AUTH_ALL_ROLES_PASS__HOSTING_DEV_COMMAND_FAILED_BEFORE_RELEASE__ROOT_CAUSE_FIXED__FRESH_AUTH_REQUIRED__NO_PRODUCTION`

## 1. Objetivo y arquitectura

TyA/Cinépolis es el primer tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev` es DEV canónico y `tya-plataforma` el Hosting final.

La baseline funcional es única y acumulativa sobre `docs-tya-v6-v71-audit`. No crear plataforma, candidata, rama, PR, Firebase o Hosting alternos.

## 2. Secuencia obligatoria

`FUENTE VIVA → IDENTIDAD → READ MODEL → GATE SEMÁNTICO → SOURCE LOCK → AUTORIZACIÓN → WRITE/DEPLOY EXACTO → READBACK/PARIDAD → GATE REMOTO → VALIDACIÓN HUMANA → CUTOVER`.

Debe distinguirse siempre:

- comando de deploy intentado;
- release Hosting creada;
- paridad remota;
- aprobación humana.

Ninguno sustituye al siguiente.

## 3. Baseline acumulativa PASS

- HR viva: 14 periodos, junio 2025–julio 2026, 616 visitas, 208 shoppers.
- Agosto ausente.
- Staff, Cliente y Shopper autenticados.
- Cliente con alcance exclusivo `cinepolis`.
- Tres recargas y nueva pestaña.
- Dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas.
- Credencial Cliente idempotente, readback PASS y rollback exacto.

Decisión funcional:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 4. Ownership canónico

1. HR viva: operación e historia.
2. Firestore protegido: identidad/perfil/certificación por crosswalk exacto.
3. Finanzas/pagos: liquidaciones, movimientos y pagos confirmados.
4. ProjectConfig: países, monedas, honorarios, modelo, comisión y regalías.
5. Auth/RBAC: acceso y alcance.
6. Platform-origin: delta reconciliado.

## 5. Modelo financiero

Cinépolis:

- delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso delegado;
- margen únicamente con fuentes exactas.

## 6. Resultado del deploy DEV autorizado

El predeploy pasó:

- source lock;
- gate estático;
- credenciales Staff/Shopper/Cliente read-only;
- destino DEV.

El comando de deploy fue intentado una vez y falló antes de crear release:

- deploy attempted: true;
- deploy succeeded: false;
- Hosting releases nuevas: 0;
- gates remotos: 0;
- Cloud Run deploys: 0.

La autorización quedó consumida. No hay reintento automático.

## 7. Causa raíz de Hosting

`FIREBASE_CLI_ALTERNATE_CONFIG_PATH_RESOLUTION`.

El workflow generaba `firebase.deploy.json` solo en `.tmp`. Firebase CLI resuelve la configuración alternativa por basename dentro de la raíz del proyecto. El archivo raíz no existía al iniciar el comando.

Corrección aplicada:

- rewrite HR vivo persistido en `firebase.json`;
- `firebase.deploy.json` creado en la raíz;
- target `cxorbia-dev`;
- public `app`;
- rewrite a `cxorbia-live-hr-dev/us-central1` antes del wildcard;
- cero nuevo deploy después del fix.

## 8. Gate restante de Corte 6

Requiere autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → CREDENCIALES READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA`.

Ante cualquier fallo:

- no segundo deploy automático;
- evidencia durable;
- diagnóstico de raíz;
- autorización fresca para un intento posterior.

## 9. Freeze, agosto y producción

Solo después del PASS remoto y aprobación visual humana:

1. `APROBADO C6 → FREEZE`;
2. Paula agrega agosto a HR;
3. reconciliación agosto;
4. disponibles y postulaciones;
5. gate multirol;
6. autorización de cutover.

No merge ni producción antes de esos gates.

## 10. Claude/prototipo

Pendientes frontend:

- `app/modules/proyecto-wizard.js`: opción Regional;
- `app/modules/finanzas.js`: copy delegado y fuente exacta.

No mover Auth, Finanzas o configuración Hosting a módulos UI.

## 11. Academia

Enseñar diferencia entre intento de comando, release creada, paridad remota y aprobación humana, además de fuente viva, Auth por rol y modelos financieros por proyecto.

## 12. Estado seguro

Credencial Cliente vigente: 1. Auth writes autorizados previos: 2. Password changes/resets: 0. Hosting releases nuevas: 0. Cloud Run/Firestore/Rules/Storage/HR/Make/Gemini/pagos: 0. Merge=false. Producción=false.
