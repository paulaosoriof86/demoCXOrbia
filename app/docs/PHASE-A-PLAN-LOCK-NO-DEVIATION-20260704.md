# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_AUTH_RUNTIME_ALL_ROLES_PASS__CLIENT_CREDENTIAL_MATERIALIZED__PENDING_FRESH_DEV_DEPLOY_AUTHORIZATION__NO_PRODUCTION`

## 1. Objetivo y arquitectura

TyA/Cinépolis es el primer tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev` es DEV canónico y `tya-plataforma` el Hosting final.

La baseline debe ser única, acumulativa y construida sobre el HEAD vivo. Quedan prohibidos shells reducidos, carriles humanos paralelos, versiones por módulo, nuevas ramas/PR y restauraciones manuales de pantallas.

## 2. Secuencia obligatoria

`FUENTE VIVA → FRESCURA → IDENTIDAD → READ MODEL CANÓNICO → GATE SEMÁNTICO → WRITE PLAN → AUTORIZACIÓN → WRITE EXACTO → READBACK → REMOTE SMOKE → VALIDACIÓN HUMANA ACUMULATIVA → CUTOVER`.

Un asset-smoke o prueba aislada no congela un corte. El gate debe comprobar principal autenticado, periodos, KPIs, fases, detalle, perfiles, Cliente, Shopper, Finanzas, recargas y nueva pestaña.

## 3. Cortes protegidos

- Corte 1/2A/3 FROZEN.
- R17N 1,406/1,406; no repetir.
- Corte 5 CX.data PASS.
- Perfil, certificación, histórico, Finanzas y pagos canónicos se preservan.
- Corte 6 alcanzó PASS acumulativo local/read-only para Staff, Cliente y Shopper.
- Corte 6 aún no está congelado porque falta deploy DEV fresco, gate remoto idéntico y validación humana acumulativa.

## 4. Ownership canónico

1. **HR viva:** periodos, visitas, estados, asignación, fechas y evidencia operacional.
2. **Firestore protegido:** identidad, perfil, PII y certificación por overlay exacto; nunca sustituye HR.
3. **Finanzas/pagos:** liquidaciones, movimientos, beneficios y pagos confirmados.
4. **ProjectConfig:** países, monedas, honorarios, modelo financiero, comisión, distribución, impuestos y regalías.
5. **Auth/RBAC:** acceso y alcance; no fuente operacional.
6. **Platform-origin:** delta reconciliado, nunca duplicación HR.

## 5. Fuente viva observada

Gate vigente:

- 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- 208 shoppers;
- agosto 2026 ausente.

Julio observado:

- 44 total;
- 43 realizadas;
- 41 cuestionarios;
- 37 submitidas;
- 1 fuera de rango;
- GT 34 / HN 10.

Son valores observacionales, no invariantes. Agosto solo aparece cuando exista en HR o como fuente platform-origin autorizada y reconciliada.

## 6. Modelo financiero prevalente

- `directo/local_invoicing`: facturación local y regalías solo si se configuran.
- `delegado/delegated_coordination`: regalías 0 y comisión de coordinación compartida.
- `regional/regional_coordination`: distribución regional configurable.
- `unconfigured`: fail-closed.

Cinépolis:

- Q60 GT / L200 HN al shopper;
- modelo delegado;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso;
- margen únicamente con comisión/distribución exactas.

## 7. Runtime humano unificado

La única entrada humana válida es `authenticated-human-canonical`:

- selección de perfil + Usuario/Contraseña en el mismo login;
- Firebase Auth/claims como autoridad del principal;
- HR viva como autoridad operacional;
- Firestore exacto como overlay;
- dominio, Shopper, Cliente y Finanzas canónicos;
- cero writes durante validaciones, salvo writes explícitamente autorizados.

## 8. Root fixes Auth comprobados

### Clic temprano

`tya-c6-unified-human-runtime-v1.js` bloquea el clic antes del wrapper oficial.

### Shopper DEV

`tya-c6-shopper-auth-click-guard-v1.js` impide `pickShopperDev()` en la ruta protegida.

### Cliente post-Auth

El mismo adapter completa `CX.app.enter()` únicamente después de que Firebase Auth devuelve un contexto Cliente autenticado con namespace `staff`.

### Carril técnico

`tya-dev-technical-auth-e2e-v1.js` conserva `cxDevEntryAuth`, `technical-auth-e2e-isolated` y namespaces staff/shopper.

## 9. Credencial Cliente materializada

Autorización ejecutada:

- snapshot previo;
- una credencial Cliente DEV;
- 2 Auth writes: creación + claims;
- claims exactos `cliente/staff/tya/cinepolis`;
- sign-in PASS;
- idempotencia PASS con 0 writes;
- readback PASS;
- rollback exacto probado;
- password changes/resets 0;
- credenciales/tokens expuestos 0.

El primer intento fue revertido automáticamente porque la autenticación no completó la entrada visual. Después del root fix, el segundo intento quedó PASS.

## 10. Gates PASS de Corte 6

- static cumulative contract;
- HR viva dinámica;
- dominio/Finanzas/Portal Shopper/Reservas;
- Staff humano autenticado;
- Shopper humano autenticado con identidad exacta;
- Cliente humano autenticado con alcance exclusivo `cinepolis`;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- idempotencia, readback y rollback Cliente;
- cero exposición de secretos.

Decisión acumulativa:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

## 11. Gate restante de Corte 6

Solo con autorización fresca:

`UN ÚNICO DEPLOY HOSTING DEV EXISTENTE → PARIDAD REMOTA → AUTH STAFF/CLIENTE/SHOPPER → HR/DOMINIO/FINANZAS/PORTALES → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

No se reutiliza autorización consumida.

## 12. Julio y agosto

No iniciar agosto antes del freeze. Después:

- Paula agrega agosto a HR;
- el runtime lo detecta;
- se reconcilia platform-origin;
- se habilitan disponibles y postulaciones;
- gate multirol;
- writes/cutover requieren autorización específica.

## 13. Claude/prototipo

Claude debe preservar:

- baseline única;
- máquina de estados y periodo únicos;
- identidad exacta y review queue;
- Auth real sin `pickShopperDev()` en ruta protegida;
- transición Cliente post-Auth;
- Local/Delegado/Regional/Unconfigured;
- regalías solo para facturación local;
- comisión separada de obligaciones al shopper;
- gate transversal entre tile, fase, drill, portal y Finanzas.

Pendientes frontend:

- `app/modules/proyecto-wizard.js`: agregar Regional;
- `app/modules/finanzas.js`: corregir copy delegado y estado de fuente.

## 14. Academia

Fuentes vigentes:

- `ACADEMIA-IMPACTO-C6-RECUPERACION-RUNTIME-ACUMULATIVO-20260801.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-CREDENCIAL-CLIENTE-MATERIALIZADA-20260802.md`.

## 15. Estado seguro

Credenciales Cliente creadas 1; Auth writes autorizados 2; password changes/resets 0; Hosting/Cloud Run deploys 0; Firestore/Rules/Storage/HR/Make/Gemini/pagos writes 0; nuevos Firebase/Hosting 0; merge=false; producción=false.
