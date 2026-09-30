# Phase A runtime DEV switch plan TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Separar claramente la solicitud de GO del cambio tecnico de runtime DEV. Este documento prepara el plan futuro para runtime DEV preview, pero no ejecuta nada.

## Archivos agregados

- `backend/contracts/phase-a-runtime-dev-switch-plan-v1.json`
- `tools/contracts/tya-phase-a-runtime-dev-switch-plan-validate.mjs`

## Decision clave

Este bloque no cambia runtime. No toca UI. No escribe base. No importa. No despliega. No conecta proveedores.

El runtime DEV switch solo podria prepararse en un paso separado si previamente existe:

1. GO exacto de Paula registrado.
2. Readiness acumulado limpio.
3. GO/NO-GO runtime DEV limpio.
4. Rollback/smoke listo.
5. Punto unico de switch CX.data confirmado.
6. Adapter DEV apagado por defecto.
7. Input source-safe no fixture y no `.tmp` derivado.

## Alcance permitido futuro

Solo DEV preview. Produccion sigue bloqueada.

No se habilita en este plan:

- Firestore writes.
- HR writes.
- Imports.
- Deploy.
- Make live.
- Gemini live.
- Pagos live.
- Storage evidencias live.
- Auth produccion live.
- Base vieja.

## Pasos futuros preparados, no ejecutados

1. Confirmar rama/PR correctos.
2. Confirmar punto unico de switch `CX.data`.
3. Confirmar adapter backend DEV apagado por defecto.
4. Confirmar input source-safe/no fixture/no `.tmp` derivado.
5. Habilitar runtime DEV preview bajo gate en PR separado.
6. Ejecutar smoke manual controlado.
7. Rollback inmediato si smoke falla.

## Smoke manual futuro

Checklist futuro:

- Login/roles visibles sin auth produccion.
- Navegacion y modulos cargan sin regresion.
- Interfaz `CX.data` sin ruptura.
- HR source-safe visible solo si gate activo.
- Asignaciones no duplican.
- Conflictos muestran cola de revision.
- Certificaciones preservadas no se piden de nuevo.
- Liquidaciones junio muestran control, no pago real.
- Cuestionarios configurables.
- No claims de Make/Gemini live.
- No emails/WhatsApp/pagos reales.
- Rollback disponible.

## Rollback requerido

- Punto unico de switch desactivable.
- Sin perdida de datos al desactivar.
- Fallback localStorage/adapter apagado disponible hasta corte final.
- Sin writes Firestore/HR antes del rollback.
- Rollback documentado en `CAMBIOS-BACKEND.md`.

## Hard stops

- Falta GO Paula.
- GO ambiguo.
- GO/NO-GO runtime sucio.
- Readiness acumulado sucio.
- Adapter toca directamente `/app/modules`.
- Cambia interfaz `CX.data`.
- Multiples puntos de switch.
- Fixture usado como input real DEV.
- `.tmp` derivado usado como input original.
- Writes Firestore habilitados.
- Writes HR habilitados.
- Make/Gemini live.
- Pagos habilitados.
- Intento deploy produccion.
- Intento conectar base vieja.
- Rollback faltante.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-runtime-dev-switch-plan-validate.mjs --out .tmp/tya-phase-a-runtime-dev-switch-plan
```

El validador solo revisa el plan. No cambia runtime.

## Interpretacion

### GO_RUNTIME_DEV_SWITCH_PLAN_READY_NO_EXECUTION

El plan futuro queda listo como contrato, pero no ejecutado.

### NO_GO_RUNTIME_DEV_SWITCH_PLAN_BLOCKED

Corregir solo causa raiz. No ejecutar runtime, writes, imports, deploy ni pagos.

## Impacto Claude/prototipo

Claude no debe interpretar este plan como runtime activo. Solo como arquitectura futura:

- adapter DEV bajo gate;
- `CX.data` estable;
- estados honestos;
- no prometer datos reales si no hay runtime;
- rollback visible para admin/dev cuando aplique.

## Impacto Academia

Academia debe explicar:

- diferencia entre GO request y switch runtime;
- DEV preview vs produccion;
- smoke manual;
- rollback;
- adapter bajo gate;
- por que `CX.data` debe conservar interfaz.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Sin runtime conectado.
- Sin switch ejecutado.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
