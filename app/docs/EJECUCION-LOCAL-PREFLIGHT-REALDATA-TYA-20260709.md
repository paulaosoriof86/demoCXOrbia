# Ejecucion local preflight real-data TyA

Fecha: 2026-07-09  
Bloque: instruccion corta para ejecucion local cuando Paula tenga computador  
Estado: preparado, sin ejecutar aqui.

## 1. Objetivo

Dejar un comando simple para ejecutar el preflight local que valida Level 0, Level 1 y Level 2 con informacion real/sanitizada de TyA/Cinepolis, sin PII, sin deploy, sin produccion, sin import real y sin runtime switch.

## 2. Archivo helper creado

- `tools/contracts/tya-local-realdata-preview-preflight.ps1`

## 3. Comando minimo

Desde la raiz del repo:

```powershell
powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1
```

Este comando:

- busca outputs locales;
- genera Level 0;
- valida Level 0;
- valida bridge/gates;
- no genera Level 1/2 si no se entrega input sanitizado.

## 4. Comando con output HR sanitizado

Si existe el reporte local sanitizado del full-flow:

```powershell
powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1 -InputPath ".tmp/tya-hr-source-private-full-flow/report.json"
```

Este comando intenta:

- generar Level 1 visitas sanitizadas;
- validar Level 1;
- generar Level 2 operacional sanitizado;
- validar Level 2;
- mantener runtime bloqueado.

## 5. Comando con inputs adicionales sanitizados

Solo si existen outputs sanitizados separados:

```powershell
powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1 -InputPath ".tmp/tya-hr-source-private-full-flow/report.json" -ShoppersPath "C:\ruta\shoppers-sanitizados.json" -CertificationsPath "C:\ruta\certificaciones-sanitizadas.json" -LiquidationsPath "C:\ruta\liquidaciones-sanitizadas.json"
```

## 6. Salidas esperadas

El helper muestra resumen y genera:

- `.tmp/tya-local-realdata-preview-preflight/local-realdata-preview-preflight-report.md`
- `.tmp/tya-local-realdata-preview-preflight/local-realdata-preview-preflight-report.json`

Ademas, si aplica:

- `.tmp/tya-local-realdata-preview-preflight/level0/tya-minimal-sanitized-input-level0.json`
- `.tmp/tya-local-realdata-preview-preflight/level1/tya-minimal-sanitized-input-level1.json`
- `.tmp/tya-local-realdata-preview-preflight/level2/tya-minimal-sanitized-input-level2.json`
- `.tmp/tya-local-realdata-preview-preflight/validations/**`

## 7. Interpretacion rapida

### Si dice GO_LOCAL_PREFLIGHT_COMPLETED_NO_RUNTIME

El preflight corrio. No significa produccion ni autorizacion de runtime.

### Si Level 2 aparece en true

Hay payload operacional sanitizado para revisar antes de pedir GO runtime DEV preview.

### Si hay NO-GO

No hacer deploy, no tocar runtime, no hacer merge. Revisar el reporte y corregir solo causa raiz.

## 8. Que NO hacer despues del comando

No hacer:

- deploy;
- produccion;
- import real;
- Firestore writes;
- HR writes;
- Make/Gemini real;
- pagos;
- runtime switch;
- cambios en modulos UI.

## 9. Siguiente decision despues de ejecutar

Si el reporte genera Level 2 limpio, ejecutar el GO/NO-GO final:

```powershell
node tools/contracts/tya-runtime-dev-preview-go-nogo-validate.mjs --preflight .tmp/tya-local-realdata-preview-preflight/local-realdata-preview-preflight-report.json --level2-validation .tmp/tya-local-realdata-preview-preflight/validations/level2/level2-sanitized-operational-report.json --bridge-validation .tmp/tya-local-realdata-preview-preflight/validations/bridge/cxdata-realdata-preview-bridge-report.json --runtime-switch-validation .tmp/tya-local-realdata-preview-preflight/validations/runtime-switch/cxdata-runtime-switch-gate-report.json --rollback-smoke-validation .tmp/tya-local-realdata-preview-preflight/validations/rollback-smoke/runtime-switch-rollback-smoke-plan-report.json
```

Si ese gate dice que ya se puede pedir GO, entonces se solicita autorizacion explicita a Paula antes de tocar runtime.

## 10. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
