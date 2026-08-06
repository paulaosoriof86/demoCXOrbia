# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_CONTROL_PLANE_OBSERVABILITY_ROOT_FIX_PASS__PREVIOUS_V2_READ_UNKNOWN__NO_NEW_PROVIDER_READ__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

Leer primero:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- Frontend acumulativo y composición canónica.
- Login único y contratos Auth/RBAC.
- Universo Shopper 65/65.
- Disposición de 13 perfiles: `HOLD=0`, fuera de repair Auth, historia preservada.
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas.
- No crear nueva candidata, rama, PR o shell paralela.

## 3. Root fix HR viva aplicado

Backend exige:

- metadata provider para descubrir tabs y periodos;
- periodo calendario dinámico;
- registry como cache/last-known-good;
- una sola revisión source-safe para país/pestaña y módulos;
- `sourceRevision` estable basada en contenido;
- cambios históricos reflejados en nueva revisión;
- cero meses o conteos fijados en código.

## 4. Root fix de observabilidad

El workflow vigente exige request v3 y registra:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

También produce journal JSON y artifact sanitizado sin PII.

Commits:

```text
dcbfe1ce4b5a98df9f2cc650dc344f983ed7118f
c46e81bba4fd7424e6076e336bcaf86e82564c14
```

## 5. Regla obligatoria para frontend

Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper deben consumir la misma `sourceRevision`. Un refresh con la misma revisión no debe provocar reload agresivo; una revisión distinta debe invalidar proyecciones derivadas.

No modificar `/app/modules/*` ni `/app/core/*` por este bloque. Los estados técnicos del journal no deben mostrarse al usuario final.

## 6. Antecedente provider

```text
request v2=4e404f2db48ff8b07430d7ac7505eff6c040458a
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
retryExecuted=false
```

No declarar agosto PASS/FAIL y no reinterpretar el consumo como cero.

## 7. Siguiente bloque

```text
AUTORIZACIÓN FRESCA REQUEST V3
→ reconocer consumo v2 desconocido
→ una ejecución lógica provider read-only adicional
→ journal/status/artifact observables
→ confirmar 2026-08 GT/HN, cambio histórico y sourceRevision transversal
→ preparar Auth con HOLD=0
```

## 8. Seguridad

```text
nuevo provider read=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
