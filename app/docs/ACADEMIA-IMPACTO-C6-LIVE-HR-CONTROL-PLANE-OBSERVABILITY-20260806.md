# ACADEMIA — Impacto C6 observabilidad control-plane HR viva

**Fecha:** 2026-08-06

## Contenido que debe incorporarse

1. Diferencia entre workflow iniciado, frontera provider alcanzada y lectura completada.
2. Uso de journals source-safe para integraciones externas.
3. Estados fail-closed antes de cualquier acceso a datos.
4. Separación entre consumo lógico autorizado y cantidad de llamadas técnicas internas.
5. Evidencia sanitizada mediante status y artifact sin PII.
6. Regla: un timestamp volátil no debe alterar la revisión de negocio.
7. Regla: una modificación histórica real sí debe alterar `sourceRevision`.

## Rutas por rol

- **Backend/administración técnica:** interpretar journal, status, run y artifact.
- **Operaciones:** validar que el periodo vivo y el histórico provienen de la misma revisión.
- **Auditoría:** comprobar ausencia de writes y trazabilidad de la frontera provider.
- **Frontend/Claude:** consumir revisión canónica sin exponer detalles internos al usuario final.

## Caso de aprendizaje

El request v2 anterior no produjo evidencia suficiente. La lección no es asumir cero, sino mejorar el contrato para que la siguiente ejecución sea determinística y auditable.

## Sin cambios de curso funcional

No se modifica la lógica de shoppers, visitas, certificaciones, liquidaciones, Finanzas, Portales o Reservas. El impacto es exclusivamente de gobernanza técnica y observabilidad.
