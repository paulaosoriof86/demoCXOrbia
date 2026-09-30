# PENDIENTES PROTOTIPO - Module readiness matrix TyA

Fecha: 2026-07-09

## Pendiente para Claude/prototipo

Representar en la UI generica un readiness por modulo antes de conexion real.

## Requisitos UI/UX genericos

- Wizard o panel de configuracion por tenant/proyecto.
- Separacion visible entre proyecto y periodo.
- Estado de HR/source: source-safe, tabs detectados, ultima lectura, masked source.
- Estado de usuarios/personas/roles/scopes.
- Estado de Academia/cursos/manuales/checklists/glosario.
- Estado de certificaciones y carryover.
- Estado de shoppers publicos/protegidos.
- Estado de visitas/asignaciones y conflictos.
- Estado de liquidaciones/pagos sin ejecucion real.
- Estado de notificaciones/outbox sin envio real.
- Estado de reviewQueue/auditEvents.
- Estado de gates Make/Gemini/Storage/pagos/HR writeback.
- Estado de PWA/branding configurable.

## Mensajes honestos requeridos

- `readiness pendiente`.
- `gate apagado`.
- `dry-run`.
- `source-safe`.
- `no escrito`.
- `requiere acceso`.
- `pendiente Auth`.

## No hardcodear

No usar TyA, paises, monedas, HR, periodos, reglas, logos, cursos, certificaciones, cuestionarios o pagos como valores fijos del prototipo. Deben ser configuracion editable/seed.
