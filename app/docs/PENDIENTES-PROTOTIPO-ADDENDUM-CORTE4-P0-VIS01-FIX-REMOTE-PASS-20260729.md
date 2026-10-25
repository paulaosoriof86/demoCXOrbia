# PENDIENTES PROTOTIPO — Corte 4 · P0-C4-VIS-01

**Fecha:** 2026-07-29  
**Estado:** `P0_FIX_REMOTE_PASS__HUMAN_VISUAL_PENDING`

## Resuelto técnicamente

`P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`.

La corrección focalizada backend/core y los gates automáticos locales/remotos ya pasan:

- no fallback `localStorage/demo`;
- no fixtures Retail/Banca/Restaurantes;
- no badge `Demo comercial · datos ficticios`;
- conteos backend vacío en cero;
- `demoMode=false`;
- `fallbackUsed=false` observable desde el primer estado;
- 0 data writes.

Evidencia:

- diagnóstico PASS: `58f227e2d67c0efa15c363e19e2cbcfea91e19b8`;
- revalidación remota PASS: `424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`.

## Pendiente vivo

1. Revalidación visual humana de Paula de la nueva URL.
2. Si no aparece otro P0: freeze Corte 4.
3. Retirar IAM temporal elevado y dejar runner en Viewer.
4. Iniciar Corte 5 materialización DEV con dry-run/idempotencia.

## No bloqueantes heredados

P1/P2 de PDF sin gráficas, Excel básico, reportKit y copy permanecen en backlog transversal. No reabren Corte 3 ni sustituyen el gate visual actual.

## Claude

No requiere nueva candidata ni modificación UI por P0-C4-VIS-01. Solo abrir tarea si la nueva validación visual aporta un P0 frontend reproducible.
