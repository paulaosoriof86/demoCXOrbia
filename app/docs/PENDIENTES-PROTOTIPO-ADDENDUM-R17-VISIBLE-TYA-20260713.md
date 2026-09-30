# Pendientes prototipo — corrección visible TyA R17

Fecha: 2026-07-13

## Estado del redeploy

La build corregida visible TyA R17 fue redesplegada en Firebase Hosting DEV y verificada remotamente.

- run deploy: `29285177647`;
- build: `tya-visible-r17-source-safe`;
- commit desplegado: `cf4c845722e2bbe2b401b2b332ff9f4d2f6cb803`;
- smoke remoto independiente: `29285540738`;
- decisión: `PASS_VISIBLE_TYA_DATA_R17`;
- 13/13 rutas críticas;
- 0 blockers, warnings, errores de consola o página.

## Cleanup confirmado

- workflow temporal de redeploy: eliminado;
- marcador temporal de autorización: eliminado;
- no puede ejecutarse nuevamente con la autorización consumida;
- drift gate solo tolera esas rutas históricas mientras permanezcan borradas;
- remote smoke canónico: manual-only y parametrizable.

## P0

No existe un P0 de diseño o módulo para Claude por el binding R17.

El defecto de conexión de datos quedó resuelto en la build DEV sin modificar la candidata V110 ni `/app/modules` o `/app/core`.

## Pendiente visual concreto para Claude

### Mi Día — periodo vs calendario

- El selector de periodo muestra JUL 2026.
- El encabezado de `Mi Día` identifica `Cinépolis Julio 2026`.
- El calendario/cronograma puede abrir visualmente en junio de 2026.

Claude debe auditar la relación entre periodo activo y mes mostrado por el cronograma.

Criterios:

- no hardcodear Cinépolis ni julio;
- usar el periodo activo de `CX.data`;
- conservar navegación manual del calendario si el usuario decide cambiar mes;
- no modificar el contrato backend;
- documentar impacto en manual de Mi Día, Dashboard y Academia.

Prioridad: P1 visual/operativa, no bloquea el source-safe ni el redeploy.

## Identidad temporal

`Admin Demo` continúa visible como perfil de prueba porque Auth real permanece HOLD. No debe presentarse como usuario real de TyA ni ocultarse mediante datos inventados. Se reemplazará cuando se active Auth/claims bajo su gate correspondiente.

## Revisión humana preparada

Paula debe confirmar:

- login TyA, GT/HN y sin badge Demo comercial;
- proyecto Cinépolis únicamente;
- 14 periodos independientes;
- JUL 2026 como periodo reciente;
- 44 visitas en el periodo seleccionado y 616 históricas;
- 210 shoppers source-safe;
- ausencia de Retail/Banca/Restaurantes;
- estado source-safe listo, sin afirmar importación o producción.

## Pendientes acumulados que permanecen

- Auth/roles reales;
- materialización Firestore;
- 3 referencias shopper en revisión 210/213;
- certificaciones carryover pendientes de fuente materializable;
- liquidaciones/pagos con estados confirmados;
- Make/HR sync;
- Gemini con revisión humana;
- producción.

## No tocar

- módulos y core del source lock V110 desde backend;
- Firestore/Auth/rules/Functions sin autorización;
- materialización;
- Make/Gemini;
- pagos o producción.

## Clasificación

- **Reusable CXOrbia:** checklist visible con criterios medibles y separación periodo/calendario.
- **Exclusivo cliente:** datos TyA/Cinépolis.
- **Claude/prototipo:** P1 Mi Día periodo vs calendario; identidad temporal honesta.
- **Academia:** criterios de revisión por ambiente, periodo y rol.
- **Sin impacto Claude:** deploy, proof, hashes, adapter build-only y cleanup.
