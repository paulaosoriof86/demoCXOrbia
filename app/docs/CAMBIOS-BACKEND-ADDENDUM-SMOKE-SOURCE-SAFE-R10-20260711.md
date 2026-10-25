# CAMBIOS BACKEND — addendum smoke visual source-safe R10

Fecha: 2026-07-11

## Objetivo del bloque

Pasar de una comprobación visual basada principalmente en demo/localStorage a una comprobación operacional que use la fuente HR TyA sanitizada sobre la baseline V105/V106 ya empalmada.

## Archivos creados

### Herramienta operacional

- `tools/qa/tya-phase-a-source-safe-visual-smoke.mjs`
  - valida tenant/proyecto y conteos source-safe;
  - verifica 14 periodos, 616 visitas y 213 shoppers;
  - revisa GT/HN, moneda y protección de PII;
  - comprueba evidencia de ejecución de junio sin tratarla como pago;
  - entra como Admin, Cliente y Shopper;
  - intenta módulos operativos según rol;
  - captura pantallas y errores;
  - bloquea copy que afirme envíos, sincronizaciones o pagos reales sin evidencia;
  - genera reporte sanitizado.

### CI

- `.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml`
  - construye payload HR source-safe con el builder existente;
  - sirve localmente la última baseline empalmada;
  - ejecuta Playwright;
  - publica reporte/capturas como artefacto;
  - permisos `contents: read`;
  - sin escrituras de proveedor.

### Gate de drift

- `tools/release/tya-rc-phase-a-drift-gate.mjs`
  - se agregaron únicamente los dos archivos R10 a la allowlist exacta;
  - no se habilitaron cambios generales bajo `tools/qa` o workflows;
  - runtime app changes siguen prohibidos.

### Documentación

- auditoría de verificación de empalme V105(1)/V106;
- paquete acumulado Claude post-empalme;
- tracker Phase A R10;
- pendientes prototipo R10;
- impacto Academia R10;
- este addendum.

## Qué se adelantó realmente del plan

- se preservó la última candidata como baseline viva;
- se añadió comprobación visual con información real sanitizada TyA;
- se validan módulos y roles, no solo archivos;
- se vincula el smoke con los conteos que alimentan la materialización;
- se prepara evidencia accionable para Claude sin pedir reprocesos;
- se mantiene el paso siguiente hacia Firebase DEV y dry-runs reales.

## Aprendizaje legacy útil recuperado

Se conserva:

- HR como fuente operacional;
- visitas hasta junio ejecutadas;
- pago separado de ejecución/liquidación;
- GT/HN y moneda por país;
- shoppers protegidos por llave estable;
- Cinépolis como proyecto configurable.

Se descarta:

- conexión a base vieja;
- uso de HTML legacy como fuente de pago/certificación;
- deduplicación por nombre;
- métricas o estados fabricados;
- parches UI desde backend.

## Impacto frontend

No se modificó `/app/modules` ni `/app/core` para pasar el smoke. Cualquier hallazgo visual se documentará para Claude con módulo, rol, evidencia y validación esperada.

## Riesgos controlados

- el builder realiza lectura source-safe, no escritura;
- el reporte no expone nombres, correos, teléfonos, banco, DPI, NDA ni IDs crudos;
- una diferencia de conteos produce HOLD, no corrección automática;
- una ruta no encontrada se reporta, no se inventa;
- un error de página bloquea el smoke;
- el PASS no autoriza materialización ni producción.

## Estado seguro

0 Firestore writes, 0 HR writes, 0 Auth/Storage writes, 0 import real, 0 pagos, 0 Make/Gemini, 0 deploy, 0 producción.
