# CAMBIOS BACKEND — C6 Deterministic Suffix Crosswalk Root Cause

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Exclusivo TyA · Sin impacto visual Claude

## Corrección prevalente

Este documento corrige la interpretación inicial del artifact `8953330337`.

La ejecución produjo `credentialsMapped=88` y `credentialsUnmapped=21`, mientras el clasificador estable anterior tenía `101/8`. La diferencia exacta de 13 no corresponde a cambios provider: el planner determinístico omitió propagar al `relationIndex` las llaves técnicas de las fuentes HR/visitas/certificaciones/liquidaciones ya enlazadas.

## Causa raíz

```text
stable classifier link():
  linkedByProfile += source
  relationIndex += every TECH_KEY from linked source

deterministic planner link():
  linkedByProfile += source
  relationIndex unchanged
```

El mapeo posterior de credenciales depende de `relationIndex`; por ello se perdieron 13 anclajes técnicos antes de completar apellidos y puntuar Auth.

## Dictamen corregido

```text
source/static policy tests=PASS
provider execution=HOLD
credential crosswalk parity=FAIL 88/21 vs 101/8
provider result authoritative for Auth repair=false
STOP_RETRY=true
```

Las cifras observadas `71 completados / 12 pendientes / 65 grupos / 142 identidades / 1 multi-Auth / plan 340 con 13 HOLD` son diagnóstico provisional. No reemplazan el baseline estable ni autorizan materialización.

## Correctivo pendiente

Bloque source-only:

1. propagar `TECH_KEYS` de cada fuente enlazada al crosswalk;
2. agregar fixture y gate de paridad `101 mapped / 8 unmapped`;
3. bloquear `readyForAuthRepair` ante cualquier drift;
4. conservar política determinística 4/6/8;
5. detenerse después de source/static, sin provider read;
6. requerir nueva autorización puntual para revalidar.

## Estado seguro

Una lectura provider consumida. Segundo intento `0`. Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, pagos, merge y producción: `0/false`.
