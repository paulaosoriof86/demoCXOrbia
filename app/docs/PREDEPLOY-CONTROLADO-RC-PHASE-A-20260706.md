# Predeploy controlado RC Phase A

Fecha: 2026-07-06

## Objetivo

Dejar listo el siguiente movimiento operativo despues de que el gate tecnico y el smoke visual pasaron.

## Estado actual

- RC Phase A controlada: apta tecnicamente.
- PR #7: debe seguir draft hasta autorizacion explicita.
- Produccion real con integraciones activas: no autorizada.

## Opcion recomendada

Avanzar primero a **preview/staging controlado** o deploy controlado con gates cerrados.

Motivo:

- ya hay evidencia tecnica y visual automatizada;
- todavia no hay backend real activo;
- no se deben activar proveedores reales ni imports reales en el mismo movimiento;
- Paula necesita validar visualmente el flujo antes de produccion real.

## Checklist predeploy controlado

### Antes del movimiento

- Confirmacion explicita de Paula.
- PR #7 sigue draft hasta decision.
- Verificar que el ultimo runtime validado fue `a7fb4f00cf1adf1e6e92ee7b1de897cfdbacd374`.
- Confirmar que documentos posteriores son solo documentales.
- Confirmar que no se activan secretos ni proveedores.
- Confirmar que no hay datos sensibles crudos.

### Durante el movimiento

- No activar Firestore real.
- No activar Auth real.
- No activar Storage real.
- No activar HR writes reales.
- No activar Make/Gemini.
- No activar correo/mensajeria real.
- No importar datos reales.
- No cambiar reglas Firebase/Supabase sin bloque separado.

### Despues del movimiento

Validar manualmente o con smoke:

- login/shell;
- Dashboard;
- Postulaciones;
- Reservas;
- Automatizaciones;
- Cuestionario shopper;
- Finanzas;
- Academia;
- copy honesto visible;
- sin errores criticos de consola;
- sin pantalla blanca.

## Criterio de rollback

Rollback o bloqueo si aparece:

- pantalla blanca;
- error JS critico;
- navegacion base rota;
- promesa visible de envio/sync/pago real;
- datos sensibles expuestos;
- intento de escritura real no autorizada;
- integracion externa activa sin gate.

## Lo que necesito de Paula

Para el siguiente movimiento necesito una decision explicita:

1. Autorizar **preview/staging controlado** con integraciones reales apagadas.
2. Autorizar **produccion controlada** solo visual/demo con integraciones reales apagadas.
3. Mantener en PR y seguir preparando backend antes de cualquier deploy.

## Estado seguro

Este documento no ejecuta deploy, merge, imports ni proveedores reales.
