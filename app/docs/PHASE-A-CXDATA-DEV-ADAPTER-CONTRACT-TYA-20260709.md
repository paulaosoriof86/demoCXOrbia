# Phase A CX.data DEV adapter contract TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Definir el contrato del futuro adapter DEV de `CX.data` para Phase A TyA/Cinepolis, con foco en datos reales/sanitizados de TyA y sin activar runtime.

Este bloque se mantiene en el plan Phase A: no es infraestructura abstracta. Define exactamente que dominios reales/sanitizados deben poder leerse cuando llegue el runtime DEV, y que writes siguen bloqueados.

## Archivos agregados

- `backend/contracts/phase-a-cxdata-dev-adapter-contract-v1.json`
- `tools/contracts/tya-phase-a-cxdata-dev-adapter-contract-validate.mjs`

## Enfoque Phase A real TyA

El adapter futuro debe priorizar:

- HR source-safe/full-flow u output sanitizado original TyA;
- visitas reales mapeadas con `visitId`/`hrRowId`;
- shoppers historicos sin datos sensibles crudos;
- certificaciones ya presentadas preservadas;
- postulaciones/asignaciones sin duplicar;
- liquidaciones/pagos de junio como control administrativo;
- rutas de cuestionario configurables;
- colas operativas y auditoria;
- Cinépolis como proyecto configurable, no hardcoded.

## Regla de interfaz

La interfaz actual de `CX.data` debe conservarse exactamente. El futuro adapter no puede obligar a reescribir modulos UI.

Reglas:

- un solo punto futuro de switch;
- fallback localStorage disponible;
- adapter apagado por defecto;
- no reescribir `/app/modules`;
- no reescribir `/app/core` salvo punto unico futuro documentado;
- writes devuelven bloqueo honesto hasta gate;
- lecturas deben mantener shape compatible con prototipo.

## Dominios requeridos para Phase A

- `tenant_project_config`
- `hr_source_status`
- `visits`
- `shoppers`
- `applications_assignments`
- `certifications`
- `liquidations_payments_june`
- `questionnaire_routes`
- `operational_queues`
- `audit_preview`

Cada dominio queda `writeEnabledNow=false`.

## Gate de datos reales antes de leer

Antes de que el adapter lea en DEV debe existir:

- output HR source-safe original o dry-run real/sanitizado;
- no fixture sintetico;
- no `.tmp` derivado como fuente original;
- no datos sensibles crudos;
- tenant/proyecto/configuracion presente;
- Cinépolis como proyecto configurable;
- periodos/paises/monedas presentes;
- visitas con stable keys;
- shoppers historicos source-safe;
- certificaciones preservadas;
- control de liquidaciones/pagos junio;
- cuestionarios configurados o bloqueados honestamente.

## Writes bloqueados

Todos los writes deben responder bloqueados hasta gate:

```json
{
  "ok": false,
  "status": "blocked_by_gate",
  "runtimeConnected": false,
  "writeExecuted": false,
  "messageKey": "ACTION_PREPARED_PENDING_BACKEND_GATE",
  "auditPreviewRequired": true
}
```

## Hard stops

- Cambiar interfaz `CX.data`.
- Multiples puntos de switch.
- Adapter habilitado por defecto.
- Modulos UI modificados por adapter.
- Demo usado como fuente final.
- Fixture usado como dato real.
- `.tmp` derivado usado como fuente original.
- Datos sensibles expuestos.
- Firestore writes.
- HR writes.
- Make/Gemini live.
- Pago real.
- Base vieja.
- Pedir certificacion ya preservada sin revision.
- Tratar visitas de junio como pendientes de ejecutar.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-cxdata-dev-adapter-contract-validate.mjs --out .tmp/tya-phase-a-cxdata-dev-adapter-contract
```

El validador solo revisa contrato. No activa adapter ni runtime.

## Impacto Claude/prototipo

Claude debe reflejar que, cuando haya adapter DEV, los estados deben ser honestos:

- adapter apagado;
- runtime no conectado;
- lectura source-safe;
- writes bloqueados;
- no pagos reales;
- no sync real;
- no fixture como dato real.

Claude no debe modificar UI suponiendo que el adapter ya esta activo.

## Impacto Academia

Academia debe explicar:

- que es `CX.data`;
- por que se conserva la interfaz;
- que significa adapter apagado;
- diferencia entre lectura source-safe y write real;
- por que localStorage sigue como fallback hasta corte;
- por que junio son pagos/liquidaciones y no visitas pendientes;
- por que certificaciones ya presentadas se preservan.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Adapter no habilitado.
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
