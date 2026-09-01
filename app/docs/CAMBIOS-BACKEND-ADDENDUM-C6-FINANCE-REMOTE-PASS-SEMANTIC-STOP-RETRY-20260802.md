# CAMBIOS BACKEND — C6 Finance remoto PASS y STOP_RETRY semántico

**Fecha:** 2026-08-02  
**Estado:** `C6_FINANCE_ROOT_FIX_REMOTE_PASS__SEMANTIC_GATE_NO_EVIDENCE_STOP_RETRY__NO_PRODUCTION`  
**Clasificación:** Reusable CXOrbia · Exclusivo TyA · Claude/prototipo · Academia · Sin impacto proveedor adicional

## 1. Macro-bloque ejecutado

Autorización ejecutada sobre el source lock:

`aad5caed269fd7156b786775cc7e35c8108e00ca`

Request:

`c6-finance-root-fix-remote-revalidation-20260802-08`

Secuencia ejecutada:

1. source lock nuevo;
2. gates estáticos acumulativos y Shopper nueva pestaña;
3. un único deploy Hosting DEV;
4. paridad y HR viva;
5. Staff;
6. Shopper con tres recargas, nueva pestaña, identidad exacta y visitas propias;
7. Cliente;
8. diagnóstico financiero remoto;
9. gate combinado de dominio, Finanzas, portales y Reservas;
10. STOP_RETRY.

## 2. PASS comprobado

- source lock exacto para `app` y `tools/qa`;
- gate acumulativo estático PASS;
- gate Shopper nueva pestaña PASS;
- un único deploy Hosting DEV exitoso;
- paridad remota de assets críticos PASS;
- HR viva source-safe PASS;
- 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- Staff estable en tres recargas y nueva pestaña;
- Shopper con 208 perfiles, identidad exacta, `ownVisits=1`, tres recargas y nueva pestaña;
- Cliente existente, tenant `tya`, scope `cinepolis`, tres recargas y nueva pestaña.

## 3. Root fix financiero demostrado remotamente

Los objetos canónicos `period`, `project` y `currentById` reportan una sola verdad:

- `parentProjectId=cinepolis`;
- `modelo=delegado`;
- `billingModel=delegated_coordination`;
- `projectModel=delegado`;
- `localBilling=false`;
- `royaltyApplicable=false`;
- `regalias=0`;
- `compensationModel=coordination_commission_shared`.

El contrato financiero reporta:

- 14 proyectos/periodos delegados;
- 0 directos;
- 0 sin configurar;
- 0 violaciones de regalías;
- clasificación por configuración, no por nombre;
- valores de reparto no inventados.

La configuración vigente conserva Q60 GT y L200 HN como obligación al Shopper, nunca como ingreso delegado.

La causa raíz anterior queda cerrada remotamente:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

## 4. STOP_RETRY vigente

El bloque se detuvo en:

`remote_domain_finance_portals_reservations`

Decisión:

`FAIL_C6_REMOTE_GATES_AFTER_SINGLE_DEV_HOSTING_DEPLOY_STOP_RETRY`

La evidencia contiene `semantic=null`: el gate combinado terminó antes de persistir su JSON final. El flujo vigente no conserva el stdout/stderr de ese script en la evidencia del repositorio. Por tanto, no existe soporte para afirmar cuál aserción posterior falló.

No se debe atribuir nuevamente el fallo a la precedencia financiera: el diagnóstico remoto demuestra que esa causa ya está corregida.

## 5. Estado de portales y Reservas

No se declara PASS final de:

- dominio semántico acumulativo;
- salida financiera por país;
- Portal Cliente;
- Portal Shopper;
- Reservas.

Sus contratos permanecen preservados, pero el gate no generó evidencia final y deben diagnosticarse sin otro deploy.

## 6. Reusable CXOrbia

- Un gate combinado debe persistir etapa y aserción antes de cada validación.
- stdout/stderr sanitizado debe quedar disponible aun cuando el script falle antes de escribir su JSON.
- Un diagnóstico específico PASS debe separar una causa ya cerrada de un fallo posterior.
- STOP_RETRY impide usar redeploy como mecanismo de diagnóstico.

## 7. Exclusivo TyA

- Cinépolis continúa como proyecto delegado mediante `tya::cinepolis`.
- Regalías 0.
- Honorarios Q60 GT/L200 HN.
- Comisión y reparto configurables y no inventados.

## 8. Claude/prototipo

No tocar UI ni reabrir login, Shopper o el root fix financiero. El pendiente es obtener la aserción exacta del gate semántico remoto. Cualquier ajuste frontend posterior debe partir de evidencia reproducible y documentarse por archivo.

## 9. Academia

Agregar el caso:

`ROOT FIX REMOTE PASS ≠ GATE COMBINADO PASS`

Explicar la importancia de evidencia parcial, logs sanitizados, checkpoints por aserción y diagnóstico sin redeploy.

## 10. Estado seguro

- Hosting DEV de este macro-bloque: 1.
- Segundo deploy: 0.
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0.
- Cambios o resets de contraseña: 0.
- Credenciales/tokens expuestos: 0.
- Merge: false.
- Producción: false.

## 11. Siguiente bloque exacto

Read-only y sin deploy:

`CAPTURA DE LOG/ASERCIÓN SEMÁNTICA → EJECUCIÓN REMOTA SOBRE HOSTING DEV VIGENTE → DIAGNÓSTICO EXACTO → EVIDENCIA → DOCUMENTACIÓN → STOP`

No procede otro deploy hasta localizar y corregir en fuente la aserción exacta, si corresponde.
