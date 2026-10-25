# PENDIENTES PROTOTIPO — Addendum C6 Client route harness

**Fecha:** 2026-08-05

## Resuelto

### P1 QA — predicado inválido del Portal Cliente

Estado: `RESUELTO_PASS`.

La dependencia de `#nav-cli_dashboard.active` fue sustituida en el harness por observabilidad real:

```text
session.view=cli_dashboard
#view existe
#view .ph existe
#view texto no vacío
renderException=null
```

Resultado:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC
predicateVersion=session-view-canonical-render-v1
```

No se requirió parche del Portal Cliente, router, Login ni Hosting.

## Pendiente activo

### Validación humana y freeze

- revisar visualmente Portal Cliente en la release DEV vigente;
- confirmar Portal Shopper, Finanzas y Reservas;
- registrar aceptación o hallazgos concretos;
- emitir freeze documental únicamente con PASS humano.

No requiere deploy para iniciar.

## Deuda no bloqueante preservada

- PDF: algunas rutas todavía pueden omitir gráficas;
- Excel: formato visual básico;
- mejoras P1/P2 de presentación deben mantenerse separadas del cierre de Phase A.

## Prohibiciones

No reabrir `client_route_wait` como defecto del producto sin evidencia nueva reproducible. Cero cambios de frontend/runtime, deploy, writes, merge o producción en el cierre humano.
