# Pendientes prototipo — DEV Hosting R17

Fecha: 2026-07-13

## P0

No se detectó P0 frontend nuevo.

El smoke remoto DEV confirmó:

- 13/13 rutas;
- 0 errores de consola;
- 0 errores de página;
- 0 blockers;
- source-safe activo en Admin, Cliente y Shopper.

No pedir nueva candidata Claude por este bloque.

## P1 acumulado

1. Mantener visible que el entorno es DEV source-safe, no producción.
2. Mantener el gap shopper 210/213 como revisión backend.
3. No presentar control financiero o overlay exacto como pago confirmado.
4. No presentar certificaciones carryover como materializadas.
5. Conservar los 40 hallazgos de copy ya registrados para un paquete futuro, sin reabrir V110.

## No tocar desde prototipo

- adapters, contracts, tools y workflows;
- Firebase project/rules/secrets;
- materialización Firestore;
- Auth claims;
- deploy o producción;
- Make/Gemini/pagos.

## Clasificación

- **Reusable CXOrbia:** estados DEV, materialización y producción.
- **Exclusivo cliente:** conteos TyA/Cinépolis.
- **Claude/prototipo:** sin P0; P1 acumulado.
- **Academia:** explicar el entorno remoto source-safe.
- **Sin impacto Claude:** evidencia CI y Hosting.
