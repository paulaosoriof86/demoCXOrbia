# Post V89 honest copy patch tool

Fecha: 2026-07-06

## Bloque completado

Se agregó una herramienta reproducible para aplicar las correcciones locales post-V89 de textos honestos en el prototipo, porque Claude no tiene capacidad y las mejoras deben quedar documentadas para incorporarse después al prototipo comercializable.

## Archivo creado

- `tools/migration/tya-post-v89-honest-copy-patch.mjs`

## Qué hace

La herramienta aplica reemplazos controlados en:

- `app/modules/postulaciones.js`
- `app/modules/dashboard.js`
- `app/modules/automatizaciones.js`
- `app/modules/cuestionario-shopper.js`
- `app/modules/reservas.js`
- `app/core/manuales-data.js`
- `app/core/topbar.js`
- `app/modules/correo.js`
- `app/modules/finanzas.js`
- `app/modules/importador.js`
- `app/modules/operacion-extra.js`

## Cómo se usa

Desde la raíz del repo:

```bash
node tools/migration/tya-post-v89-honest-copy-patch.mjs --check
node tools/migration/tya-post-v89-honest-copy-patch.mjs --apply
```

## Validación incluida

La herramienta:

1. Reemplaza textos operativos que prometen envío/sync/acciones reales sin gate.
2. Ejecuta `node --check` sobre los JS incluidos.
3. Busca residuos críticos:
   - `WhatsApp enviado`
   - `WA enviado`
   - `HR sincronizada`
   - `shopper notificado`
   - `Correo enviado a`
   - `Payload de prueba enviado`
   - `Disparo enviado`
   - `eventos enviados`
   - `cuestionario enviado`
   - `egreso(s) automáticos`
   - `se generan los egresos automáticamente`
   - `Liquidación corregida · sincronizada`

## Validación local previa

La misma lógica fue probada localmente contra el extracto de V89:

- `postulaciones.js`: node check OK.
- `dashboard.js`: node check OK.
- `automatizaciones.js`: node check OK.
- `cuestionario-shopper.js`: node check OK.
- `reservas.js`: node check OK.
- `manuales-data.js`: node check OK.
- `topbar.js`: node check OK.
- `correo.js`: node check OK.
- `finanzas.js`: node check OK.
- `importador.js`: node check OK.
- `operacion-extra.js`: node check OK.
- Búsqueda de residuos críticos en esos archivos: sin hits para los patrones P0 listados arriba.

## Decisión técnica

Este bloque deja el parche listo y auditable sin activar runtime. La aplicación directa sobre los módulos debe hacerse con `--apply` en un entorno de repo local/Codex y luego documentarse como modificación local post-V89.

## Estado seguro

Sin deploy, sin producción, sin merge, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajería/correo real y sin datos sensibles.
