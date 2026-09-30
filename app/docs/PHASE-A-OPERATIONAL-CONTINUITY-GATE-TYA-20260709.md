# Phase A operational continuity gate TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Agregar un gate source-safe para mantener Phase A encaminada hacia operacion real controlada sin repetir Level 0/1, sin confundir fixtures u outputs derivados con evidencia TyA real, y sin desbloquear runtime/imports/deploy antes de gates finales.

## Archivos agregados

- `backend/contracts/phase-a-operational-continuity-gate-v1.json`
- `tools/contracts/tya-phase-a-operational-continuity-gate.mjs`

## Que valida

El gate revisa, sin llamadas externas ni escritura:

1. Que exista el contrato de continuidad operacional.
2. Que Level 0 quede reconocido como superado para readiness de proyecto/periodos.
3. Que Level 1 no se reinicie desde cero.
4. Que no se use fixture sintetico como evidencia real.
5. Que no se use `.tmp` derivado como fuente original.
6. Que existan los bloques/documentos minimos para HR source-safe, sync HR/plataforma, certificaciones, liquidaciones/pagos de junio, cuestionario configurable, proyecto configurable y checkpoints no-reversion.
7. Que el estado esperado siga siendo seguro: sin runtime, sin deploy, sin produccion, sin Firestore writes, sin HR writes, sin imports, sin Make/Gemini, sin pagos reales y sin PII.

## Bloques Phase A cubiertos

- HR source-safe/full-flow.
- Sincronizacion HR/plataforma con conflictos y stable keys.
- Certificaciones ya presentadas conservadas.
- Liquidaciones/pagos de junio como control/candidato, no pago real.
- Cuestionario configurable por proyecto/visita.
- Cinépolis como proyecto configurable dentro de TyA, no logica global.
- Checkpoints no-reversion Level 0/1.

## Uso tecnico futuro

```bash
node tools/contracts/tya-phase-a-operational-continuity-gate.mjs --out .tmp/tya-phase-a-operational-continuity-gate
```

Este comando solo genera reporte local. No llama proveedores, no escribe base, no importa, no despliega y no cambia runtime.

## Interpretacion

### GO_PHASE_A_CONTINUE_NO_RUNTIME

Se puede continuar el plan Phase A real controlada sin repetir Level 0/1 y sin activar runtime.

### NO_GO_PHASE_A_CONTINUITY_BLOCKED

Corregir solo causa raiz. No repetir Level 0/1, no pedir datos ya documentados, no activar runtime, no importar y no desplegar.

## Guardrails

- No usar `tools/migration/synthetic-fixtures/phase-a/*` como evidencia real.
- No usar outputs derivados de `.tmp` como fuente original.
- No pedir HR/reglas/shoppers/certificaciones/liquidaciones ya documentadas sin revisar maestro, addenda, repo y outputs existentes.
- No convertir Cinépolis en logica unica global.
- No reescribir `/app/modules` ni `/app/core` desde backend.
- No cambiar runtime sin GO explicito de Paula.

## Clasificacion

- Reusable CXOrbia: si. Gate de continuidad operacional y no-reversion por tenant/proyecto.
- Exclusivo cliente: parcial. TyA/Cinépolis/GT/HN/junio son contexto cliente.
- Claude/prototipo: si. Debe reflejar estados honestos y no confundir demo/fixture con real.
- Academia: si. Debe explicar no-reversion, fixtures, outputs derivados, fuente original sanitizada y gates.
- Sin impacto Claude: no.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
