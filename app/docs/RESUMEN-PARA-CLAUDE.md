# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_CANONICAL_HEAD_DEPLOYED__SHOPPER_NEW_TAB_REMOTE_PASS__FINANCE_CANONICAL_PRECEDENCE_STOP_RETRY`

## 1. Baseline única

Continuar exclusivamente sobre la rama viva `docs-tya-v6-v71-audit`. El source lock runtime/QA comprobado del macro-bloque es:

`69afc8227762cbb16ac5a3af87072c2f1cc88198`

No crear candidata, shell reducido, nueva rama, PR, Firebase, Hosting o workflow paralelo.

HR viva observada:

- 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- agosto 2026 ausente;
- conteos dinámicos, no invariantes hardcodeados.

## 2. Macro-bloque C6 ejecutado

El request `c6-canonical-head-dev-deploy-gates-20260802-07` ejecutó:

- source lock exacto de `app` y `tools/qa`;
- gate estático acumulativo PASS;
- gate estático root fix Shopper nueva pestaña PASS;
- un único deploy Hosting DEV exitoso;
- paridad remota y HR viva PASS;
- Staff PASS;
- Shopper PASS;
- Cliente PASS;
- STOP_RETRY en gate financiero/semántico.

No hubo segundo deploy, Cloud Run, Firestore/Auth/HR/Rules/Storage writes, Make, Gemini, pagos, merge ni producción.

## 3. P0 Shopper cerrado remotamente

El P0 anterior:

`RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT`

queda demostrado como corregido en DEV:

- identidad Shopper exacta;
- overlay protegido aplicado;
- 14 periodos;
- 616 visitas;
- 208 shoppers;
- `ownVisits=1`;
- tres recargas estables;
- nueva pestaña estable.

No reabrir login o Shopper por rutina. Solo ante regresión reproducible nueva.

## 4. Cliente y Staff

PASS remoto:

- Staff humano autenticado, tres recargas y nueva pestaña estables;
- Cliente existente autenticado;
- tenant `tya`;
- alcance exclusivo `cinepolis`;
- 14 periodos y 616 visitas;
- cero cambios de contraseña y cero Auth writes.

## 5. Bloqueo actual de causa raíz

El gate se detuvo en `remote_domain_finance_portals_reservations` porque existen dos verdades financieras simultáneas.

Objetos canónicos `period/project`:

- `modelo=directo`;
- `billingModel=local_invoicing`;
- `localBilling=true`;
- `royaltyApplicable=true`;
- `regalias=10`.

Configuración vigente de Cinépolis:

- `model=delegado`;
- `billingModel=delegated_coordination`;
- `localBilling=false`;
- `royaltyApplicable=false`;
- `royalty=0`;
- honorario Q60 GT / L200 HN;
- comisión/reparto configurables y no inventados.

Causa raíz:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`

## 6. Archivo backend focalizado

`app/adapters/tya-c6-unified-human-runtime-v1.js`

En `applyProjectFinancialConfiguration()` la configuración financiera se publica en un marcador global después de llamar `normalizeAll()`, pero no se materializa primero en los objetos canónicos de periodo/proyecto. El normalizador conserva por ello el modelo directo/regalía 10 heredado.

Correctivo backend requerido:

1. resolver la configuración por llaves técnicas (`tenantId`, `projectId`, `parentProjectId`, `program`), no por nombre visual;
2. materializarla en todos los periodos canónicos antes de `normalizeAll()`;
3. garantizar una sola verdad para `d.period()`, `d.project()`, Finanzas y marcador global;
4. agregar gate predeploy de consistencia configuración/objeto/salida financiera.

## 7. Instrucción para Claude/prototipo

No corregir este hallazgo desde UI. No tocar módulos para forzar delegado/0, no hardcodear Cinépolis y no añadir copy que oculte la contradicción.

Pendientes frontend posteriores, no bloqueantes del root fix backend:

### `app/modules/proyecto-wizard.js`

- conservar directo/delegado;
- agregar Regional;
- regalías visibles solo para facturación local.

### `app/modules/finanzas.js`

- copy de comisión de coordinación y distribución configurable;
- estado de revisión cuando falte fuente exacta.

### `app/app.js`

- preservar entrada humana única y Auth protegida;
- no mover reconciliación backend a UI.

## 8. Estado de portales y Reservas

El gate combinado no alcanzó evidencia final de Portal Cliente, Portal Shopper y Reservas porque se detuvo en la primera aserción financiera. No declararlos cerrados todavía, aunque sus contratos locales previos permanezcan preservados.

## 9. Siguiente bloque

Source-only y sin deploy:

`MATERIALIZACIÓN FINANCIERA CANÓNICA → GATE DE CONSISTENCIA → GATES ESTÁTICOS/SMOKE LOCAL READ-ONLY → DOCUMENTACIÓN → STOP`

Solo después de PASS source-only procede solicitar autorización para un nuevo deploy DEV único.
