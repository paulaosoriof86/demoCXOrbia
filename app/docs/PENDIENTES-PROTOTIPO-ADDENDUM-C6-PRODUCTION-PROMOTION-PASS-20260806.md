# PENDIENTES PROTOTIPO — Addendum C6 promoción source-only PASS

**Fecha:** 2026-08-06

## Cerrado

- estrategia de producción autorizada;
- contrato materializado;
- gate source-only PASS;
- proyecto limpio existente aceptado como futuro entorno productivo;
- cero writes, deploy, merge o cutover.

## Pendiente real

1. Evidencia terminal del request HR v4 `ac2032ec...`.
2. PASS de HR viva `2026-08`, GT/HN, historia y `sourceRevision`.
3. Auth Shopper con autorización y gate separados.
4. Smoke acumulativo multirol.
5. Validación humana y rollback.
6. Autorización específica y único cutover.

No crear otro proyecto PROD ni archivos `.firebaserc.prod`/`firebase.prod.json`: la estrategia autorizada es promover el proyecto limpio existente.
