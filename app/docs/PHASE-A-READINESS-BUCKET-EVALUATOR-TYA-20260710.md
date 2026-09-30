# Phase A readiness bucket evaluator TyA

Fecha: 2026-07-10
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Continuar el plan Phase A mientras Claude trabaja, agregando un evaluador funcional que clasifica cada modulo critico en `GO_READY`, `WARNING_READY` o `NO_GO_BLOCKER` antes de cualquier conexion real de TyA.

Este bloque evita reprocesos porque separa:

- que ya esta preparado en backend;
- que requiere prototipo/Claude;
- que bloquea conexion real;
- que puede seguir solo como dry-run;
- que es especifico de TyA;
- que queda reusable para CXOrbia.

## Archivos agregados

- `backend/contracts/phase-a-readiness-bucket-evaluator-v1.json`
- `backend/config/phase-a-readiness-buckets.source-safe.json`
- `tools/release/tya-readiness-bucket-evaluator.mjs`

## Que problema resuelve

Ya existe mucha documentacion y varios contratos/adapters. El riesgo es que, al conectar TyA real o al auditar una candidata Claude, se vuelva a trabajar por memoria y se pierda precision.

Este evaluador convierte el avance acumulado en un semaforo verificable por modulo.

## Modulos evaluados

- Tenant / Proyecto / Periodo.
- HR / Source viva.
- Usuarios / Personas / Roles / Scopes.
- Academia / Cursos / Manuales.
- Certificaciones / Carryover.
- Shoppers / Perfiles protegidos.
- Liquidaciones / Pagos.
- ReviewQueue / AuditEvents.
- Make / Gemini / Providers / Gates.
- CX.data switch backend.

## Buckets

- `GO_READY`: preparado para siguiente paso dry-run o gateado. No significa produccion.
- `WARNING_READY`: preparado parcialmente; puede seguir como dry-run o trabajo de prototipo, pero no conexion real.
- `NO_GO_BLOCKER`: bloquea conexion/import/Auth/writeback/produccion.
- `CLAUDE_REQUIRED`: requiere ajuste de prototipo, porque backend no debe parchar `/app/modules` ni `/app/core`.
- `BACKEND_PREPARED`: backend ya preparo contrato/adapter/gate; Claude debe representarlo honestamente, no reconstruirlo.

## Comando seguro

```bash
node tools/release/tya-readiness-bucket-evaluator.mjs --out .tmp/readiness-buckets
```

El comando genera reporte JSON/MD y no llama Firebase, Auth, Firestore ni proveedores. No escribe datos, no importa, no ejecuta pagos y no despliega reglas.

## Impacto Phase A TyA

Antes de conectar TyA real, este evaluador debe mostrar si los bloqueos estan en:

- proyecto/periodo;
- HR/source;
- roles/scopes;
- Academia/cursos;
- certificaciones;
- shoppers protegidos;
- liquidaciones/pagos;
- reviewQueue/auditEvents;
- gates de integracion;
- switch `CX.data`.

La meta es que no se conecte TyA real si un modulo conocido sigue incompleto.

## Impacto Claude/prototipo

Cuando Claude entregue candidata, este evaluador ayuda a decidir que pedirle de inmediato:

- P0 que bloquea conexion real;
- P1 que debe corregir mientras tenga capacidad;
- elementos ya preparados por backend que solo debe representar en UI;
- elementos especificos de TyA que no deben hardcodearse en el prototipo generico;
- patrones reutilizables que deben quedar configurables para nuevos tenants.

## Impacto reusable CXOrbia

El mismo evaluador aplica a nuevos tenants/proyectos. Ningun cliente nuevo deberia conectarse a fuente real sin pasar por buckets equivalentes.

## Estado seguro

Contrato/config/script validador solamente. No base real, no Auth real, no Firestore write, no import, no produccion, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
