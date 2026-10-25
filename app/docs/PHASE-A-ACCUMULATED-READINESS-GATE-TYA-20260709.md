# Phase A accumulated readiness gate TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Consolidar en un solo gate el readiness acumulado Phase A para saber que ya esta contratado, que sigue bloqueado y que falta antes de pedir GO de runtime DEV. Este bloque evita repetir Level 0/1 y mantiene el avance encaminado hacia operacion real controlada.

## Archivos agregados

- `backend/contracts/phase-a-accumulated-readiness-gate-v1.json`
- `tools/contracts/tya-phase-a-accumulated-readiness-gate.mjs`

## Bloques consolidados

El gate acumulado revisa presencia de:

1. Continuidad operacional Phase A.
2. Maquina de estados operacional.
3. Acciones administrativas auditables.
4. Colas operativas.
5. Checkpoint real-data preview sin reproceso.
6. Checkpoint no-reversion Level 0/1.
7. Addendum Claude/prototipo operativo auditable.
8. Pendientes prototipo de colas auditables.

## Areas de readiness acumulado

- HR source-safe/full-flow.
- Sync HR/plataforma.
- Certificaciones preservadas.
- Liquidaciones/pagos junio.
- Acciones administrativas.
- Colas operativas.
- Claude/prototipo.
- Academia.

## Decision clave

Este gate no autoriza runtime. Solo confirma que la base contractual y documental esta lista para continuar. Runtime DEV solo puede pedirse despues de gate limpio y GO explicito de Paula.

## Hard stops antes de runtime DEV

- Runtime sin GO de Paula.
- Firestore writes antes de gate.
- HR writes antes de gate.
- Imports antes de gate.
- Make/Gemini live antes de gate.
- Pago real antes de gate.
- Fixture sintetico usado como evidencia real.
- `.tmp` derivado usado como fuente original.
- Datos sensibles en repo.
- Parche de modulos UI desde backend.
- Repetir Level 0/1 sin causa real.

## Criterios antes de pedir GO de runtime DEV

- Contratos requeridos presentes.
- Checkpoint no-reversion presente.
- Gate de continuidad operacional presente.
- State machine presente.
- Acciones auditables presentes.
- Colas operativas presentes.
- Pendientes Claude/prototipo documentados.
- Impacto Academia documentado.
- Sin runtime/writes/imports/deploy/pagos.
- GO explicito de Paula solicitado solo despues de gate limpio.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-accumulated-readiness-gate.mjs --out .tmp/tya-phase-a-accumulated-readiness-gate
```

El validador solo revisa presencia/contratos/documentacion. No llama proveedores, no escribe base, no importa, no despliega y no cambia runtime.

## Interpretacion

### GO_PHASE_A_ACCUMULATED_READINESS_NO_RUNTIME

La base contractual y documental acumulada permite continuar Phase A sin repetir Level 0/1. No autoriza runtime.

### NO_GO_PHASE_A_ACCUMULATED_READINESS_BLOCKED

Corregir solo causa raiz. No reiniciar metodologia, no repetir Level 0/1, no activar runtime, no importar, no escribir, no desplegar.

## Impacto Claude/prototipo

Claude debe usar este gate como mapa de lo que ya esta contratado backend y lo que debe representar visualmente:

- estados honestos;
- colas operativas;
- acciones preparadas/deshabilitadas;
- auditoria;
- copy de no write/no sync/no pago/no produccion;
- proyecto configurable;
- no fixtures como datos reales.

## Impacto Academia

Academia debe usar este gate como estructura de manuales/rutas:

- readiness acumulado;
- gates;
- preview vs produccion;
- acciones auditables;
- colas operativas;
- no-reversion Level 0/1;
- datos sensibles prohibidos;
- pagos como control administrativo.

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
