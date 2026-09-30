# ACADEMIA — IMPACTO I3.8/I3.9 · AUTH, MEMBERSHIP Y RUNTIME

**Fecha:** 2026-08-17 17:45 -06:00

## Concepto reusable

Crear correctamente una identidad en Firebase Auth no basta para afirmar que un usuario ya opera en la plataforma. El flujo completo requiere que el runtime cargue y verifique también la membership del tenant/proyecto y la publique en la sesión de la aplicación.

Cadena pedagógica:

`Auth principal → custom claims → tenant membership → profile → exact crosswalk → runtime wiring → product session/workspace`.

## Hallazgo aplicado

I3.8 demostró que Auth, claims, membership, profile y crosswalk del Shopper nuevo estaban correctos en provider. I3.9 encontró que el adapter reusable de Shopper membership existía, pero el protected DEV entrypoint no lo cargaba.

Esto muestra la diferencia entre:
- **componente implementado**, y
- **componente realmente integrado y ejecutado en el runtime**.

## Anti-patrón

No enseñar ni validar una integración solo porque el archivo existe o porque la base tiene los registros correctos. Debe probarse el circuito ejecutable desde el login hasta el workspace.

## Multi-tenant / multi-project

El wiring reusable obtiene tenant, Shopper y project scope desde claims/membership/provider. No debe codificar TyA, Cinépolis ni períodos como lógica global.

## Validación futura

El cierre correcto requiere un E2E visible sobre la misma build desplegada:
- login real;
- claims;
- membership;
- profile/crosswalk;
- workspace;
- reload/new-tab/segundo contexto;
- KPIs/estados consistentes.

Fuente vigente:
`SOURCE-LOCK-I3-8-PASS-I3-9-MEMBERSHIP-LOADER-ROOT-CAUSE-SOURCE-FIX-PENDING-DEV-GATE-20260817.md`.
