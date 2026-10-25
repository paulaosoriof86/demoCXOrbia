# Project runtime contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de configuracion de proyecto desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-project-runtime-admin-actions-contract.mjs`

## Necesidad cubierta

Cada proyecto debe ser configurable sin convertir reglas particulares en logica fija del prototipo.

Debe permitir administrar:

- pais y moneda;
- fuente externa;
- fuente de cuestionario;
- documentos requeridos;
- reglas de agendamiento;
- reglas de reprogramacion;
- reglas de cancelacion;
- reglas de beneficios/liquidaciones;
- reglas de Academia;
- gates de integracion.

## Acciones permitidas

- `search_project_config`
- `preview_project_config`
- `request_config_change`
- `approve_config_change`
- `pause_project_rule`
- `restore_project_rule`
- `map_questionnaire_source`
- `map_external_source`
- `mark_gate_required`

## Estados requeridos

- `draft`
- `preview_ready`
- `change_requested`
- `approved_preview`
- `paused`
- `restored`
- `mapped`
- `gate_required`
- `blocked_gate`

## Areas configurables

- `country_currency`
- `external_source`
- `questionnaire_source`
- `documents`
- `scheduling_rules`
- `rescheduling_rules`
- `cancellation_rules`
- `payments_rules`
- `academy_rules`
- `integration_gates`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto y regla cuando aplique.
- No se permiten cambios globales sobre todos los proyectos.
- Preview no equivale a configuracion productiva real.
- Las fuentes de cuestionario pueden ser plataforma, link general, link por visita o fuente externa.
- Las integraciones externas requieren gate activo antes de prometer sincronizacion real.
- Cambios de reglas deben impactar Academia, notificaciones y modulos operativos cuando corresponda.
- Toda aprobacion debe quedar auditada.

## Pendiente para Claude

Claude debe incorporar en Configuracion de proyecto:

- vista por proyecto con secciones configurables;
- filtros o selector por tenant/proyecto;
- estados de configuracion y gate;
- mapeo visible de fuente externa y cuestionario;
- acciones para solicitar cambio, aprobar preview, pausar o restaurar regla;
- historial/auditoria visible;
- copy claro diferenciando configuracion preview, gate requerido y productivo real;
- consistencia con Academia, Visitas, Evidencias, Beneficios, Importaciones y Notificaciones.

## Relacion con Phase A

Impacta directamente:

- multi-proyecto desde el inicio;
- pais y moneda;
- fuente externa por proyecto;
- cuestionario configurable por proyecto o visita;
- documentos y evidencias requeridas;
- reglas de agendamiento, reprogramacion y cancelacion;
- beneficios/liquidaciones;
- integraciones futuras;
- Academia y certificaciones.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes y proyectos, porque convierte reglas por cliente/proyecto en configuracion administrable.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Configuracion, Proyectos, Academia, Visitas, Evidencias, Beneficios, Importaciones y Notificaciones.

### Academia

Impacto directo porque las reglas de proyecto determinan cursos, manuales, certificaciones, rutas y mensajes.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin sincronizacion externa y sin datos sensibles.
