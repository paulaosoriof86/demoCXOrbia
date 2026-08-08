# Firestore Phase A manifest contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable de manifest Firestore Phase A.

Archivo creado:

- `tools/contracts/cxorbia-firestore-phase-a-manifest-contract.mjs`

## Objetivo

Preparar el paso a base nueva y limpia sin activar Firestore real.

El contrato declara colecciones logicas, llaves requeridas y gates apagados para que el futuro adaptador preserve multi-tenant y compatibilidad con la plataforma.

## Colecciones logicas Phase A

- `tenants`
- `projects`
- `visits`
- `assignments`
- `applications`
- `shoppers`
- `certificationStates`
- `settlements`
- `integrationOutbox`
- `reviewQueue`
- `academyContent`
- `auditEvents`

## Reglas clave

- Toda coleccion debe incluir `tenantId`.
- Toda coleccion de alcance proyecto debe incluir `projectId`.
- Ninguna coleccion queda activa en este contrato.
- El estado esperado en repo es `disabled`, `preview` o `ready_for_gate`.
- `active_controlled` solo corresponde despues de autorizacion y evidencia.

## Relacion con Phase A

Este manifest cubre el ciclo base:

- tenants y proyectos;
- visitas;
- postulaciones;
- asignaciones;
- shoppers;
- certificaciones;
- beneficios/liquidaciones;
- outbox de integraciones;
- cola de revision humana;
- Academia;
- auditoria.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para futuros clientes porque modela colecciones por tenant/proyecto y no por cliente unico.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

No cambia UI, pero Claude debe conservar estados y copy compatibles con estas entidades: visitas, postulaciones, asignaciones, shoppers, certificaciones, beneficios/liquidaciones, revision humana, integraciones y Academia.

### Academia

Academia debe poder referenciar entidades y reglas por tenant/proyecto.

### Sin impacto Claude

No hay cambio visual directo.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Firestore real, sin imports, sin lectura de secrets y sin datos sensibles.
