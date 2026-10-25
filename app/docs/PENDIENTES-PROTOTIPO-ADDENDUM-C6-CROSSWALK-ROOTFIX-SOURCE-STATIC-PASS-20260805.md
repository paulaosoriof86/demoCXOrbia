# PENDIENTES PROTOTIPO — Addendum C6 Crosswalk Root Fix Source/Static PASS

**Fecha:** 2026-08-05

## Cerrado en source

- propagación de `TECH_KEYS` desde fuentes enlazadas hacia `relationIndex`;
- preservación del `basis` de HR, visita, certificación y liquidación;
- fixture estático del crosswalk;
- referencia estable `101 mapped / 8 unmapped`;
- hard stop ante drift;
- `readyForAuthRepair` condicionado a paridad;
- política de sufijo 4/6/8 y esquema de 340 filas preservados.

## Pendiente vivo

1. Ejecutar una sola revalidación provider read-only expresamente autorizada.
2. Confirmar o rechazar paridad real `101/8` con el planner corregido.
3. Recalcular los apellidos activos pendientes.
4. Recalcular el baseline de colisiones e identidades activas.
5. Resolver o conservar en HOLD el perfil multi-Auth.
6. Regenerar el plan no superpuesto de 340 filas.
7. Solo con PASS, diseñar bloque independiente de Auth repair DEV con snapshot, idempotencia y rollback.
8. Solo después, evaluar Hosting DEV y validación humana.

## Datos provisionales que no deben usarse como final

```text
collisionGroupsObserved=65
activeIdentitiesObserved=142
remainingActiveSurnamesObserved=12
multiAuthTieObserved=1
planDigestObserved=831c9602aa5686aea22694970aa1beb9557f4bb7b966d4233e028e63fb456d01
```

## Prohibiciones

- ejecución parcial del plan;
- provider retry sin nueva autorización;
- Auth/password/membership/Firestore/Rules/Storage/HR writes;
- deploy;
- cambios de frontend basados en cifras provisionales;
- merge o producción.
