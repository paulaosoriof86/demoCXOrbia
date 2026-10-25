# Operational admin controls matrix - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego matriz reusable para identificar modulos que necesitan controles operativos administrables desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-operational-admin-controls-matrix-contract.mjs`

## Objetivo

Revisar que otros modulos, igual que certificaciones, requieren acciones administrativas directas para resolver casos operativos sin depender de correcciones externas.

La plataforma debe ser totalmente administrable, pero con auditoria, gates y acciones limitadas por tenant/proyecto.

## Modulos que necesitan control operativo admin

### Certificaciones

Necesita busqueda por estado, excepcion individual por certificacion especifica, solicitud individual y resolucion de certificaciones no reflejadas.

### Postulaciones

Necesita ver todas las postulaciones por estado, aprobar, rechazar, reabrir o mover a revision con razon.

### Asignaciones

Necesita asignar shopper, desasignar con razon, resolver duplicados de fuente y enviar conflictos a revision.

### Visitas

Necesita corregir estado con razon, bloquear disponibilidad, marcar revision requerida y editar ventanas solo bajo regla.

### Beneficios / liquidaciones

Necesita revisar montos, programar, confirmar, trasladar a otro periodo o bloquear por revision.

### Evidencias

Necesita marcar evidencia requerida, revisar evidencia subida, aprobar o rechazar con razon y referencia segura.

### Integraciones

Necesita ver gates, pausar, reintentar en preview, revisar outbox y enviar conflictos a revision.

### Academia

Necesita mapear contenido a reglas, marcar contenido faltante, enviar a revision y publicar solo despues de aprobacion.

### Importaciones

Necesita preview, revision de anomalias, aprobacion de lote limpio y rechazo de filas.

### Notificaciones

Necesita previsualizar mensaje, aprobar, pausar y reenviar solo si esta permitido.

### Dashboard

No debe operar cambios directos. Debe funcionar como lectura, drilldown y acceso a modulos donde se hacen acciones auditadas.

## Reglas clave

- Toda accion operativa debe tener auditoria.
- No se permiten acciones globales sin tenant/proyecto.
- No se deben corregir datos silenciosamente.
- Los conflictos deben ir a revision humana.
- El dashboard no debe convertirse en lugar de parches; debe llevar al modulo correspondiente.
- Las acciones reales deben respetar gates y evidencia.

## Pendiente para Claude

Claude debe incorporar UI o patrones consistentes para:

- buscadores y filtros por modulo;
- acciones administrativas con razon obligatoria;
- estados de revision humana;
- historial/auditoria visible;
- mensajes claros de accion bloqueada, preview, pendiente o confirmada;
- evitar botones que prometan accion real si backend/gate no esta activo.

## Relacion con Academia

Academia impacta especialmente en:

- certificaciones;
- beneficios/liquidaciones;
- evidencias;
- notificaciones;
- contenido relacionado con reglas de proyecto.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes porque define patron de administracion operativa por modulo.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo. Claude debe implementar patrones de administracion operativa donde aplique.

### Academia

Impacto parcial/directo en modulos que cambian rutas, cursos, manuales o notificaciones.

### Sin impacto Claude

No aplica. Este bloque genera pendientes Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin notificaciones reales y sin datos sensibles.
