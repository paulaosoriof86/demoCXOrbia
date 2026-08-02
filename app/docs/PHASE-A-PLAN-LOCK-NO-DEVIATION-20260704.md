# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-08-01  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_RUNTIME_PASS_EXCEPT_CLIENT_CREDENTIAL__HOLD_NO_AUTH_WRITE_NO_DEPLOY_NO_PRODUCTION`

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
- Corte 6 todavía no está congelado porque falta Auth real de Cliente.

## 4. Ownership canónico

1. **HR viva:** periodos, visitas, estados, asignación, fechas y evidencia operacional.
2. **Firestore protegido:** identidad, perfil, PII y certificación por overlay exacto; nunca sustituye HR.
3. **Finanzas/pagos:** liquidaciones, movimientos, beneficios y pagos confirmados.
4. **ProjectConfig:** países, monedas, honorarios, modelo financiero, comisión, distribución, impuestos y regalías.
5. **Auth/RBAC:** acceso y alcance; no fuente operacional.
6. **Platform-origin:** delta reconciliado, nunca duplicación HR.

## 5. Fuente viva observada

Gate read-only vigente:

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
- `regional/regional_coordination`: distribución regional configurable, sin regalías locales por defecto.
- `unconfigured`: fail-closed.

Cinépolis es delegado desde su `projectConfig`:

- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso;
- margen únicamente con comisión/distribución exactas.

Contratos:

- `tya-project-financial-model-contract-v1.js`;
- `tya-delegated-coordination-finance-guard-v1.js`.

## 7. Runtime humano unificado

La única entrada humana válida es `authenticated-human-canonical`:

- selección de perfil + Usuario/Contraseña en el mismo login;
- Firebase Auth/claims como autoridad del principal;
- HR viva como autoridad operacional;
- Firestore exacto como overlay;
- dominio, Shopper, Cliente y Finanzas canónicos;
- cero writes durante validación.

## 8. Root fixes Auth comprobados

### Clic temprano

`tya-c6-unified-human-runtime-v1.js` bloquea el clic antes de que el wrapper oficial termine de instalarse.

PASS: `PASS_C6_HUMAN_LOGIN_IMMEDIATE_CLICK_GUARDED`.

### Shopper DEV

`app.js` llama `pickShopperDev()` directamente para Shopper DEV. `tya-c6-shopper-auth-click-guard-v1.js`, cargado antes de `app.js`, intercepta únicamente la tarjeta Shopper protegida y abre Firebase Auth.

No se modificó `app.js` ni módulos UI.

### Carril técnico

`tya-dev-technical-auth-e2e-v1.js` conserva:

- `cxDevEntryAuth`;
- `technical-auth-e2e-isolated`;
- namespaces staff/shopper;
- ruta humana no afectada.

## 9. Gates PASS de Corte 6

- static cumulative contract;
- HR viva dinámica;
- dominio/Finanzas/Portal Shopper/Reservas;
- Staff humano autenticado;
- Shopper humano autenticado con identidad exacta y una visita propia;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- ruta Cliente integrada Usuario + Contraseña;
- cero credenciales/tokens expuestos;
- cero writes.

Staff observado: rol `coordinador`, namespace `staff`.

Shopper observado: rol `shopper`, namespace `shopper`.

## 10. HOLD Cliente

La búsqueda read-only de credencial Cliente obtuvo:

- 4 registros candidatos;
- 3 usuarios Auth existentes;
- 0 cuentas con claims válidos `cliente/client` para tenant `tya` y proyecto `cinepolis`;
- 0 hashes válidos;
- 0 sign-ins.

Decisión:

`HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND`.

Auth writes, password changes y resets permanecen en cero.

## 11. Gate restante condicionado

Requiere autorización específica porque implica Auth write:

`SNAPSHOT AUTH CLIENT → MATERIALIZE ONE CLIENT CREDENTIAL DEV → CLAIMS TENANT/PROJECT/ROLE → IDEMPOTENCY → CLIENT HUMAN AUTH → 3 RELOADS + NEW TAB → READBACK → ROLLBACK PROOF → CUMULATIVE EVIDENCE`.

Sin autorización no se crea ni resetea credencial.

## 12. Freeze y deploy

Solo después de PASS Cliente y repetición acumulativa:

1. solicitar autorización fresca para un único deploy del Hosting DEV existente;
2. ejecutar paridad y gate remoto idéntico;
3. validación humana acumulativa;
4. `APROBADO C6 → FREEZE`.

No se reutiliza autorización consumida.

## 13. Julio y agosto

No iniciar agosto antes del freeze. Después:

- Paula agrega agosto a HR;
- el runtime lo detecta;
- se reconcilia platform-origin;
- se habilitan disponibles y postulaciones;
- se ejecuta gate multirol;
- writes/cutover requieren autorización específica.

## 14. Claude/prototipo

Claude debe preservar:

- baseline única;
- máquina de estados y periodo únicos;
- identidad exacta y review queue;
- histórico/certificación por rol;
- Auth real sin `pickShopperDev()` en ruta protegida;
- Local/Delegado/Regional/Unconfigured;
- regalías solo para facturación local;
- comisión separada de obligaciones al shopper;
- gate transversal entre tile, fase, drill, portal y Finanzas.

Pendientes frontend:

- `app/modules/proyecto-wizard.js`: agregar Regional;
- `app/modules/finanzas.js`: corregir copy delegado y estado de fuente.

## 15. Academia

Fuentes vigentes:

- `ACADEMIA-IMPACTO-C6-RECUPERACION-RUNTIME-ACUMULATIVO-20260801.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-RECUPERACION-BASELINE-ACUMULATIVA-UNICA-20260801.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-MODELO-DELEGADO-COMISION-20260801.md`;
- `CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-RUNTIME-Y-HOLD-CLIENTE-20260801.md`.

## 16. Estado seguro

Hosting deploys 0; Cloud Run 0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; password changes/resets 0; nuevos Firebase/Hosting 0; merge=false; producción=false.
