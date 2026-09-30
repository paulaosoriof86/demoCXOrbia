# ACADEMIA — IMPACTO V156 GATE COMERCIAL

Fecha: 2026-07-16

## Estado

El P0 comercial continúa abierto porque manuales y cursos accesibles a audiencias comerciales conservan jerga interna.

## Regla

Para admin, ops, coordinador, aliado, shopper y cliente:

- explicar estados de forma funcional;
- no mostrar `backend`, `runtime`, `pending_backend`, `connectionRef`, `reviewQueue`, source lock ni rutas internas;
- conservar contenido técnico únicamente para audiencia interna protegida y realmente inaccesible desde el build comercial.

## Impacto

- No cambia la profundidad de Academia.
- No se eliminan explicaciones de seguridad o estados honestos; se reescriben en lenguaje comercial.
- No se modifica certificación ni rutas por rol salvo visibilidad de contenido técnico.
- La próxima candidata debe incluir Academia y Manuales dentro del gate runtime por audiencia.

Clasificación: `Academia` + `Claude/prototipo`. Sin impacto TyA/Firebase/backend real.