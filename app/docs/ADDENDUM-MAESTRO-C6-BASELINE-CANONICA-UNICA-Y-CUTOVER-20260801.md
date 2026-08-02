# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_DEV_HOSTING_RELEASED__REMOTE_PARITY_HR_STAFF_CLIENT_PASS__SHOPPER_NEW_TAB_AUTHORITY_ROOT_FIX_PENDING_DEPLOY__NO_PRODUCTION`

## 1. Propósito

Este addendum impide que CXOrbia/TyA vuelva a fragmentarse por módulo, etapa, fuente, carril de acceso o conversación. Solo puede existir una baseline acumulativa construida sobre el HEAD vivo de `docs-tya-v6-v71-audit`.

## 2. Baseline acumulativa preservada

- frontend aprobado vigente;
- entrada humana única;
- acceso validado para Staff, Cliente y Shopper;
- HR viva como autoridad operacional dinámica;
- Firestore protegido como overlay exacto;
- read model y máquina de estados canónicos;
- Dashboard, fases, detalle, histórico y comparativo;
- Portal Cliente, Portal Shopper, Finanzas y Reservas en baseline local/read-only;
- credencial Cliente idempotente, readback y rollback exacto.

Fotografía HR vigente:

- 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- 208 shoppers;
- agosto 2026 ausente.

## 3. Modelo financiero por proyecto

Cinépolis:

- delegado desde `projectConfig`;
- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso;
- margen solo con comisión y distribución exactas.

## 4. Release Hosting DEV publicada

El request `c6-hosting-dev-deploy-remote-gates-20260802-04` ejecutó un único deploy exitoso:

- configuración raíz `firebase.deploy.json` usada;
- 2,293 archivos publicados;
- release Hosting finalizada;
- target `cxorbia-dev` y site `cxorbia-backend-dev`;
- endpoint HR vivo preservado antes del wildcard SPA;
- Cloud Run y demás provider writes: 0;
- producción intacta.

Las continuaciones posteriores fueron read-only y no desplegaron otra release.

## 5. Gates remotos comprobados

PASS:

- paridad SHA-256 de 16 assets críticos;
- endpoint HR remoto;
- Staff remoto;
- Cliente remoto;
- 14 periodos, 616 visitas y 208 shoppers.

No cerrado:

- Shopper en nueva pestaña con overlay protegido aplicado y visitas propias;
- gate semántico final de Finanzas/portales/Reservas posterior al P0.

## 6. P0 Shopper nueva pestaña

Dos ejecuciones reprodujeron:

`AUTH SHOPPER RESTORED → APP + HR BASE READY → PROTECTED AUTHORITY NOT APPLIED → OWN VISITS 0`.

El principal, tenant, proyecto, carril y datos HR base eran correctos. La composición protegida no se restablecía de forma resiliente.

Causa raíz:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`.

## 7. Root fix listo en fuente

`app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` incorpora:

- seis reintentos HR vivos acotados para 429/5xx/red;
- reconciliación de arranque para sesión ya restaurada;
- disparadores Auth/backend/DOM/foco/visibilidad/refresh;
- guardas de principal, Firestore y dependencias canónicas;
- una conciliación y un timer como máximo;
- metadata durable de recuperación;
- fail-closed y cero writes.

Gate estático dedicado:

`tools/qa/tya-c6-shopper-new-tab-authority-root-fix-gate.mjs`.

El root fix no está desplegado; no se afirma PASS remoto.

## 8. Operaciones prohibidas

Queda prohibido:

- crear otra plataforma, candidata, rama, PR, Firebase, Hosting o workflow;
- desplegar el root fix sin autorización fresca;
- ejecutar más de un deploy por autorización;
- omitir source lock o gates estáticos;
- desplegar Cloud Run junto con Hosting;
- mover Auth o reconciliación protegida a módulos UI;
- deduplicar por nombre/correo/teléfono;
- aplicar regalías globales;
- abrir agosto/postulaciones, merge o producción sin gates específicos.

## 9. Gate restante de Corte 6

Solo con autorización fresca:

`SOURCE LOCK NUEVO → STATIC CUMULATIVE + NEW-TAB ROOT-FIX GATE → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → HR VIVA → STAFF → SHOPPER 3 RELOADS + NEW TAB + OWN VISITS → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → EVIDENCIA → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

Ante cualquier fallo no existe segundo deploy automático.

## 10. Agosto y postulaciones

Después del freeze:

1. Paula agrega agosto a HR;
2. el runtime lo detecta;
3. se reconcilia platform-origin;
4. se habilitan disponibles y postulaciones;
5. gate multirol;
6. write plan y autorización;
7. readback y cutover.

## 11. Documentación prevalente

- `CAMBIOS-BACKEND-ADDENDUM-C6-DEPLOY-DEV-EXITOSO-Y-P0-SHOPPER-NUEVA-PESTANA-20260802.md`;
- `CORTE6-HOSTING-DEV-DEPLOY-REMOTE-GATES-FAILURE-LATEST.json`;
- `CORTE6-HOSTING-DEV-REMOTE-GATES-CONTINUATION-FAILURE-LATEST.json`;
- `CORTE6-SHOPPER-NEW-TAB-AUTHORITY-ROOT-FIX-LATEST.json`;
- índice, checkpoint, Phase A, resumen Claude, pendientes, Academia y PR #7.

## 12. Clasificación

- **Reusable CXOrbia:** recuperación resiliente del overlay protegido en reload/nueva pestaña.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis`, endpoint HR y site DEV.
- **Claude/prototipo:** no cambiar UI ni reimplementar reconciliación en módulos.
- **Academia:** Auth restaurada y HR visible no prueban identidad protegida aplicada.
- **Sin impacto proveedor después del root fix:** cero deploy y cero writes.

## 13. Estado seguro

Hosting releases acumuladas en la autorización ejecutada: 1. Hosting deploys posteriores al root fix: 0. Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0. Nuevos proyectos/sites: 0. Merge=false. Producción=false.
