# Claude package admin operativo Phase A - CXOrbia

Fecha: 2026-07-07

## Estado del paquete

Este paquete ya vale la pena enviarlo a Claude cuando haya capacidad, porque consolida pendientes criticos de UI/UX para que la plataforma sea administrable en Phase A.

No reemplaza la fuente viva ni autoriza merge, deploy o produccion real.

## Contexto repo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`
- Baseline viva reciente: V89 empalmada como candidata controlada

## Prioridad para Claude

Claude tiene poca capacidad, por eso debe priorizar solo lo critico:

1. Certificaciones administrables.
2. Postulaciones administrables.
3. Asignaciones administrables.
4. Visitas administrables.
5. Beneficios/liquidaciones administrables.
6. Patron transversal de auditoria, razon obligatoria, revision humana y copy honesto.

## Documentos que Claude debe leer

- `app/docs/CERTIFICATION-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md`
- `app/docs/CERTIFICATION-CARRYOVER-CONTRACT-CXORBIA-20260707.md`
- `app/docs/POSTULACIONES-ADMIN-OPERATIVO-CXORBIA-20260707.md`
- `app/docs/ASSIGNMENTS-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md`
- `app/docs/VISITS-ADMIN-ACTIONS-CONTRACT-CXORBIA-20260707.md`
- `app/docs/SETTLEMENTS-ADMIN-CONTRACT-CXORBIA-20260707.md`
- `app/docs/OPERATIONAL-ADMIN-CONTROLS-MATRIX-CXORBIA-20260707.md`
- `app/docs/AUTH-ROLE-ACCESS-CONTRACT-CXORBIA-20260707.md`
- `app/docs/DATA-ADAPTER-CONTRACT-CXORBIA-20260707.md`
- `app/docs/FIRESTORE-PHASE-A-MANIFEST-CONTRACT-CXORBIA-20260707.md`

## Reglas para Claude

- No reescribir arquitectura.
- No tocar backend real.
- No activar integraciones reales.
- No prometer pagos, sync, mensajes o import reales si gate no esta activo.
- No convertir dashboard en lugar de acciones silenciosas.
- Toda accion admin debe estar limitada por tenant/proyecto y entidad especifica.
- Toda accion admin debe pedir razon.
- Todo conflicto debe ir a revision humana.
- Todo cambio relevante debe quedar visible en historial o auditoria.
- Academia debe ajustarse cuando certificaciones, rutas, manuales o notificaciones cambien.

## Entregable esperado de Claude

Una candidata de prototipo que incorpore administracion operativa prioritaria sin romper modulos existentes.

Debe documentar:

- que resolvio;
- que no alcanzo;
- que impacto tuvo en Academia;
- que modulos toco;
- si agrego botones, filtros, estados, modales o textos nuevos;
- si algun cambio requiere backend real posteriormente.

## Pendientes criticos por modulo

### Certificaciones

- Buscar certificados, pendientes, vencidos, en revision y excepciones.
- Autorizar excepcion individual para una certificacion especifica.
- Revocar excepcion individual.
- Solicitar certificacion especifica a un shopper especifico.
- Resolver certificacion presentada que no se reflejo.

### Postulaciones

- Mostrar todas las postulaciones, no solo pendientes.
- Filtrar por estado, shopper, visita, pais y proyecto.
- Aprobar, no aprobar, reabrir o mover a revision con razon.

### Asignaciones

- Buscar por visita, shopper, estado y fuente.
- Asignar o liberar con razon.
- Resolver duplicados de fuente con revision.
- Mostrar sync pendiente o conflicto.

### Visitas

- Buscar por proyecto, pais, franja, estado, shopper y fuente.
- Corregir estado puntual con razon.
- Bloquear o desbloquear disponibilidad.
- Marcar revision requerida.
- Ajustar ventana solo bajo regla.

### Beneficios / liquidaciones

- Buscar por periodo, shopper, visita, proyecto y estado.
- Revisar monto.
- Aprobar para ciclo.
- Programar, confirmar, reprogramar o trasladar.
- Bloquear por revision.
- Resolver vinculo con visita.

## Clasificacion del paquete

### Reusable CXOrbia

Si. El paquete define patron reusable de administracion operativa por modulo.

### Exclusivo cliente

No debe quedar como logica exclusiva del cliente actual. Lo especifico debe quedar como configuracion de tenant/proyecto.

### Claude/prototipo

Impacto directo y prioritario.

### Academia

Impacto directo en certificaciones, manuales, cursos, rutas por rol y notificaciones.

### Sin impacto Claude

No aplica.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin sincronizacion real, sin notificaciones reales y sin datos sensibles.
