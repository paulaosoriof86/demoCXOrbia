# REPORTE DE CORRECCIÓN — V145 (paquete R19 P0-3.D — control discreto PWA dentro de la app)

Baseline: `Prototype development request CXOrbia V144.zip`.

## Hallazgo corregido
El paquete exige "mantener un control discreto de Instalar app para
reintentar cuando el navegador lo permita" — solo existía un botón de
instalación en la pantalla de LOGIN; una vez dentro de la app no había
forma de reintentar la instalación.

## Cambio
- `app/index.html`: nuevo botón `#tbPwa` (📲) en el topbar, oculto por
  defecto.
- `app/core/topbar.js`: `updatePwaBtn()` lo muestra solo si hay
  `beforeinstallprompt` disponible (`CX.pwa.installable()`) o es iOS
  (guía manual); se oculta si la app ya corre en modo standalone
  (instalada) y tras `appinstalled`.

Verificado en runtime: con `deferredPrompt` simulado, el botón pasa a
visible (`display:flex`); 0 errores en 48 módulos × 3 roles.

## Gate técnico
- Sintaxis: PASS.
- Runtime: 0 errores.
- Manifest V145 regenerado, 0 diffs.
