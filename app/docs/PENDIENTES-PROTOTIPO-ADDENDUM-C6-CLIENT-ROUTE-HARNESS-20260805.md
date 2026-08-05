# PENDIENTES PROTOTIPO — Addendum C6 client route harness

**Fecha:** 2026-08-05

## Pendiente activo

### P1 QA — predicado inválido del gate de Portal Cliente

El gate remoto acumulativo exige `#nav-cli_dashboard.active` después de una navegación directa mediante `CX.router.nav('cli_dashboard')`.

Diagnóstico reproducible:

```text
sessionView=cli_dashboard
navElementExists=false
navActive=false
viewExists=true
pageHeaderExists=true
viewTextLength=690
renderException=null
```

Clasificación:

```text
OWNER=HARNESS
CODE=HARNESS_NAV_ACTIVE_SUBCONDITION_MISMATCH
PRODUCT_P0=false
```

Acción pendiente:

- ajustar solo `tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs` o su wrapper vigente;
- sustituir la dependencia del nodo de navegación por observabilidad real de ruta y render;
- ejecutar un gate semántico read-only focal;
- no desplegar.

## No pendientes de producto derivados de este hallazgo

- Portal Cliente no requiere parche.
- Router no requiere parche.
- Login no requiere parche adicional.
- Auth, claims, membership y contraseña no requieren cambios.

## Deuda no bloqueante preservada

- PDF: algunas rutas todavía pueden omitir gráficas.
- Excel: formato visual básico.
- La validación humana y freeze continúan pendientes después del rerun semántico.
