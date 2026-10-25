# Backend module review plan V82 TyA

Fecha: 2026-07-04

## Objetivo

Confirmar que el backend se revisara por modulos, usando V82 como baseline viva y respetando Phase A/Phase B.

## Decision

La revision no sera lineal ni superficial. Se hara por modulos, segun prioridad operativa.

En cada modulo se documentara:

- que hace hoy;
- que datos usa;
- que metodos de `CX.data` invoca;
- que contrato backend requiere;
- que llaves estables necesita;
- que inconsistencias existen;
- que falta para Phase A;
- que queda para Phase B;
- que debe documentarse para Academia por rol.

## Prioridad Phase A

1. Core y `CX.data` adapter.
2. Auth, roles y claims.
3. Proyectos y wizard.
4. HR Source y sync HR/plataforma.
5. Shoppers historicos.
6. Postulaciones y asignaciones.
7. Visitas, agenda, reprogramacion y cancelacion.
8. Cuestionarios.
9. Revision admin y submitido.
10. Certificaciones.
11. Liquidaciones y pagos.
12. Notificaciones y automatizaciones con gates.
13. Portal cliente basico.
14. Academia minima por rol.

## Phase B

1. Academia profunda por roles.
2. Tours guiados.
3. Make, Gemini, WhatsApp y Storage reales.
4. Analitica avanzada.
5. SaaS Console avanzado.
6. Paquetes comerciales y venta cruzada.
7. Hardening completo.

## Plantilla por modulo

Cada revision debe registrar:

1. Modulo.
2. Archivos.
3. Roles que lo usan.
4. Datos leidos y escritos.
5. Metodos `CX.data`.
6. Contrato backend.
7. Estado V82.
8. Inconsistencias.
9. Riesgos.
10. Pendientes prototipo.
11. Pendientes backend.
12. Pendientes datos.
13. Contenido Academia requerido por rol.
14. Phase A o Phase B.

## Estado seguro

Sin cambios frontend, sin runtime, sin Firestore writes, sin deploy, sin produccion y sin import real.
