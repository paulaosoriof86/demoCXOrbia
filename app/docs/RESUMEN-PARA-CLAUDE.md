# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_FINANCE_ROOT_FIX_REMOTE_PASS__SEMANTIC_ASSERTION_PENDING_STOP_RETRY__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre `docs-tya-v6-v71-audit`. No crear candidata, shell reducido, nueva rama, PR, Firebase, Hosting o workflow paralelo.

HR observada: 14 periodos, junio 2025–julio 2026, 616 visitas. Agosto 2026 no existe todavía en HR.

## 2. PASS remoto preservado y revalidado

- paridad de assets críticos y endpoint HR source-safe;
- Staff con tres recargas y nueva pestaña;
- Shopper con identidad exacta, 208 shoppers, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente existente, tenant `tya`, scope exclusivo `cinepolis`, tres recargas y nueva pestaña.

No reabrir login, reconciliación Shopper ni selección de credenciales sin una regresión nueva y reproducible.

## 3. Root fix financiero cerrado remotamente

Causa cerrada:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

El Hosting DEV vigente demuestra que `period`, `project` y `currentById` coinciden:

- `modelo=delegado`;
- `billingModel=delegated_coordination`;
- `projectModel=delegado`;
- `localBilling=false`;
- `royaltyApplicable=false`;
- `regalias=0`;
- Q60 GT / L200 HN;
- comisión/reparto configurables;
- honorario Shopper separado del ingreso.

El contrato financiero reporta 14 delegados, 0 directos, 0 sin configurar y 0 violaciones de regalías.

No volver a parchar este punto desde UI ni duplicar el registro `tya::cinepolis`.

## 4. Macro-bloque ejecutado

Request:

`c6-finance-root-fix-remote-revalidation-20260802-08`

Se ejecutó:

- source lock exacto;
- gates estáticos;
- un único Hosting DEV deploy;
- paridad y HR;
- Staff;
- Shopper;
- Cliente;
- diagnóstico financiero remoto;
- gate combinado semántico;
- STOP_RETRY.

No hubo segundo deploy ni provider writes.

## 5. Bloqueo actual

El gate combinado se detuvo en:

`remote_domain_finance_portals_reservations`

La evidencia persistida tiene `semantic=null`. El script terminó antes de guardar su JSON final y el flujo no conservó stdout/stderr sanitizado. No existe evidencia para nombrar la aserción exacta.

No atribuir el fallo al root fix financiero: su diagnóstico remoto es consistente y PASS.

## 6. Estado de dominio y portales

Todavía no declarar cerrados:

- dominio semántico final;
- salida financiera por país;
- Portal Cliente;
- Portal Shopper;
- Reservas.

Sus contratos previos permanecen, pero falta evidencia de ejecución completa.

## 7. Instrucción para Claude/prototipo

No tocar módulos UI para ocultar el fallo. No reabrir dashboard, roadmap, login, Shopper o Finanzas canónicas. El siguiente diagnóstico debe capturar etapa y aserción exactas antes de proponer cambios.

Pendientes frontend posteriores y no relacionados con este STOP_RETRY:

- `app/modules/proyecto-wizard.js`: opción Regional y regalías solo para facturación local;
- `app/modules/finanzas.js`: copy de comisión/reparto configurable y estado de revisión;
- `app/app.js`: preservar entrada humana única y Auth protegida.

## 8. Siguiente bloque

Read-only, sobre el Hosting DEV vigente y sin deploy:

`CAPTURA DE STDOUT/STDERR Y CHECKPOINT POR ASERCIÓN → GATE SEMÁNTICO REMOTO → IDENTIFICAR FALLO EXACTO → EVIDENCIA → DOCUMENTACIÓN → STOP`

Cero merge o producción antes del PASS acumulativo y validación humana.
