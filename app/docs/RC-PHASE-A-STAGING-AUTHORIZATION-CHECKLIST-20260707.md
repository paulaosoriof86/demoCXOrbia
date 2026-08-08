# RC Phase A staging authorization checklist

Fecha: 2026-07-07

## Objetivo

Dejar claro que el siguiente paso requiere autorizacion explicita de Paula antes de ejecutar cualquier deploy.

## Decision pendiente

Paula debe confirmar una de estas opciones:

1. Autorizar preview/staging controlado con integraciones apagadas.
2. Mantener PR y seguir backend sin deploy.

La opcion recomendada tecnicamente es:

- preview/staging controlado con integraciones apagadas.

## Confirmacion requerida

Para ejecutar el siguiente movimiento, la frase esperada debe ser equivalente a:

> Autorizo preview/staging controlado con integraciones apagadas.

Sin esa autorizacion, no se debe ejecutar deploy ni mover PR a ready/merge.

## Gates que deben estar en verde

Antes de ejecutar:

- `CXOrbia Phase A RC Smoke Gate`: success.
- `CXOrbia Phase A Visual Smoke`: success.
- `CXOrbia RC Phase A Predeploy Gate`: success.
- `CXOrbia RC Phase A Drift Gate`: success.

## Scope permitido si Paula autoriza

- Hosting dev/controlado.
- Integraciones apagadas.
- Backend real desactivado.
- Sin reglas Firestore/Storage.
- Sin imports.
- Sin proveedores externos.

## Scope prohibido

- Produccion real con integraciones activas.
- Merge final automatico.
- Firestore/Auth/Storage reales.
- HR writes reales.
- Make/Gemini/mensajeria/correo reales.
- Import real.
- Pagos reales automaticos.
- Datos sensibles crudos.

## Postvalidacion

Despues del staging debe validarse:

- shell/login;
- Dashboard;
- Postulaciones;
- Reservas;
- Automatizaciones;
- Cuestionario shopper;
- Finanzas;
- Academia;
- consola;
- copy honesto;
- gates cerrados.

## Estado seguro

Este documento no ejecuta deploy, merge, imports ni proveedores reales.
