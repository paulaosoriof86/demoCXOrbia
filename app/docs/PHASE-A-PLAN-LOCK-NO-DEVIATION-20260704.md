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

No dividir la aprobación en candidatas o shells parciales.

## 3. Estado alcanzado

- `29_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED`;
- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 aprobado/frozen;
- Corte 2A/V174 aprobado/frozen;
- Corte 3/V182 frozen active baseline;
- manifest final Phase A;
- source/static PASS con 53/53 blobs;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados;
- gate Cliente source/static focal PASS.

## 4. Autoridad HR

Último runtime observado:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Queda prohibido usar `616` o `2026-07` como invariantes runtime.

## 5. Reejecución Cliente previa

La solicitud fue consumida exactamente una vez.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Estado final:

- membership temporal eliminado;
- claims finales sin cambio;
- usuarios creados 0;
- cambios/resets de contraseña 0;
- provider prestate restaurado;
- producción intacta.

## 6. Causa raíz del gate Cliente — corregida

El gate anterior:

- no navegaba explícitamente a `cli_dashboard`;
- dependía de la vista inicial posterior al login;
- mezclaba módulo, ruta, render y bloqueo en una sola aserción;
- permitía que el rollback sobrescribiera la etapa original del fallo.

Correctivo cerrado:

1. `window.CX.router.nav('cli_dashboard')` explícito;
2. espera de `CX.session.view === 'cli_dashboard'`;
3. navegación `#nav-cli_dashboard` activa;
4. marker estable `#view .ph`;
5. evidencia separada `clientModule`, `route`, `panorama`, `blocked`;
6. errores específicos por capa;
7. `failedStageBeforeRollback` preservado.

## 7. Gate source/static focal — PASS

Ejecución:

- commit `5caca10137250d2a70308dd995262e368f981322`;
- run `30936681878`;
- job `92084479259`;
- decisión `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- gate interno `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- blockers 0;
- warnings 0.

Alcance:

- provider reads 0;
- credenciales 0;
- runtime 0;
- Auth/Firestore/membership writes 0;
- deploy 0.

## 8. Cloud frontend

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

## 9. P1/P2 vivos

- overlay A+B superseded;
- algunas gráficas no aparecen en PDF;
- Excel tiene presentación básica;
- responsive parcial.

No reabrir autoridades funcionales sin P0 demostrado.

## 10. Prohibiciones

- no candidata, rama, PR, shell, Firebase o Hosting paralelos;
- no aprobación fragmentada;
- no parche UI desde backend;
- no usuario Cliente nuevo;
- no JWT Emergent;
- no conteos/meses congelados;
- no reutilizar autorizaciones consumidas;
- no reintento silencioso;
- no writes fuera de autorización;
- no Make/Gemini/pagos;
- no merge/producción antes del PASS acumulativo y humano.

## 11. Siguiente bloque exacto

El root fix source-only está cerrado. Solo con nueva autorización expresa:

```text
SNAPSHOT CLIENTE
→ MEMBERSHIP IDEMPOTENTE
→ READBACK
→ RUNTIME STAFF/CLIENTE/SHOPPER
→ TRES RECARGAS Y NUEVA PESTAÑA
→ HR DINÁMICA
→ FINANZAS/PORTALES/RESERVAS
→ CONSERVAR SOLO CON PASS
→ ROLLBACK AUTOMÁTICO SI FAIL
```

En paralelo:

```text
CLOUD V6
→ AUDITORÍA FOCAL
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

## 12. Estado seguro

- cambios funcionales `app/`: 0;
- provider reads en el bloque source-only: 0;
- Auth/Firestore/membership writes: 0;
- Hosting/Cloud Run: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
