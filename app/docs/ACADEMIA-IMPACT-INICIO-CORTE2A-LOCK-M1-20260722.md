# ACADEMIA — Impacto inicio Corte 2A y lock M1

Fecha: 2026-07-22

## Contenidos que deben incorporarse

1. **Fuente viva y revisión única**
   - explicar por qué todas las superficies deben consumir el mismo `tenantId`, `projectId`, `periodId` y `sourceRevision`.

2. **Refresco sin recarga**
   - diferenciar actualización in-place de recarga completa y snapshot obsoleto.

3. **Estados ortogonales**
   - asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago no son un único estado textual.

4. **Ausencia vs cero**
   - `null`/pendiente de fuente no significa cero confirmado.

5. **Reasignación segura**
   - conservar, cambiar o dejar pendiente fecha/franja debe ser una decisión explícita y trazable.

6. **Exportación por alcance**
   - filtros, periodo, rol, fuente y revisión deben conservarse en el archivo exportado.

7. **Canary funcional**
   - una asignación y un cuestionario controlados permiten detectar regresiones transversales antes de congelar un corte.

8. **Seguridad fail-closed**
   - un shopper sin identidad verificable no recibe reportes ajenos.

## Clasificación

- Reusable CXOrbia: todos los principios anteriores.
- Exclusivo TyA: ejemplos de variantes HR y conteos de julio como evidencia.
- Claude/prototipo: UX de Visitas y Postulaciones.
- Sin impacto Claude: composición de gates y smoke remoto.
