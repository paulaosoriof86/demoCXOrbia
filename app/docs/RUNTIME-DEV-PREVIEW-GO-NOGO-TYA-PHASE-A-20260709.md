# Runtime DEV preview GO/NO-GO TyA Phase A

Fecha: 2026-07-09  
Bloque: checklist GO/NO-GO para pedir autorizacion de runtime DEV preview  
Estado: creado, runtime no autorizado.

## 1. Objetivo

Definir las condiciones exactas para pedir autorizacion a Paula antes de conectar Level 2 operacional sanitizado de TyA/Cinepolis al runtime DEV por `CX.data`.

Este bloque no ejecuta el switch. Solo define el gate final para saber si ya se puede pedir GO.

## 2. Archivos creados

- `backend/contracts/tya-runtime-dev-preview-go-nogo-phase-a-v1.json`
- `tools/contracts/tya-runtime-dev-preview-go-nogo-validate.mjs`
- `app/docs/RUNTIME-DEV-PREVIEW-GO-NOGO-TYA-PHASE-A-20260709.md`

## 3. Reportes requeridos antes de pedir GO a Paula

Debe existir evidencia local de:

1. Preflight local completo:
   - verdict: `GO_LOCAL_PREFLIGHT_COMPLETED_NO_RUNTIME`;
   - payloads Level 0, Level 1 y Level 2 presentes;
   - hard fails = 0.

2. Level 2 validado:
   - verdict: `GO_LEVEL2_SANITIZED_OPERATIONAL_SAFE_NO_RUNTIME`;
   - hard fails = 0.

3. Bridge validado:
   - verdict: `GO_SAFE_BRIDGE_NOT_CONNECTED`;
   - hard fails = 0.

4. Runtime switch gate validado:
   - verdict permitido: `GO_GATE_READY_SWITCH_NOT_AUTHORIZED` o `GO_RUNTIME_SWITCH_PRECONDITIONS_MET`;
   - hard fails = 0.

5. Rollback/smoke validado:
   - verdict: `GO_ROLLBACK_SMOKE_PLAN_READY_NO_SWITCH`;
   - hard fails = 0.

## 4. Requisitos antes de pedir GO

- Level 2 existe y valida sin hard fails.
- Bridge valida y sigue no conectado.
- Runtime switch gate valida y sigue bloqueado salvo solicitud explicita.
- Rollback/smoke valida.
- Punto unico de conexion identificado.
- Lista de archivos a tocar limitada y documentada.
- No se modifican modulos UI.
- No hay PII, secrets ni base vieja.
- No hay Firestore/Auth/Storage/Make/Gemini/HR/pagos activos.
- Cinepolis sigue como proyecto normal configurable.
- Junio sigue como control de pagos/liquidaciones, no visitas pendientes.
- Certificaciones ya presentadas quedan preservadas o en review_required.
- Paula recibe solicitud explicita de GO antes de cualquier cambio runtime.

## 5. Punto unico permitido

Preferido:

- `app/core/data.js`

Alternativa solo con aprobacion:

- un unico adapter precargado antes de modulos.

Prohibido:

- `app/modules/**`;
- hacks por modulo;
- hardcode global de Cinepolis;
- llamadas a providers desde UI.

## 6. Solicitud GO a Paula debe decir

Antes de tocar runtime, la solicitud debe incluir:

- que se va a tocar;
- que no se va a tocar;
- rollback exacto;
- URL DEV esperada o modo local;
- smoke checklist;
- NO-GO triggers;
- confirmacion de que no se ejecutara produccion, import, pago ni provider real.

## 7. NO-GO inmediato

No pedir GO ni cambiar runtime si ocurre:

- falta Level 2;
- cualquier hard fail;
- aparece PII/secrets;
- se conecta/copia base vieja;
- se necesitan cambios en modulos UI para que funcione data;
- Cinepolis queda hardcodeado globalmente;
- dedupe shopper depende de nombre visual;
- certificacion preservada fuerza retoma sin regla;
- pagos aparecen pagados sin auditoria/evidencia;
- junio se muestra como visitas pendientes;
- rollback no ejecutable;
- smoke no documentado;
- falta GO de Paula.

## 8. Smoke DEV despues del switch

Si en el futuro Paula da GO y se conecta DEV preview, se debe validar:

- app abre sin pantalla blanca;
- admin/navegacion abre;
- `CX.data` existe y mantiene interfaz;
- Cinepolis aparece como proyecto configurable;
- nivel preview visible o documentado;
- visitas sanitizadas/source-safe;
- dashboards no aparecen como visitas;
- `JUNIO 26 HN` sigue `review_required`;
- shoppers aparecen sanitizados/opacos si estan irresueltos;
- certificaciones preservadas no se piden de nuevo sin regla;
- liquidaciones aparecen como control/candidato, no pagado final;
- no hay provider activo;
- no hay errores criticos de consola.

## 9. Validador creado

`tools/contracts/tya-runtime-dev-preview-go-nogo-validate.mjs`

Puede ejecutarse con reportes:

```bash
node tools/contracts/tya-runtime-dev-preview-go-nogo-validate.mjs --preflight .tmp/tya-local-realdata-preview-preflight/local-realdata-preview-preflight-report.json --level2-validation .tmp/tya-local-realdata-preview-preflight/validations/level2/level2-sanitized-operational-report.json --bridge-validation .tmp/tya-local-realdata-preview-preflight/validations/bridge/cxdata-realdata-preview-bridge-report.json --runtime-switch-validation .tmp/tya-local-realdata-preview-preflight/validations/runtime-switch/cxdata-runtime-switch-gate-report.json --rollback-smoke-validation .tmp/tya-local-realdata-preview-preflight/validations/rollback-smoke/runtime-switch-rollback-smoke-plan-report.json
```

No cambia runtime. Solo dice si ya se puede pedir GO.

## 10. Impacto real en Phase A / produccion

Este bloque deja listo el ultimo gate antes de pasar de preparacion local/source-safe a posible DEV runtime preview.

No autoriza produccion ni import real.

## 11. Trabajo previo recuperado

Recupera:

- preflight local Level 0/1/2;
- Level 2 operacional sanitizado;
- bridge real-data preview;
- runtime switch gate;
- rollback/smoke;
- reglas TyA de HR, shoppers, certificaciones y pagos;
- no PII/no base vieja.

## 12. Claude/prototipo

Pendientes derivados:

- UI debe mostrar nivel de preview.
- UI debe evitar prometer import/produccion si solo hay DEV preview.
- Shoppers opacos y review_required deben ser claros.
- Certificaciones preservadas y liquidaciones control deben tener copy honesto.
- Academia debe explicar gate GO/NO-GO.

## 13. Estado seguro

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
