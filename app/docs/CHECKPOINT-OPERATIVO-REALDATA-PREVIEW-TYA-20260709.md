# Checkpoint operativo - Real-data preview TyA Phase A

Fecha: 2026-07-09  
Bloque: cierre operativo de preparacion real-data preview  
Estado: checkpoint documentado, sin runtime switch.

## 1. Estado actual

Se avanzo hasta dejar preparada la cadena segura para validar informacion real/sanitizada de TyA/Cinepolis en DEV preview, sin tocar runtime y sin pedir HR de nuevo.

La cadena actual cubre:

1. HR/source-safe manifest.
2. Minimal sanitized input.
3. Level 0 manifest-only.
4. Level 1 visitas sanitizadas.
5. Level 2 operacional sanitizado.
6. Preflight local Level 0/1/2.
7. GO/NO-GO runtime DEV preview.
8. Helper PowerShell para ejecucion local.
9. Paquete Claude critico.

## 1.1 Actualizacion no-reproceso / no-reversion

Este checkpoint queda alineado con `CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md`.

- Level 0 manifesto/source-safe queda reconocido como superado para readiness de proyecto/periodos.
- Level 1 ya habia sido trabajado previamente dentro del pipeline y no debe repetirse desde cero.
- Las verificaciones recientes no reabren Level 0/1; solo endurecen gates para evitar falsos positivos.
- No se debe aceptar fixture sintetico ni output derivado de `.tmp` como evidencia real-data original.
- No se debe volver a pedir HR/reglas/shoppers/certificaciones/liquidaciones ya documentadas sin revisar fuentes, maestro, addenda y outputs existentes.
- Siguiente avance: continuar por HR source-safe/full-flow y outputs originales seguros, o por validacion puntual de no regresion si ya existe evidencia local.

## 2. Estado seguro confirmado

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos UI modificados en los ultimos bloques backend.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
- Sin pagos reales.

## 3. Archivos ejecutables principales

### Preflight completo

- `tools/contracts/tya-local-realdata-preview-preflight.ps1`
- `tools/contracts/tya-local-realdata-preview-preflight.mjs`

### Level 0

- `tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs`
- `tools/contracts/tya-minimal-sanitized-input-validate.mjs`

### Level 1

- `tools/contracts/tya-level1-sanitized-visit-output-locator.mjs`
- `tools/contracts/tya-level1-sanitized-visits-from-output.mjs`

### Level 2

- `tools/contracts/tya-level2-sanitized-operational-from-inputs.mjs`
- `tools/contracts/tya-level2-sanitized-operational-validate.mjs`

### GO/NO-GO runtime DEV preview

- `tools/contracts/tya-runtime-dev-preview-go-nogo-validate.mjs`

### No-reversion / recovery seguro

- `tools/contracts/tya-local-level1-recovery-preflight.mjs`
- `app/docs/CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md`

## 4. Proximo paso local exacto

No ejecutar pasos locales nuevos como rutina. La ejecucion local solo aplica si hace falta validar una fuente que existe unicamente en la computadora de Paula y que no debe entrar al chat ni al repo.

Si se requiere validacion puntual de no regresion, usar los helpers ya creados, sin reiniciar Level 0/1 ni pedir HR de nuevo.

## 5. Interpretacion esperada

### Level 0 true

Hay proyecto/periodos/source readiness. Queda reconocido como superado para readiness de proyecto/periodos.

### Level 1 true

Hay visitas sanitizadas para preview. Level 1 ya fue trabajado en el pipeline; no debe repetirse desde cero. Solo se permite validacion puntual contra fuente original segura.

### Level 2 true

Hay preview operacional con visitas, shoppers opacos/sanitizados, certificaciones preservadas y liquidaciones/control de pago. Antes de cualquier runtime DEV se debe confirmar que la fuente no sea fixture ni output derivado.

### GO_LOCAL_PREFLIGHT_COMPLETED_NO_RUNTIME

El preflight corrio y no conecto runtime. No autoriza produccion.

## 6. Que hacer si hay NO-GO

No hacer deploy, no merge, no runtime switch, no import.

Revisar:

- `local-realdata-preview-preflight-report.md`
- `local-realdata-preview-preflight-report.json`
- validaciones bajo `.tmp/tya-local-realdata-preview-preflight/validations/`

Corregir solo causa raiz. No reiniciar metodologia, no volver a pedir datos ya documentados y no repetir Level 0/1 si el problema es un falso positivo o una fuente derivada.

## 7. Que hacer si Level 2 valida limpio

Ejecutar el GO/NO-GO final solo si Level 2 proviene de fuente original real/sanitizada, no de fixture ni de `.tmp` derivado.

```powershell
node tools/contracts/tya-runtime-dev-preview-go-nogo-validate.mjs --preflight .tmp/tya-local-realdata-preview-preflight/local-realdata-preview-preflight-report.json --level2-validation .tmp/tya-local-realdata-preview-preflight/validations/level2/level2-sanitized-operational-report.json --bridge-validation .tmp/tya-local-realdata-preview-preflight/validations/bridge/cxdata-realdata-preview-bridge-report.json --runtime-switch-validation .tmp/tya-local-realdata-preview-preflight/validations/runtime-switch/cxdata-runtime-switch-gate-report.json --rollback-smoke-validation .tmp/tya-local-realdata-preview-preflight/validations/rollback-smoke/runtime-switch-rollback-smoke-plan-report.json
```

Si ese gate indica que ya se puede pedir GO, solicitar autorizacion explicita a Paula antes de cualquier cambio en runtime.

## 8. Bloqueos actuales ajustados

- Produccion sigue bloqueada.
- Runtime DEV preview sigue bloqueado hasta GO explicito y gate final.
- No hay autorizacion para imports, Firestore writes, HR writes, deploy, Make/Gemini ni pagos reales.
- Ya no se debe tratar Level 0/1 como trabajo por repetir; solo como validacion puntual de no regresion.
- Falta confirmar para el siguiente gate final que la evidencia Level 2 venga de fuente original real/sanitizada y no de fixture ni output derivado.

## 9. Claude/prototipo

Paquete critico listo:

- `app/docs/PAQUETE-CLAUDE-CRITICO-REALDATA-PREVIEW-TYA-20260709.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-REALDATA-PREVIEW-TYA-20260709.md`

No enviar a Claude como redisenio general. Solo usar para copy honesto, estados, fuente HR configurable, Cinépolis configurable, certificaciones/pagos y Academia.

## 10. Academia

Debe documentar:

- niveles Level 0/1/2;
- diferencia entre preview/staging/importado/produccion;
- `review_required`;
- no PII;
- preservacion de certificaciones;
- liquidaciones/pagos como control;
- diferencia entre fixture sintetico, output derivado y fuente real sanitizada;
- criterio de no-reversion de gates.

## 11. Clasificacion

- Reusable CXOrbia: si. Niveles, gates, preflight, fuente configurable, no-reversion y preview sanitizado sirven para futuros tenants.
- Exclusivo cliente: parcial. TyA/Cinépolis/GT/HN/junio/HR actual son contexto cliente.
- Claude/prototipo: si. Paquete critico, copy honesto y pendientes UI.
- Academia: si. Requiere manuales operativos.
- Sin impacto Claude: no.

## 12. Decision de continuidad

Continuar Phase A real controlada desde este checkpoint y el checkpoint no-reversion. No reiniciar Level 0/1. No usar fixtures ni `.tmp` derivados como evidencia real. No pedir de nuevo informacion ya trabajada sin revisar documentos y outputs existentes.