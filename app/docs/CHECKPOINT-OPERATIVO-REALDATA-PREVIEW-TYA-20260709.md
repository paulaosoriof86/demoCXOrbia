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

## 4. Proximo paso local exacto

Cuando Paula tenga computador, ejecutar desde la raiz del repo:

```powershell
powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1
```

Si existe output sanitizado local del full-flow:

```powershell
powershell -ExecutionPolicy Bypass -File tools/contracts/tya-local-realdata-preview-preflight.ps1 -InputPath ".tmp/tya-hr-source-private-full-flow/report.json"
```

## 5. Interpretacion esperada

### Level 0 true

Hay proyecto/periodos/source readiness. No hay visitas reales.

### Level 1 true

Hay visitas sanitizadas para preview. Shoppers pueden seguir como referencias.

### Level 2 true

Hay preview operacional con visitas, shoppers opacos/sanitizados, certificaciones preservadas y liquidaciones/control de pago.

### GO_LOCAL_PREFLIGHT_COMPLETED_NO_RUNTIME

El preflight corrio y no conecto runtime. No autoriza produccion.

## 6. Que hacer si hay NO-GO

No hacer deploy, no merge, no runtime switch, no import.

Revisar:

- `local-realdata-preview-preflight-report.md`
- `local-realdata-preview-preflight-report.json`
- validaciones bajo `.tmp/tya-local-realdata-preview-preflight/validations/`

Corregir solo causa raiz.

## 7. Que hacer si Level 2 valida limpio

Ejecutar el GO/NO-GO final:

```powershell
node tools/contracts/tya-runtime-dev-preview-go-nogo-validate.mjs --preflight .tmp/tya-local-realdata-preview-preflight/local-realdata-preview-preflight-report.json --level2-validation .tmp/tya-local-realdata-preview-preflight/validations/level2/level2-sanitized-operational-report.json --bridge-validation .tmp/tya-local-realdata-preview-preflight/validations/bridge/cxdata-realdata-preview-bridge-report.json --runtime-switch-validation .tmp/tya-local-realdata-preview-preflight/validations/runtime-switch/cxdata-runtime-switch-gate-report.json --rollback-smoke-validation .tmp/tya-local-realdata-preview-preflight/validations/rollback-smoke/runtime-switch-rollback-smoke-plan-report.json
```

Si ese gate indica que ya se puede pedir GO, solicitar autorizacion explicita a Paula antes de cualquier cambio en runtime.

## 8. Bloqueos actuales

- Falta ejecutar localmente con computador.
- Falta confirmar si existe output sanitizado local Level 1.
- Falta validar Level 2 con reportes reales.
- Falta GO explicito de Paula para runtime DEV preview.
- Produccion sigue bloqueada.

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
- liquidaciones/pagos como control.

## 11. Clasificacion

- Reusable CXOrbia: si. Niveles, gates, preflight, fuente configurable y preview sanitizado sirven para futuros tenants.
- Exclusivo cliente: parcial. TyA/Cinépolis/GT/HN/junio/HR actual son contexto cliente.
- Claude/prototipo: si. Paquete critico y pendientes UI.
- Academia: si. Requiere manuales operativos.
- Sin impacto Claude: no.

## 12. Decision de continuidad

La conversacion esta larga. Recomendado abrir nueva conversacion con el prompt de continuidad ya entregado o usar este checkpoint como source lock operativo del bloque real-data preview.
