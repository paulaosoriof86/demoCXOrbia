# AUDITORÍA FORENSE — CANDIDATA CXORBIA V159

Fecha: 2026-07-17  
Fuente: `Prototype development request (8).zip`  
SHA-256: `8ac5b04dda594366e0f27f717ec5f660328b43d9109a44e5df36fdcabcb09bc6`

## Decisión

`AUDITED_GO_READY_DIRECT_APPLY`

`GO · SIN P0 DEMOSTRADO`

La única operación permitida es `APPLY_DELTA_DIRECTLY` sobre `docs-tya-v6-v71-audit`.

## Identidad y delta

- Archivos V159: 256.
- Comparación contra V158:
  - agregados: 0;
  - eliminados: 0;
  - modificados: 14.
- Archivos modificados V158→V159:
  - `app/core/automations.js`;
  - `app/core/liquidacion.js`;
  - `app/core/manuales-data.js`;
  - `app/core/notif.js`;
  - `app/core/topbar.js`;
  - `app/core/ui.js`;
  - `app/docs/CAMBIOS-PROTOTIPO.md`;
  - `app/docs/PENDIENTES-PROTOTIPO.md`;
  - `app/docs/RESUMEN-PARA-CLAUDE.md`;
  - `app/modules/academia.js`;
  - `app/modules/administrabilidad.js`;
  - `app/modules/automatizaciones.js`;
  - `app/modules/cert.js`;
  - `app/modules/finanzas.js`.

La rama viva ya contiene físicamente el árbol runtime V156 del commit transitorio `623a3ff586c11d362971db67d2c1aa3b8c1b2677`; la comparación con el HEAD previo mostró únicamente diferencias documentales, de herramientas y workflows, no runtime. Por ello el delta runtime efectivo V156→V159 es de 17 archivos modificados y 0 eliminados.

Archivos runtime efectivos:

- `app/core/automations.js`;
- `app/core/data-source.js`;
- `app/core/liquidacion.js`;
- `app/core/manuales-data.js`;
- `app/core/notif.js`;
- `app/core/topbar.js`;
- `app/core/ui.js`;
- `app/modules/academia.js`;
- `app/modules/administrabilidad.js`;
- `app/modules/automatizaciones.js`;
- `app/modules/cert.js`;
- `app/modules/configuracion.js`;
- `app/modules/correo.js`;
- `app/modules/crm.js`;
- `app/modules/finanzas.js`;
- `app/modules/hr-source.js`;
- `app/modules/importador.js`.

## Validación estructural

- ZIP legible: PASS.
- Árbol `app/`: PASS.
- JavaScript/MJS: 67 archivos revisados con `node --check`.
- Errores de sintaxis: 0.
- Scripts declarados en `app/index.html`: 66.
- Scripts locales: 64.
- Scripts locales faltantes: 0.
- Scripts locales duplicados: 0.
- Registros `CX.module`: 49.
- IDs de módulo únicos: 49.
- IDs duplicados: 0.
- Firmas de private keys, API keys o tokens verificadas: 0 coincidencias.

## Semántica y preservación

V159 conserva y mejora:

- multi-tenant y multi-proyecto;
- selección explícita de proyecto y periodo;
- `CX.data` como contrato estable;
- estados de liquidación/pago no confirmados sin evidencia real;
- fallbacks de fuente fail-closed;
- lenguaje comercial en Certificación, Finanzas, Automatizaciones y Academia;
- contenido técnico de Academia protegido mediante `hasTechAccess()`;
- ausencia de activación real de Firebase, HR, Make, Gemini, Storage, pagos o producción.

Reconciliación obligatoria del empalme:

- `app/modules/importador.js` debe consumir `CX.dataSource.sourceContract()` y no depender de un método inexistente en `CX.data`.
- `app/core/finanzas-core.js` se preserva desde la rama viva: `porPais()` usa `data.project()` y el adapter local conserva `project()`, `period()` y `visitas()`.

## Hallazgos no bloqueantes

- `app/docs/PENDIENTES-PROTOTIPO.md` conserva en su encabezado una fecha histórica V82 y luego declara correctamente V159. Es continuidad documental P1/P2; no impide inicio, rutas ni Phase A.
- La candidata no genera manifest/build-lock de la unión con overlays TyA. Es tarea posterior de ChatGPT/Codex, no P0 frontend.
- El smoke automatizado de navegador no pudo ejecutarse porque Chromium cerró su proceso GPU en el entorno disponible. No se declara PASS visual. La sintaxis, scripts y módulos sí fueron comprobados y el smoke visual permanece como gate posterior al empalme.
- Términos técnicos dentro de comentarios, identificadores internos o contenido realmente protegido no constituyen fuga comercial ni P0.

## Evaluación P0

No se demostró:

- aplicación que no inicia;
- sintaxis crítica rota;
- ruta esencial faltante;
- pérdida o eliminación crítica;
- secreto o dato sensible expuesto;
- write, deploy, proveedor, pago o producción no autorizado;
- regresión que impida Phase A.

Por tanto, ningún hallazgo P1/P2 puede detener el empalme.

## Estado de aplicación directa

V159 todavía no está físicamente empalmada.

El conector GitHub disponible permite escrituras de texto proporcionado directamente, pero no acepta los archivos montados de la candidata como parámetros de escritura autenticada. La metodología vigente prohíbe sustituir esta carencia por Base64, blobs, trees, GitHub Actions, Drive, copias manuales o una acción de Paula.

Código de bloqueo de herramienta:

`FILE_AWARE_AUTHENTICATED_REPOSITORY_WRITE_UNAVAILABLE`

Este bloqueo:

- no es P0 de la candidata;
- no cambia la decisión GO;
- no autoriza otra metodología;
- no solicita acción manual a Paula;
- mantiene pendiente la misma operación `APPLY_DELTA_DIRECTLY`.

Se realizaron intentos de objetos Git no referenciados antes de confirmar el alcance exacto del lock. Ningún blob/tree de prueba fue unido a un commit ni movió la rama. También se creó y eliminó inmediatamente un archivo `.noop-test`; no existe residuo en el árbol actual. Estas operaciones no modificaron el runtime.

## Clasificación

- **Reusable CXOrbia:** auditoría focalizada, estados honestos y aplicación directa.
- **Exclusivo cliente:** reconciliación posterior con overlays y gates TyA.
- **Claude/prototipo:** V159 queda aprobada; no corresponde solicitar V160.
- **Academia:** cambios V159 aprobados; validación visual por rol queda post-empalme.
- **Sin impacto Claude:** manifest, build-lock, verificador, overlays y gates posteriores.

## Estado seguro

Sin empalme físico V159, merge, deploy, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.