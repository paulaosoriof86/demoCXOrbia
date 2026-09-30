# Synthetic Input Pack Expanded Coverage CXOrbia

Fecha: 2026-07-08  
Bloque: ampliacion de cobertura del synthetic input pack runner  
Archivo tecnico actualizado: `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`  
Estado: seguro, preview-only, sin fuentes reales.

## 1. Objetivo

Este bloque amplia el runner local de inputs sinteticos para cubrir areas adicionales de Phase A que ya tienen contratos/fixtures preview en repo.

El objetivo es consolidar mas validaciones en un solo reporte agregado source-safe antes de usar inputs sanitizados mas amplios o cualquier fuente real.

## 2. Cobertura agregada

Se agrego cobertura del runner para estos validadores con fixtures sinteticos existentes:

- assignment sync conflict preview;
- notification outbox preview;
- project/tenant rule versioning preview;
- rule change changelog notification preview;
- release readiness snapshot preview.

Estos se suman a la cobertura ya existente:

- admin configurability;
- conflict review/import readiness;
- questionnaire routing;
- visit lifecycle;
- settlement eligibility;
- evidence storage;
- historical import clean.

## 3. Politica de ejecucion

Los validadores nuevos se ejecutan como CLI con `--input` apuntando a fixtures sinteticos bajo:

`tools/migration/synthetic-fixtures/phase-a/`

El runner ejecuta desde la raiz del repo para que los validadores puedan leer contratos en `app/contracts` y dependencias documentales.

## 4. Salidas

El runner mantiene:

- JSON por consola;
- reporte local opcional JSON/MD con `--out`;
- sin outputs en repo por defecto;
- conteo agregado de contratos pass/fail/warnings;
- cobertura por areas.

## 5. Que NO cambia

No se toca:

- `/app/modules`;
- `/app/core`;
- UI;
- runtime;
- Firestore/Auth/Storage;
- HR;
- Make;
- Gemini;
- correo/WhatsApp;
- pagos;
- import real;
- deploy;
- produccion.

## 6. Impacto Phase A

Este bloque avanza Phase A porque mejora el preflight contractual antes de operaciones reales:

- assignment sync evita duplicacion HR/plataforma;
- notification outbox evita prometer envios reales;
- rule versioning evita cambiar reglas sin version/revision;
- changelog evita marcar roles informados sin gate;
- release readiness separa preview-ready de production-ready.

## 7. Impacto Claude/prototipo

Claude debe reflejar esto solo como diagnostico preview si se muestra en UI:

- area cubierta;
- validator ejecutado;
- fixture sintetico/sanitizado;
- estado pass/fail/warning;
- gate real apagado;
- produccion no autorizada.

No debe mostrar que el modulo esta conectado, importado, sincronizado, notificado, pagado o deployado.

## 8. Impacto Academia

Academia debe explicar:

- que significa cobertura de runner;
- que un fixture sintetico no es dato real;
- que pass contractual no equivale a produccion;
- como leer pass/fail/warnings;
- que areas cubre el preflight;
- que gates siguen apagados;
- que se requiere revision humana antes de activar operaciones reales.

## 9. Clasificacion obligatoria

- Reusable CXOrbia: cobertura expandida de runner source-safe para validadores reutilizables.
- Exclusivo cliente: no se hardcodea TyA/Cinepolis como logica; los fixtures son source-safe.
- Claude/prototipo: mostrar solo diagnostico preview, no produccion lista.
- Academia: explicar coverage, fixtures, pass/fail/warnings y gates.
- Sin impacto Claude: no toca UI/runtime.

## 10. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles en repo.
