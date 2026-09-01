# RC Phase A staging deploy runbook

Fecha: 2026-07-07

## Bloque completado

Se preparo runbook de preview/staging controlado para que el siguiente movimiento sea rapido, ordenado y sin improvisacion.

Este documento NO ejecuta deploy.

## Estado actual

La rama esta apta para preparar preview/staging controlado porque pasaron:

- `CXOrbia Phase A RC Smoke Gate`.
- `CXOrbia Phase A Visual Smoke`.
- `CXOrbia RC Phase A Predeploy Gate`.
- `CXOrbia RC Phase A Drift Gate`.

Runtime validado vigente:

- `009c5958fed878a739b129916d1958ef22d4267b`

## Objetivo del movimiento

Publicar una salida controlada para revision visual/operativa, con:

- integraciones reales apagadas;
- gates cerrados;
- sin import real;
- sin proveedores reales;
- sin cambios de reglas Firebase/Supabase;
- sin datos sensibles crudos.

## Alcance permitido

Solo Hosting controlado.

No permitido en este movimiento:

- Firestore real activo;
- Auth real activo;
- Storage real activo;
- HR writes reales;
- Make real;
- Gemini real;
- mensajeria/correo real;
- import real;
- reglas Firestore/Storage;
- pagos reales automaticos.

## Precondiciones

Antes de cualquier deploy, confirmar:

1. Paula autoriza explicitamente preview/staging controlado.
2. PR #7 sigue draft o se decide expresamente otra cosa.
3. `CXOrbia RC Phase A Drift Gate` esta en success.
4. `CXOrbia RC Phase A Predeploy Gate` esta en success.
5. `CXOrbia Phase A Visual Smoke` esta en success.
6. `CXOrbia Phase A RC Smoke Gate` esta en success.
7. No hay secretos ni API keys reales en repo.
8. `backend-config.js` mantiene `enabled: false`.
9. No se despliegan reglas ni funciones.

## Comando previsto solo si Paula autoriza

El movimiento previsto debe limitarse a Hosting del target dev/controlado:

```bash
firebase deploy --only hosting:cxorbia-dev --project cxorbia-backend-dev
```

No ejecutar:

```bash
firebase deploy
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only functions
```

## Validacion posterior obligatoria

Despues de publicar preview/staging o deploy controlado, validar:

- login/shell;
- Dashboard;
- Postulaciones;
- Reservas;
- Automatizaciones;
- Cuestionario shopper;
- Finanzas;
- Academia admin;
- Academia shopper;
- copy visible honesto;
- consola sin errores criticos;
- ninguna promesa de envio/sync/pago real;
- backend real sigue apagado.

## Criterio de bloqueo o rollback

Bloquear/rollback si aparece:

- pantalla blanca;
- error JS critico;
- navegacion base rota;
- guard rompe render;
- Academia no carga;
- textos que prometen envio/sync/pago real;
- datos sensibles visibles;
- intento de escritura real;
- integracion externa activa.

## Claude

No hay paquete nuevo importante para Claude.

Solo se notificara a Claude si la validacion visual en staging muestra una regresion real o pendiente UX/prototipo importante.

## Estado seguro

Sin deploy ejecutado, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
