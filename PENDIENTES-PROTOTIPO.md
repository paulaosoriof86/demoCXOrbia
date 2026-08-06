# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_AUTHORITY_SOURCE_ROOT_FIX_APPLIED__PROVIDER_TRIGGER_NOT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- Frontend acumulativo, composición canónica y módulos Phase A.
- Universo Shopper equivalente 65/65.
- 13 perfiles omitidos de Auth: `HOLD=0`, historia preservada.
- Login único, contratos Auth/RBAC y plan Auth source-only.
- Finanzas, Liquidaciones, Portales y Reservas.
- No nueva candidata, rama, PR o shell paralela.

## 3. Root fix HR viva aplicado

- Metadata provider descubre tabs y periodos.
- El periodo activo se deriva del calendario.
- Registry fijo queda como contingencia, no autoridad.
- País/pestaña usa una sola revisión.
- Cambio histórico debe cambiar `sourceRevision`.
- Planner sin conteos HR fijos.

## 4. P0 único actual

Resolver el estado de ejecución del request provider read-only:

```text
request=4e404f2db48ff8b07430d7ac7505eff6c040458a
source=31f4af0f7501b23b4e72b1a5f8457669a5f91c77
run/status/evidence observable=NO
provider read consumido=DESCONOCIDO
STOP_RETRY=true
```

No repetir la lectura sin diagnóstico de control-plane.

## 5. Orden inmediato

1. Diagnóstico read-only del control-plane sin tocar HR.
2. Recuperar run/job/log/artifact si existe.
3. Si no existe, demostrar `providerReads=0`.
4. Solo con autorización fresca, ejecutar una única lectura viva.
5. Confirmar `2026-08`, tabs GT/HN, conteos reales y mutación histórica.
6. Confirmar una `sourceRevision` común en todos los módulos.
7. Preparar repair Auth con overlay SKIP13 y `HOLD=0`.
8. Validación acumulativa DEV.
9. Cutover con autorización específica.

## 6. No hacer

- No hardcodear agosto, julio, periodos o conteos.
- No tratar snapshots/Firestore como autoridad de HR.
- No repetir import histórico por conteo.
- No reabrir los 13 perfiles.
- No ejecutar Auth, deploy, merge o producción sin gate separado.

## 7. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes continúan documentadas, pero no sustituyen el P0 de autoridad HR viva.

## 8. Seguridad

```text
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
