# PENDIENTES PROTOTIPO — ADDENDUM C6 AUTH DIGEST PASS + PHASE2 SYSTEMIC UPDATE RISK

**Fecha:** 2026-08-07

## Pendiente vivo backend

No repetir PREWRITE perfil por perfil. Antes de cualquier Auth write debe cerrarse en un solo universo la revalidación de las 45 filas `UPDATE_AUTH` actuales.

Hallazgo source-safe:

```text
UPDATE_AUTH actuales=45
suffix-collision risk rows=36
peer NO_OP=32
peer UPDATE_AUTH=4
first observed drift=19f2a621b1b350db911b candidateCount=0
```

La revalidación siguiente debe clasificar candidateCount `0/1/>1` para las 45 filas con anclas target-specific y global principal uniqueness, después reconstruir una sola vez las 340 filas/counts/digest.

## No pendientes / no reabrir

- SKIP13 cerrado 13/13.
- Multi-Auth adjudicado y cerrado.
- Lineage de `ac93d90d9e41512acdcd` cerrada `profile+visit`.
- canonicalización digest v3 PASS.
- frontend/prototipo sin cambios.

## Estado seguro

Auth no ejecutado; write boundary no alcanzado; producción intacta.
