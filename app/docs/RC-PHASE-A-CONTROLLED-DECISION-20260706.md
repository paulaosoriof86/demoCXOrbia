# RC Phase A controlada - decision

Fecha: 2026-07-06

## Estado

Decision tecnica: **apta para RC Phase A controlada**.

La decision se basa en que ya pasaron los dos controles automatizados:

- `CXOrbia Phase A RC Smoke Gate`: success.
- `CXOrbia Phase A Visual Smoke`: success.

## Alcance autorizado por esta decision

Se autoriza preparar la salida como RC Phase A controlada con:

- integraciones reales apagadas;
- gates cerrados;
- datos demo/sinteticos o controlados;
- copy visible mitigado por guard;
- smoke tecnico y visual documentados;
- PR en draft hasta decision explicita de Paula.

## Alcance no autorizado

No se autoriza todavia:

- produccion real con integraciones activas;
- merge final automatico;
- deploy final sin corte controlado;
- Firestore/Auth/Storage reales;
- HR writes reales;
- Make/Gemini/mensajeria/correo real;
- import real de datos TyA;
- pagos reales automaticos;
- uso de datos sensibles crudos en repo.

## Evidencia

### Gate tecnico

- Workflow: `CXOrbia Phase A RC Smoke Gate`.
- Run: `28839033699`.
- Conclusion: success.

### Smoke visual/consola

- Workflow: `CXOrbia Phase A Visual Smoke`.
- Run: `28839033677`.
- Conclusion: success.
- Artifact: `phase-a-visual-smoke-report`.
- Artifact ID: `8127181100`.
- Digest: `sha256:f15ad030533747e50c9706a2c57a46753d691158f3408ea4c36820f1b19bc2f3`.

## Validacion cubierta

- Carga estructural de scripts.
- Sintaxis JS.
- Orden del guard de copy.
- Navegacion admin minima.
- Navegacion shopper minima.
- Academia carga en admin/shopper.
- Funcion de cuestionario shopper cargada.
- Sin fallo critico de consola en smoke visual.
- Sin pantalla blanca en flujo smoke.

## Pendientes antes de produccion real

- Confirmacion explicita de Paula para pasar de RC controlada a movimiento de deploy/corte.
- Definir si el primer deploy sera preview/staging o produccion controlada con integraciones apagadas.
- Mantener PR draft hasta autorizacion.
- Aplicar patch permanente por archivo para no depender solo del guard.
- Conectar base nueva limpia y gates reales en bloque separado.
- Ejecutar import real solo con datos TyA limpios y validados.
- Validar liquidaciones/pagos reales con fuente controlada.
- Completar hardening posterior.

## Estado seguro

Sin deploy produccion, sin merge final, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajeria/correo real, sin import real y sin datos sensibles crudos en repo.
