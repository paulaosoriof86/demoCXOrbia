# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_CONTROL_PLANE_OBSERVABILITY_ROOT_FIX_PASS__PREVIOUS_V2_READ_UNKNOWN__NO_NEW_PROVIDER_READ__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- Frontend acumulativo, composición canónica y módulos Phase A.
- Universo Shopper equivalente 65/65.
- 13 perfiles omitidos de Auth: `HOLD=0`, historia preservada.
- Login único, contratos Auth/RBAC y plan Auth source-only.
- Finanzas, Liquidaciones, Portales y Reservas.
- Root fix HR viva source aplicado.
- Root fix de observabilidad control-plane aplicado.

## 3. Observabilidad preparada

El siguiente request válido debe ser v3 y producir:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

También debe producir journal y artifact sanitizados.

## 4. Antecedente v2 no resuelto

```text
request=4e404f2db48ff8b07430d7ac7505eff6c040458a
source=31f4af0f7501b23b4e72b1a5f8457669a5f91c77
provider read consumido=DESCONOCIDO
retryExecuted=false
```

No reinterpretar como cero y no tocar el request actual.

## 5. P0 único actual

Autorización fresca y explícita para una sola ejecución lógica provider read-only adicional bajo request v3, reconociendo que el consumo del v2 permanece desconocido.

## 6. Orden inmediato

1. Autorizar un único request v3 ligado al HEAD exacto.
2. Observar status/journal/artifact.
3. Confirmar `2026-08`, tabs GT/HN y conteos reales.
4. Confirmar mutación histórica y una `sourceRevision` común.
5. Preparar repair Auth con overlay SKIP13 y `HOLD=0`.
6. Validación acumulativa DEV.
7. Cutover con autorización específica.

## 7. No hacer

- No hardcodear agosto, julio, periodos o conteos.
- No tratar snapshots/Firestore como autoridad HR.
- No repetir import histórico por conteo.
- No reabrir los 13 perfiles.
- No ejecutar request v2.
- No ejecutar Auth, deploy, merge o producción sin gate separado.

## 8. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes continúan documentadas, pero no sustituyen el P0 de HR viva.

## 9. Seguridad

```text
nuevo provider read=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
