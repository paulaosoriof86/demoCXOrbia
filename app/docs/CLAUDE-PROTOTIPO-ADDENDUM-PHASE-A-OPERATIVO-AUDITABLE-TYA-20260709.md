# Addendum Claude/prototipo - Phase A operativo auditable TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Objetivo

Mantener documentado para Claude/prototipo todo lo que backend preparo como contratos replicables, pendientes UI, mejoras locales y necesidades de Academia, sin tocar directamente `/app/modules` ni `/app/core`.

## Backend replicable preparado

Quedan como patrones reutilizables CXOrbia:

- no-reversion Level 0/1;
- gate de continuidad operacional Phase A;
- maquina de estados operacional;
- acciones administrativas auditables;
- colas operativas;
- auditoria obligatoria por tenant/proyecto;
- separacion entre fixture, output derivado y fuente real sanitizada;
- pagos como control administrativo, no ejecucion financiera;
- certificaciones preservadas;
- sync HR/plataforma con stable keys y conflictos.

## Lo que Claude debe reflejar en prototipo

Claude debe preparar UI/UX futura para:

- tablero de colas operativas;
- estados honestos por cola: abierto, en revision, bloqueado, resuelto preview;
- severidad: blocker, warning, info;
- drill por item con sourceRef opaca y llaves estables no sensibles;
- botones de accion preparados, deshabilitados si gate esta apagado;
- razon obligatoria en acciones de riesgo;
- bitacora/auditoria visible;
- mensajes que no prometan envio real, sync real, import real, pago real, Make/Gemini activo ni produccion.

## Pendientes para prototipo

- UI de colas por tipo: conflictos, sync HR/plataforma, certificaciones, liquidaciones/pagos, cuestionario, correcciones.
- Filtros por tenant, proyecto, pais, severidad, estado y sourceRef.
- Drill de item con stable keys no sensibles.
- Botones preparados: resolver, reflejar HR, preservar certificacion, mover pago a revision, programar control, confirmar externo.
- Copy honesto cuando gates esten apagados.
- Indicador visible de preview/no write/no sync/no payment.
- Bitacora administrativa en cada accion.

## Mejoras locales documentadas

- Se endurecieron gates para que fixtures sinteticos no cuenten como evidencia real.
- Se endurecieron gates para que outputs derivados de `.tmp` no cuenten como fuente original.
- Se registro no-reversion para Level 0/1.
- Se evito repetir procesos y se alineo checkpoint operativo.
- Se avanzo a contratos accionables sin activar runtime ni writes.

## Academia

Academia debe explicar:

- que es una cola operativa;
- por que no se resuelve automaticamente;
- que son stable keys;
- por que no se deduplica por nombre;
- diferencia entre preparar, preview, escribir, sincronizar y producir;
- diferencia entre pago controlado y pago real;
- preservacion de certificaciones;
- auditoria y razon obligatoria;
- datos sensibles prohibidos.

## Clasificacion

- Reusable CXOrbia: si.
- Exclusivo TyA: parcial, por contexto Cinépolis/GT/HN/junio.
- Claude/prototipo: si, requiere UI futura y copy honesto.
- Academia: si, requiere manuales y rutas de aprendizaje.
- Sin impacto Claude: no.

## Estado seguro

No se tocaron modulos UI ni core. Sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
