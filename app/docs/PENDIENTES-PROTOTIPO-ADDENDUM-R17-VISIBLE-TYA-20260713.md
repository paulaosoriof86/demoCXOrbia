# Pendientes prototipo — corrección visible TyA R17

Fecha: 2026-07-13

## P0

No existe un P0 de diseño o módulo para Claude.

El defecto detectado fue de conexión de datos en la build DEV, no de la candidata V110.

## Pendiente inmediato

Redesplegar en Firebase Hosting DEV la build corregida y ejecutar smoke remoto de contenido visible.

La siguiente revisión de Paula deberá confirmar:

- login TyA, GT/HN y sin Demo comercial;
- proyecto Cinépolis únicamente;
- 14 periodos independientes;
- JUL 2026 como periodo reciente;
- 44 visitas en el periodo seleccionado y 616 históricas;
- 210 shoppers source-safe;
- ausencia de Retail/Banca/Restaurantes;
- estado source-safe listo, sin afirmar producción.

## P1 acumulado

Se mantienen los pendientes previos de copy y estados honestos. No se agregan cambios de diseño hasta tener la revisión humana de la build corregida.

## No tocar

- módulos y core del source lock V110;
- Firestore/Auth/rules/Functions;
- materialización;
- Make/Gemini;
- pagos o producción.

## Clasificación

- **Reusable CXOrbia:** checklist visible con criterios medibles.
- **Exclusivo cliente:** datos TyA/Cinépolis.
- **Claude/prototipo:** sin P0 nuevo.
- **Academia:** criterios de revisión por ambiente.
- **Sin impacto Claude:** deploy y adapter build-only.
