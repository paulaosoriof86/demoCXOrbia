# Synthetic Input Pack Runner CXOrbia

Fecha: 2026-07-08  
Bloque: runner local de inputs sinteticos/sanitizados  
Archivo tecnico: `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`  
Estado: seguro, preview-only, sin fuentes reales.

## 1. Objetivo

Este bloque crea un runner local para ejecutar validadores previos con fixtures sinteticos/sanitizados y producir un reporte agregado source-safe.

No usa datos reales. No lee HR real. No conecta plataforma real. No importa. No escribe base. No envia notificaciones. No activa proveedores.

## 2. Contratos incluidos

El runner ejecuta fixtures sinteticos para:

- admin configurability;
- conflict review/import readiness;
- questionnaire routing;
- visit lifecycle;
- settlement eligibility;
- evidence storage;
- historical import clean.

Los contratos nuevos con exports se ejecutan por modulo. Los contratos legacy que leen stdin se ejecutan como CLI con payload sintetico controlado.

## 3. Salidas

Por defecto imprime JSON en consola.

Si se ejecuta con `--out`, escribe reportes locales en la ruta indicada:

- `cxorbia-synthetic-input-pack-report.json`;
- `cxorbia-synthetic-input-pack-report.md`.

Estos reportes locales no deben subirse con datos reales. En repo solo queda el runner y la documentacion.

## 4. Politica segura

El runner fija:

- `mode: preview_only`;
- `sourceSafe: true`;
- `isSyntheticOrSanitized: true`.

El estado seguro reporta:

- sin deploy;
- sin produccion;
- sin provider calls;
- sin escrituras Firestore/base;
- sin HR writes;
- sin Storage writes;
- sin imports;
- sin pagos;
- sin notificaciones reales;
- sin Make;
- sin Gemini.

## 5. Que NO hace

El runner no:

- conecta Firestore/Auth/Storage;
- conecta HR;
- lee fuentes reales;
- importa historico real;
- consulta base vieja;
- escribe HR/plataforma;
- envia correo/WhatsApp;
- ejecuta pagos;
- llama Make/Gemini;
- modifica `/app/modules`;
- modifica `/app/core`;
- genera deploy.

## 6. Uso futuro

Uso sugerido local cuando exista entorno disponible:

```bash
node tools/contracts/cxorbia-synthetic-input-pack-runner.mjs
node tools/contracts/cxorbia-synthetic-input-pack-runner.mjs --out .tmp/cxor-synthetic-pack
```

El reporte agregado permite saber si los validadores preview estan coherentes antes de pasar a inputs sanitizados mas amplios.

## 7. Impacto Phase A

Este bloque reduce riesgo antes del import real porque permite probar contratos sin fuentes reales.

Tambien prepara una salida agregada que puede alimentar un futuro readiness dashboard, sin decir que la plataforma esta production-ready.

## 8. Impacto Claude/prototipo

Claude debe reflejar esto solo como estado de diagnostico/preview:

- runner sintetico ejecutado;
- contratos cubiertos;
- contratos pass/fail;
- warnings;
- preview listo/no listo;
- sin proveedor activo;
- sin import real;
- sin produccion.

No debe decir deployado, importado, sincronizado, enviado, pagado ni conectado.

## 9. Impacto Academia

Academia debe explicar:

- que es un fixture sintetico;
- que es input sanitizado;
- diferencia entre prueba de contrato y operacion real;
- diferencia entre source-safe report y import real;
- por que estos reportes no reemplazan revision humana;
- por que no deben incluir datos reales ni sensibles.

## 10. Clasificacion obligatoria

- Reusable CXOrbia: patron de runner source-safe para contratos preview-only y reporte agregado.
- Exclusivo cliente: no hardcodea TyA/Cinepolis como logica; los fixtures son demo.
- Claude/prototipo: debe mostrarlo como diagnostico preview, no como produccion lista.
- Academia: debe explicar fixtures, sanitizacion, source-safe, contratos y limites.
- Sin impacto Claude: el runner no toca UI/runtime.

## 11. Estado seguro

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
