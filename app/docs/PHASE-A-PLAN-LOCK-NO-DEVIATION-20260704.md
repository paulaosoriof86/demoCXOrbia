# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `SOURCE_STATIC_PASS__FINAL_RUNTIME_RETRY_CONSUMED_FAIL__CLIENT_PORTAL_ROUTE_ASSERTION__ROLLBACK_EXACT__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Objetivo

Cerrar y poner en producción Phase A sobre una sola baseline acumulativa, preservando todo lo aprobado y probado.

Baseline:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- DEV canónico `cxorbia-backend-dev`;
- producción `tya-plataforma`, intacta hasta cutover autorizado.

## 2. Secuencia obligatoria vigente

```text
FUENTES Y APROBACIONES
→ MANIFEST FINAL
→ GATE SOURCE/STATIC
→ RUNTIME MULTIROL
→ ROOT FIX SOURCE-ONLY SI EL GATE ES DEFECTUOSO
→ CLOUD FRONTEND ACUMULADO
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ GATES
→ DEV ÚNICO SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER
```

No dividir la aprobación en candidatas o shells parciales.

## 3. Estado alcanzado

- `29_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED`;
- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 aprobado/frozen;
- Corte 2A/V174 aprobado/frozen;
- Corte 3/V182 frozen active baseline;
- manifest final Phase A;
- source/static PASS con 53/53 blobs;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados.

## 4. Autoridad HR

Último runtime:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Queda prohibido usar `616` o `2026-07` como invariantes runtime.

## 5. Reejecución final Cliente

Paula autorizó una única reejecución final. La solicitud fue consumida exactamente una vez.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Fallo:

`client_assertions → CLIENT_PORTAL_INVALID`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado final:

- membership temporal eliminado;
- claims finales sin cambio;
- usuarios creados 0;
- cambios/resets de contraseña 0;
- provider prestate restaurado;
- producción intacta.

## 6. Causa raíz vigente

El gate Cliente combina:

```text
clientModule && panorama && !blocked
```

Las etapas anteriores ya habían probado el módulo `cli_dashboard`, Auth, HR/paridad y estado no bloqueado. El gate no navega explícitamente al Portal Cliente y depende de encontrar copy de Panorama en la vista posterior al login.

La corrección siguiente debe ser source-only y localizada en el gate:

1. navegación explícita a `cli_dashboard`;
2. espera de render;
3. marker/selector estable del módulo;
4. evidencia separada por condición;
5. gate local/estático sin provider writes;
6. detenerse antes de cualquier nueva ejecución DEV.

## 7. Cloud frontend

V5 permanece:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

V6 acumulativa debe incluir:

- Login y órbita refinados;
- responsive P1;
- PDF P1;
- Excel P2;
- opción Regional;
- copy delegado;
- Ficha Shopper presentacional;
- capturas reales y manifest completo.

Cloud no toca backend, Auth, datos, cálculos, permisos, deploy ni producción.

## 8. P1/P2 vivos

- overlay A+B superseded;
- algunas gráficas no aparecen en PDF;
- Excel tiene presentación básica;
- responsive parcial.

No reabrir autoridades funcionales sin P0 demostrado.

## 9. Prohibiciones

- no candidata, rama, PR, shell, Firebase o Hosting paralelos;
- no aprobación fragmentada;
- no parche UI desde backend;
- no usuario Cliente nuevo;
- no JWT Emergent;
- no conteos/meses congelados;
- no reutilizar la autorización consumida;
- no reintento silencioso;
- no writes fuera de autorización;
- no Make/Gemini/pagos;
- no merge/producción antes del PASS acumulativo y humano.

## 10. Siguiente bloque exacto

```text
SOURCE-ONLY ROOT FIX DEL GATE CLIENTE
→ NAVEGACIÓN EXPLÍCITA A cli_dashboard
→ EVIDENCIA clientModule/route/panorama/blocked
→ GATE LOCAL/ESTÁTICO SIN PROVIDER WRITES
→ DETENERSE PARA NUEVA AUTORIZACIÓN
```

En paralelo:

```text
CLOUD V6
→ AUDITORÍA FOCAL
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

## 11. Estado seguro

- cambios funcionales `app/`: 0;
- provider prestate restaurado: sí;
- Hosting/Cloud Run: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
