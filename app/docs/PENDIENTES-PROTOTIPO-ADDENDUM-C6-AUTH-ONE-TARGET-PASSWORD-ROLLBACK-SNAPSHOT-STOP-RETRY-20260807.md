# PENDIENTES PROTOTIPO — Addendum C6 one-target password rollback snapshot

**Fecha:** 2026-08-07

## Hallazgo

No se detectó un bug de UI ni una regresión del prototipo. El bloqueo es exclusivamente backend/Auth prewrite:

```text
TARGET_AUTH_RESOLUTION_COUNT_0
```

El resolver focal no encontró el target usando el claim actual `shopperId`; esto es compatible con que el plan final tenga `changes.claims=true` para ese mismo perfil.

## Acción para prototipo

Ninguna en este bloque. No parchear Login, Shopper ni administración para compensar un problema de resolución backend. No exponer hashes, salts, UID, fingerprints ni mensajes técnicos al usuario final.

## Pendiente vivo backend

Resolver de forma read-only el único Auth candidate con las anclas técnicas mínimas ya existentes. Solo después podrá evaluarse hash/salt/config y snapshot exacto.

Clasificación: `Sin impacto Claude` hasta que exista un cambio funcional de experiencia o copy verificable.
