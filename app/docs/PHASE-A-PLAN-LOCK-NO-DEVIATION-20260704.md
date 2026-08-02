# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_DEV_HOSTING_RELEASED__REMOTE_PARITY_HR_STAFF_CLIENT_PASS__SHOPPER_NEW_TAB_ROOT_FIX_PENDING_DEPLOY__NO_PRODUCTION`

## 1. Objetivo y arquitectura

TyA/Cinépolis es el primer tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev` es DEV canónico y `tya-plataforma` el Hosting final.

La baseline es única y acumulativa sobre `docs-tya-v6-v71-audit`. No crear plataforma, candidata, rama, PR, Firebase, Hosting o workflow alternos.

## 2. Secuencia obligatoria

`FUENTE VIVA → IDENTIDAD → READ MODEL → GATE SEMÁNTICO → SOURCE LOCK → AUTORIZACIÓN → DEPLOY EXACTO → PARIDAD → GATE REMOTO → VALIDACIÓN HUMANA → FREEZE/CUTOVER`.

Debe distinguirse siempre:

- release publicada;
- paridad remota;
- principal restaurado;
- overlay protegido aplicado;
- visitas propias visibles;
- aprobación humana.

## 3. Baseline funcional preservada

- HR viva: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers en la fotografía observada.
- Agosto ausente.
- Staff, Cliente y Shopper autenticados en baseline previa.
- Cliente con alcance exclusivo `cinepolis`.
- Dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas en baseline local/read-only.
- Credencial Cliente idempotente, readback PASS y rollback exacto.

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

## 6. Hosting DEV publicado

El request `c6-hosting-dev-deploy-remote-gates-20260802-04` ejecutó un único deploy exitoso desde `firebase.deploy.json` raíz:

- 2,293 archivos publicados;
- release Hosting finalizada;
- paridad remota exacta de 16 assets: PASS;
- endpoint HR remoto: PASS;
- Cloud Run y demás provider writes: 0;
- producción intacta.

## 7. Gates remotos alcanzados

PASS demostrado en la release publicada:

- paridad crítica;
- HR viva remota;
- Staff remoto;
- Cliente remoto;
- 14 periodos, 616 visitas y 208 shoppers.

Bloqueado:

- Shopper en nueva pestaña con autoridad protegida aplicada;
- cierre semántico posterior de Finanzas/portales/Reservas.

## 8. P0 Shopper en nueva pestaña

Dos ejecuciones reprodujeron:

`AUTH SHOPPER RESTORED → APP + HR BASE READY → PROTECTED AUTHORITY NOT APPLIED → OWN VISITS 0`.

El principal, tenant, proyecto, app y HR base eran correctos. Fallaba la reconciliación resiliente del overlay protegido.

Causa raíz:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

## 9. Root fix listo en fuente

`tya-protected-auth-hr-authority-bridge-v2.js` ahora incorpora:

- reintento HR vivo acotado y fail-closed;
- reconciliación de arranque para sesión restaurada;
- eventos Auth/backend, DOM, foco, visibilidad y refresh;
- guardas de principal, Firestore y dependencias canónicas;
- idempotencia de conciliación y timer;
- metadata de recuperación;
- cero writes.

Gate dedicado:

`tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`.

El fix no fue desplegado; no se afirma PASS remoto.

## 10. Gate restante de Corte 6

Requiere autorización fresca:

`SOURCE LOCK NUEVO → STATIC CUMULATIVE + NEW-TAB ROOT-FIX GATE → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF → SHOPPER 3 RELOADS + NEW TAB + OWN VISITS → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA`.

Ante cualquier fallo:

- no segundo deploy automático;
- evidencia durable;
- diagnóstico de raíz;
- autorización fresca para otro intento.

## 11. Freeze, agosto y producción

Solo después del PASS remoto y aprobación visual humana:

1. `APROBADO C6 → FREEZE`;
2. Paula agrega agosto a HR;
3. reconciliación agosto;
4. disponibles y postulaciones;
5. gate multirol;
6. autorización de cutover.

No merge ni producción antes de esos gates.

## 12. Claude/prototipo

Pendientes frontend:

- `app/modules/proyecto-wizard.js`: opción Regional;
- `app/modules/finanzas.js`: copy delegado y fuente exacta.

No mover Auth, reconciliación protegida, Finanzas o configuración Hosting a módulos UI.

## 13. Academia

Enseñar que una sesión restaurada y datos HR visibles no prueban que el overlay protegido y la identidad exacta estén aplicados.

## 14. Estado seguro

Hosting releases acumuladas en la autorización ejecutada: 1. Hosting deploys posteriores al root fix: 0. Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0. Merge=false. Producción=false.
