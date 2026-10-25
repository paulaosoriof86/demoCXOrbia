# ACADEMIA — ADDENDUM C6 DUPLICATE OWNERSHIP

**Fecha:** 2026-08-10

## Aprendizaje reusable

Un conflicto de identidad no siempre puede resolverse con más automatización. Si dos principals tienen el mismo nivel de acceso y la evidencia técnica permitida no aporta una ancla de propiedad única, el resultado correcto es `HUMAN_OWNERSHIP_DECISION_REQUIRED`.

El caso C6 demuestra tres capas distintas:

1. **Acceso efectivo:** determina si un principal puede actuar sobre tenant/proyecto.
2. **Lineage técnica:** determina si un principal pertenece a una materialización/import canónico.
3. **Ownership:** determina cuál identidad debe conservarse cuando existen dos principals históricos equivalentes.

No deben usarse como desempate automático antigüedad, orden de resultados, nombres, coincidencia visual o PII no autorizada.

## Aplicación a manuales y troubleshooting

Academia debe enseñar que un duplicado técnico con ownership no demostrable se envía a revisión humana trazable. La revisión debe concluir antes de cualquier disable/delete/repair y debe quedar separada de los gates de login, claims y scope.

## Estado seguro

Este bloque no cambió cursos, UI, Auth, datos ni producción. Solo documentó el patrón reusable y la clasificación de los cuatro grupos pendientes.
