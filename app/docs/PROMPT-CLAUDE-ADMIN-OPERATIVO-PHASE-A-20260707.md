# Prompt Claude admin operativo Phase A - CXOrbia

Fecha: 2026-07-07

Usa este prompt para iniciar una conversacion de Claude cuando tenga capacidad.

```text
Estoy trabajando en CXOrbia TyA, plataforma SaaS multi-tenant de mystery shopping / field operations.

Antes de proponer o modificar, lee los documentos vivos del repo y respeta la metodologia:

- No reescribir arquitectura.
- No romper modulos existentes.
- No activar backend real, integraciones reales, pagos reales, mensajes reales ni import real.
- No prometer accion real si el gate esta apagado.
- No usar dashboard como lugar para parches silenciosos.
- Todo debe quedar documentado.

Repo: paulaosoriof86/demoCXOrbia
Rama: docs-tya-v6-v71-audit
PR: #7 draft/open/no merge
Base: release/cxorbia-tya-rc-20260630
Baseline viva reciente: V89 empalmada como candidata controlada.

Objetivo de este bloque:
Convertir la plataforma en administrable para Phase A, priorizando controles operativos directos con auditoria, razon obligatoria, revision humana y copy honesto.

Lee primero:

- app/docs/CLAUDE-PACKAGE-ADMIN-OPERATIVO-PHASE-A-20260707.md
- app/docs/CERTIFICATION-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md
- app/docs/CERTIFICATION-CARRYOVER-CONTRACT-CXORBIA-20260707.md
- app/docs/POSTULACIONES-ADMIN-OPERATIVO-CXORBIA-20260707.md
- app/docs/ASSIGNMENTS-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md
- app/docs/VISITS-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md
- app/docs/SETTLEMENTS-ADMIN-CONTRACT-CXORBIA-20260707.md
- app/docs/OPERATIONAL-ADMIN-CONTROLS-MATRIX-CXORBIA-20260707.md
- app/docs/AUTH-ROLE-ACCESS-CONTRACT-CXORBIA-20260707.md
- app/docs/DATA-ADAPTER-CONTRACT-CXORBIA-20260707.md
- app/docs/FIRESTORE-PHASE-A-MANIFEST-CONTRACT-CXORBIA-20260707.md

Prioriza por capacidad limitada:

1. Certificaciones administrables.
2. Postulaciones administrables.
3. Asignaciones administrables.
4. Visitas administrables.
5. Beneficios/liquidaciones administrables.
6. Patron transversal de filtros, razon obligatoria, revision humana, historial/auditoria y copy honesto.

Pendientes criticos:

Certificaciones:
- Buscar certificados, pendientes, vencidos, en revision y excepciones.
- Autorizar excepcion individual para una certificacion especifica.
- Revocar excepcion individual.
- Solicitar certificacion especifica a un shopper especifico.
- Resolver certificacion presentada que no se reflejo.

Postulaciones:
- Mostrar todas las postulaciones, no solo pendientes.
- Filtrar por estado, shopper, visita, pais y proyecto.
- Aprobar, no aprobar, reabrir o mover a revision con razon.

Asignaciones:
- Buscar por visita, shopper, estado y fuente.
- Asignar o liberar con razon.
- Resolver duplicados de fuente con revision.
- Mostrar sync pendiente o conflicto.

Visitas:
- Buscar por proyecto, pais, franja, estado, shopper y fuente.
- Corregir estado puntual con razon.
- Bloquear o desbloquear disponibilidad.
- Marcar revision requerida.
- Ajustar ventana solo bajo regla.

Beneficios / liquidaciones:
- Buscar por periodo, shopper, visita, proyecto y estado.
- Revisar monto.
- Aprobar para ciclo.
- Programar, confirmar, reprogramar o trasladar.
- Bloquear por revision.
- Resolver vinculo con visita.

Entregable esperado:
- Indica archivos tocados.
- Indica que resolviste.
- Indica que quedo pendiente.
- Indica impacto en Academia.
- Indica si agregaste filtros, botones, estados, modales, tablas, badges o textos.
- Indica si algo requiere backend real posterior.
- No avances a produccion ni merge.
```
