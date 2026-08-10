# RESUMEN PARA CLAUDE — C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE

**Fecha:** 2026-08-10  
**Estado:** `PAULA_MINIMUM_OWNERSHIP_DECISION_REQUIRED`

Backend no debe resolver estos duplicados desde UI ni por heurística. La evidencia source-safe no permite elegir keeper en A–C y el par Cliente D contiene dos históricos mientras el Cliente canónico actual es un principal separado ya validado.

## No tocar frontend

No crear selector de duplicados, no mostrar fingerprints al usuario final, no relajar RBAC y no compensar ownership desde `app/modules` o `app/core`.

## Estado por grupo

- `1acd...` super: decisión humana entre conservar ambos, confirmar canónico externo y retirar ambos posteriormente, o elegir exactamente un member.
- `2c4d...` admin: igual.
- `542...` ops: igual.
- `ae2f...` Cliente: existe canónico externo validado; puede aprobarse como único canónico y dejar ambos históricos como no canónicos pendientes de repair separado.

## Impacto prototipo

Ningún cambio visual/UX en este bloque. Conservar las 20/20 superficies Phase A y el contrato Auth/RBAC actual.
