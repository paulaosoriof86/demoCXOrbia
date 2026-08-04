# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `SOURCE_STATIC_PASS__FINAL_RUNTIME_RETRY_CONSUMED_FAIL__CLIENT_PORTAL_ROUTE_ASSERTION__ROLLBACK_EXACT__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Carril vigente

Continuar únicamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- manifest final Phase A;
- árbol funcional `app/` preservado.

Producción `tya-plataforma` permanece intacta.

## 2. Autoridades preservadas

- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- 53/53 blobs críticos PASS;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados.

## 3. Autoridad HR dinámica

Última ejecución:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Queda prohibido restaurar `616` o `2026-07` como invariantes runtime.

## 4. Reejecución final Cliente

Solicitud consumida:

- request `c6-client-access-repair-runtime-20260804-final-01`;
- commit de autorización `a6a7f984aae362d465e6070660f480217511e1e1`;
- commit de resultado `56c71b796d58cf0429d87bc09d226b725c6d20ff`.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

La ejecución alcanzó el gate de dominio después de snapshot, reparación idempotente, readback, Staff, Shopper, Cliente, HR dinámica y paridad remota.

## 5. Causa raíz vigente

El fallo fue:

`client_assertions → CLIENT_PORTAL_INVALID`.

La aserción mezclaba tres condiciones:

```text
clientModule && panorama && !blocked
```

El módulo `cli_dashboard` y el estado no bloqueado ya estaban probados por etapas inmediatamente anteriores. La condición residual es la expectativa de copy/ruta del Panorama.

El gate abre la app después del login pero no navega explícitamente a `cli_dashboard`; luego exige encontrar `Panorama`, `Operación del periodo` o `Resultados de evaluación` en la vista actual.

Por tanto, el bloqueo vigente pertenece al gate de ruta/copy observable, no demuestra ausencia del módulo, fallo de Auth, pérdida de HR ni falta de datos.

## 6. Rollback

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado final:

- preestado restaurado: sí;
- membership temporal conservado: no;
- claims finales alterados: no;
- usuarios creados: 0;
- password changes/resets: 0;
- deploy/merge/producción: 0;
- Firestore de negocio/HR/Rules/Storage: 0.

## 7. Próximo bloque exacto

```text
SOURCE-ONLY ROOT FIX DEL GATE CLIENTE
→ NAVEGAR EXPLÍCITAMENTE A cli_dashboard
→ REGISTRAR clientModule/route/panorama/blocked POR SEPARADO
→ VALIDAR SELECTOR O MARKER ESTABLE
→ GATE LOCAL/ESTÁTICO SIN PROVIDER WRITES
→ DETENERSE PARA NUEVA AUTORIZACIÓN
```

La autorización final ya fue consumida. Queda prohibido reintentar silenciosamente.

## 8. Cloud V5/V6

V5 permanece:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

V6 debe incluir Login/órbita, responsive P1, PDF P1, Excel P2, Regional, copy delegado, Ficha Shopper y evidencia completa.

## 9. Secuencia posterior

```text
ROOT FIX SOURCE-ONLY GATE CLIENTE
→ NUEVA AUTORIZACIÓN EXPRESA SOLO DESPUÉS DEL PASS LOCAL
→ RUNTIME MULTIROL
→ AUDITORÍA FOCAL CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ GATES
→ DEV ÚNICO SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 10. Estado seguro

- cambios funcionales `app/`: 0;
- estado proveedor restaurado: sí;
- Hosting/Cloud Run deploys: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 11. Clasificación

- **Reusable CXOrbia:** gate por ruta explícita y evidencia booleana separada.
- **Exclusivo cliente:** membership `tya/cinepolis`.
- **Cloud/prototipo:** V5 HOLD, V6 pendiente.
- **Academia:** Auth, membership, ruta y copy deben enseñarse como capas diferentes.
- **Sin impacto Cloud:** este resultado no modifica frontend.
