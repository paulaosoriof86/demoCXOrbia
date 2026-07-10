# Pendientes de prototipo — addendum empalme runtime post-V96

Fecha: 2026-07-10  
Prioridad: P1 quirúrgico y validación previa a Auth real

## No reabrir

- No volver a V96/V95 como base.
- No rehacer el P0 de permisos cerrado por la candidata post-V96.
- No repetir auditoría forense completa salvo nuevo ZIP o drift runtime.
- No borrar archivos adicionales de backend/patch a ciegas.
- No activar providers ni representar integraciones como reales.

## Permisos y scopes

1. Categorizar módulos `cli_*` para permisos cliente granulares.
2. Cambiar el fallback de módulo desconocido a denegado absoluto salvo allowlist explícita antes de producción.
3. Ejecutar smoke focalizado por **ruta y acción**, no solo por visibilidad, para:
   - coordinador;
   - aliado;
   - custom;
   - cliente;
   - shopper.
4. Confirmar si coordinador y aliado deben visualizar `Admin del proyecto` con Clientes, Proyectos, Periodos, Histórico, HR, Cuestionarios e Importador.
5. Confirmar que custom no pueda ejecutar acciones administrativas aunque el shell incluya botones descendientes.
6. Verificar portal cliente multi-proyecto con al menos dos proyectos source-safe.

## Copy honesto

- Revisar las 36 coincidencias del scanner histórico.
- Corregir solo residuos que prometan envío, sincronización, import, pago o proveedor real.
- Soporte: rotular WhatsApp como borrador/fallback manual.
- Mis Visitas: rotular WhatsApp como borrador/fallback manual.
- HR Source: usar `Conectado por backend` cuando la conexión sea backend real; mientras no lo sea, usar estado preparado/preview.
- Outbox/integraciones: mantener `preparado`, `pendiente`, `bloqueado` o `preview` según gate.

## Patches y runtime adicionales

Los 27 archivos adicionales están preservados y no cargados automáticamente por el source-lock `index.html`.

Pendiente decidir por archivo:

- conservar disabled/preview;
- mover a backend/adapters;
- consolidar en el módulo oficial si mejora mantenibilidad;
- retirar solo con evidencia de reemplazo.

Atención especial:

- `app/core/tya-phase-a-source-safe-preview.js`;
- `app/core/v91-modules.js`;
- `app/modules/academia-admin-actions.js`;
- `app/modules/academia-create-ai-stable.js`;
- `app/modules/rutas.js`.

## Academia

- Preservar acciones administrativas y Crear con IA como mejoras a consolidar, no como integración Gemini real.
- Profundizar manuales, cursos, checklists, glosario y rutas por rol.
- Incluir límites de permisos por tenant/proyecto/país.
- Explicar source lock, runtime validado, DEV, deploy y producción.
- Explicar que Hosting visible no equivale a Auth/Firestore conectado.
- Mantener revisión humana para borradores IA.

## Backend todavía bloqueado

- Auth real y usuarios;
- escritura de claims;
- Firestore reads/writes reales;
- despliegue de reglas;
- `CX.data` runtime switch;
- dry-run/import real;
- HR writeback;
- Make/Gemini/Storage;
- pagos reales;
- merge/deploy/producción.

## Criterio de cierre P1

P1 puede cerrarse cuando:

- la matriz de permisos coincida con rutas/acciones reales;
- no haya acceso administrativo no autorizado;
- el copy no prometa integraciones apagadas;
- los extras tengan decisión documentada;
- Academia refleje los cambios por rol;
- el runtime siga 67/67 y drift permanezca verde.
