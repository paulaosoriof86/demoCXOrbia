# DECISION-DOBLE-DOCUMENTACION-TYA-CXORBIA-20260629

## Decisión

A partir de este punto, todo hallazgo, cambio, validación o pendiente se documenta en dos capas cuando aplique:

1. TyA específico.
2. CXOrbia generalizable.

## Clasificación obligatoria

Cada elemento documentado debe clasificarse como:

- `TyA específico`: aplica solo a T&A por su operación, HR, conteos, periodos, datos, reglas internas, restricciones o migración propia.
- `CXOrbia generalizable`: patrón reutilizable para otros clientes/tenants de CXOrbia.
- `Ambos`: nace en TyA, pero se convierte en patrón reutilizable para otros clientes.

## Regla práctica

No se deben generalizar particularidades privadas de TyA. Solo se convierten en CXOrbia generalizable los patrones que puedan repetirse con otros clientes, por ejemplo:

- fuentes externas vivas o históricas;
- periodos seleccionables;
- creación automática de evaluadores desde fuente externa;
- creación desde plataforma, postulación o registro directo;
- deduplicación;
- conflictos de sincronización;
- preview o dry-run antes de escribir;
- configuración desde UI administrativa;
- multi-tenant;
- Storage/evidencias;
- Auth/roles;
- sincronización bidireccional.

## Aplicación inmediata

El histórico HR GT/HN V4 se documenta como `Ambos`:

- TyA específico: fuente HR real GT/HN, tenant `tya`, periodos de T&A, conteos y reglas operativas propias.
- CXOrbia generalizable: patrón de fuente externa viva + migración histórica inicial + sincronización incremental + validación por IDs + deduplicación/conflictos.

## Restricciones conservadas

- No se hizo Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.
