# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `SOURCE_STATIC_PASS__CLIENT_ROUTE_SOURCE_STATIC_PASS__RUNTIME_RETRY_NOT_AUTHORIZED__CLOUD_V5_HOLD__NO_PRODUCTION`

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
→ GATE LOCAL/ESTÁTICO
→ RUNTIME MULTIROL SOLO CON AUTORIZACIÓN EXPRESA
→ CLOUD FRONTEND ACUMULADO
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ GATES
→ DEV ÚNICO SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER
```

## 3. Estado alcanzado

- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- M1/Corte 1, Corte 2A/V174 y Corte 3/V182 preservados;
- manifest final Phase A;
- source/static PASS con 53/53 blobs;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados;
- gate Cliente source/static focal PASS.

## 4. Autoridad HR

- 15 periodos;
- 660 visitas;
- 209 shoppers.

No usar `616` o `2026-07` como invariantes runtime.

## 5. Runtime Cliente previo

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Provider prestate restaurado y producción intacta.

## 6. Root fix Cliente — cerrado

Correctivo:

1. navegación explícita a `cli_dashboard`;
2. espera de ruta activa;
3. marker estable `#view .ph`;
4. evidencia separada `clientModule`, `route`, `panorama`, `blocked`;
5. errores específicos;
6. etapa original preservada antes del rollback.

Gate:

- run `30936681878`;
- job `92084479259`;
- `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- interno `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- blockers 0;
- warnings 0;
- provider reads, runtime y writes 0.

## 7. Cloud frontend

V5 sigue HOLD. V6 acumulativa debe incluir Login/órbita, responsive P1, PDF P1, Excel P2, Regional, copy delegado, Ficha Shopper y evidencia completa.

## 8. P1/P2 vivos

- overlay A+B superseded;
- PDF con gráficas incompletas;
- Excel básico;
- responsive parcial.

## 9. Prohibiciones

- no baseline paralela;
- no parche UI desde backend;
- no usuario Cliente nuevo;
- no conteos/meses congelados;
- no reutilizar autorizaciones consumidas;
- no reintento silencioso;
- no writes, deploy, merge o producción fuera de autorización.

## 10. Siguiente bloque exacto

Solo con nueva autorización:

```text
SNAPSHOT CLIENTE
→ MEMBERSHIP IDEMPOTENTE
→ READBACK
→ RUNTIME MULTIROL CON GATE CORREGIDO
→ CONSERVAR SOLO CON PASS / ROLLBACK SI FAIL
```

En paralelo:

```text
CLOUD V6
→ AUDITORÍA FOCAL
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

## 11. Estado seguro

- cambios funcionales `app/`: 0;
- provider reads: 0;
- Auth/Firestore/membership writes: 0;
- Hosting/Cloud Run: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
