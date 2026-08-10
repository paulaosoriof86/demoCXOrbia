# PENDIENTES PROTOTIPO — ADDENDUM C6 AUTH DUPLICATE KEEPER ONE-READ STOP

**Fecha:** 2026-08-10  
**Estado:** `STOP_RETRY_KEEPER_ANCHOR_INSUFFICIENT_4`

## Cerrado

- falso positivo temporal del source gate: corregido y PASS;
- universo: exactamente 5 grupos / 10 candidate fingerprints;
- Auth DEV: 228 preservados;
- `fd891812eca020d27ee3`: política cerrada como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`, sin repair TyA;
- request one-shot consumido y workflows temporales retirados;
- segundo provider read: no ejecutado.

## P0 vivo

Quedan cuatro grupos con acceso efectivo potencial y sin keeper reproducible:

```text
1acdcb3782b7cf351056 -> AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
2c4d19f2b066835473d3 -> AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
54225792eeb65f6739c0 -> AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
ae2f920fe6d9ce1fdd82 -> AMBIGUOUS_CLIENT_KEEPER_LINEAGE
```

En los tres pares staff los discriminadores autorizados son equivalentes y no existe `canonicalImportedStaffClass` para ninguno. En Cliente ninguno coincide con la lineage canónica de readback y ambos coinciden con los dos hashes históricos.

## No hacer

- no ejecutar segundo provider read con la autorización consumida;
- no repair Auth;
- no elegir keeper por antigüedad, orden, nombre, email, UID o apariencia;
- no reconstruir las 340 identidades;
- no repetir PREWRITE/Activation;
- no nuevo smoke;
- no compensar desde frontend ni relajar scopes/RBAC;
- no deploy, merge ni producción.

## Ruta corta

Siguiente bloque sugerido: `C6 AUTH DUPLICATE OWNERSHIP ANCHOR SOURCE-SAFE EVIDENCE RECONCILIATION — NO PROVIDER`.

Buscar solo en evidencia/source-safe existente una ancla no temporal y no PII de propiedad/lineage para los cuatro grupos. Si no existe, declarar `HUMAN_OWNERSHIP_DECISION_REQUIRED`; no inferir.
