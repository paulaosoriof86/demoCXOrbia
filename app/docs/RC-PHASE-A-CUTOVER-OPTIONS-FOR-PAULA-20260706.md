# RC Phase A cutover options for Paula

Fecha: 2026-07-06

## Objetivo

Dejar las opciones de siguiente movimiento sin frenar el avance y sin pedir trabajo innecesario a Claude.

## Estado actual

- RC Phase A controlada: apta tecnicamente.
- Gate tecnico: success.
- Smoke visual: success.
- Drift gate: agregado para proteger que no haya runtime nuevo sin revalidar.
- PR #7: draft, sin merge, sin produccion real.

## Opcion recomendada

### Opcion 1 - Preview/staging controlado

Recomendada como siguiente paso.

Ventajas:

- valida flujo visual en URL real/controlada;
- mantiene integraciones apagadas;
- permite a Paula revisar sin tocar produccion real;
- reduce riesgo antes del corte final.

Condiciones:

- no activar Firestore/Auth/Storage reales;
- no activar HR writes reales;
- no activar Make/Gemini/mensajeria/correo;
- no importar datos reales;
- no cambiar reglas Firebase/Supabase.

## Opcion 2 - Produccion controlada solo demo/visual

Posible si urge mostrar la plataforma, pero debe mantenerse con gates apagados.

Riesgo:

- puede confundirse con produccion real si no se comunica que es RC controlada;
- requiere validar copy honesto y estados demo.

## Opcion 3 - Seguir backend sin deploy

Tambien valida si Paula prefiere esperar antes de mostrarlo.

Ventaja:

- permite preparar base nueva, Auth, Storage, Make, Gemini e import antes de exponer.

Desventaja:

- retrasa salida visual/controlada.

## Recomendacion tecnica

Elegir opcion 1: preview/staging controlado con integraciones apagadas.

## Pendientes importantes para Claude

No hay pendientes nuevos suficientemente importantes para interrumpir a Claude ahora.

Los pendientes de Claude siguen documentados, pero en este punto urge mas avanzar con RC/predeploy/backend que pedir nuevos ajustes visuales.

Se debe avisar a Claude solo si:

- aparece regresion visual real en preview/staging;
- el guard de copy rompe algun render visible;
- Academia carga pero contenido/flujo queda incoherente en revision humana;
- se decide reemplazar el guard por patch permanente de UI;
- surge una pantalla critica rota que no pueda resolverse desde backend/gates.

## Decision requerida de Paula

Para seguir al siguiente bloque de movimiento operativo, Paula debe elegir:

1. Autorizar preview/staging controlado.
2. Autorizar produccion controlada solo demo/visual.
3. Mantener PR y avanzar backend sin deploy.

## Estado seguro

Este documento no ejecuta deploy, merge, imports ni proveedores reales.
