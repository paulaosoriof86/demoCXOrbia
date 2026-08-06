# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_AUTHORITY_SOURCE_ROOT_FIX_APPLIED__PROVIDER_TRIGGER_NOT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente vigente

Leer primero:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- Frontend acumulativo y composición canónica.
- Corte3, R17N y bloques históricos protegidos.
- Login único y contratos Auth/RBAC.
- Universo Shopper 65/65.
- Disposición de 13 perfiles: `HOLD=0`, fuera de repair Auth, historia preservada.
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas preservados.

## 3. Root fix HR viva aplicado

Backend ahora exige:

- metadata provider para descubrir tabs y periodos;
- periodo calendario dinámico;
- registry como cache/last-known-good, nunca autoridad primaria;
- una sola revisión source-safe para país/pestaña y todos los módulos;
- `sourceRevision` estable basada en contenido;
- cambios históricos reflejados en una nueva revisión;
- cero meses, conteos o históricos fijados en código.

Se eliminaron expectativas permanentes como julio/agosto fijo, `34/10`, `616`, `684` y `1406`.

## 4. Regla obligatoria para frontend

Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper deben consumir la misma `sourceRevision`. Un refresh con la misma revisión no debe provocar reload agresivo; una revisión distinta debe invalidar las proyecciones derivadas.

No modificar `/app/modules/*` ni `/app/core/*` por este bloque. No crear shell paralela ni candidata nueva.

## 5. Estado provider

El request read-only `4e404f2db48ff8b07430d7ac7505eff6c040458a`, ligado al source commit `31f4af0f7501b23b4e72b1a5f8457669a5f91c77`, no produjo run/status/evidence observable dentro del timeout.

```text
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
STOP_RETRY=true
```

No declarar agosto PASS/FAIL y no repetir la lectura sin diagnóstico de control-plane y autorización fresca.

## 6. Siguiente bloque

```text
CONTROL-PLANE READ-ONLY DIAGNOSIS
→ recuperar run/job/log/artifact si existe
→ o demostrar providerReads=0
→ única lectura viva corregida solo con autorización
→ confirmar 2026-08 GT/HN, cambio histórico y sourceRevision transversal
→ preparar Auth con HOLD=0
```

## 7. Seguridad

```text
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
