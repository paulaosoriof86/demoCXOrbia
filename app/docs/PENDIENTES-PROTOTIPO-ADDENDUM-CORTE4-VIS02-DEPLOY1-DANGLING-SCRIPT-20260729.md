# PENDIENTES PROTOTIPO — Corte 4 VIS-02 deploy 1

**Fecha:** 2026-07-29

## P0 vivo
`P0-C4-VIS-02` no puede cerrarse todavía porque la fuente corregida posterior al primer deploy no está publicada.

### Resuelto en repo
- empty backend no debe romper Admin;
- cambio Admin ↔ Shopper no debe conservar DOM/rol anterior;
- referencia huérfana `adapters/tya-phase-a-source-safe-dev-adapter.js` eliminada;
- gate de integridad de scripts PASS.

### Falta
1. nueva autorización expresa para exactamente 1 Hosting DEV final;
2. remote browser: 0 pageerrors, Admin vacío estable, Shopper vacío estable, retorno a Admin estable, 0 fixtures y 0/0/0/0;
3. validación visual humana;
4. freeze Corte 4;
5. retirar IAM temporal elevado a Viewer;
6. iniciar Corte 5.

## P1/P2 heredado
PDF sin gráficas, Excel básico, reportKit/copy continúan como backlog transversal y no deben mezclarse con este P0.
