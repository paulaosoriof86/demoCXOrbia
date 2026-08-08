# ACADEMIA — Impacto C6 Shopper Identity Source/Static HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Academia + Reusable CXOrbia

## Aprendizaje incorporado

La identidad visible del usuario y la identidad técnica del proveedor no deben confundirse. En TyA:

- el Shopper usa `nombre.apellido`;
- la contraseña operativa sigue `Nombre123*`;
- Firebase utiliza un identificador interno namespaced;
- los permisos dependen de claims y `shopperId` exacto;
- el membership no forma parte del contrato de acceso Shopper.

Una misma persona puede tener dos principals independientes —Staff y Shopper— sin que exista duplicidad de identidad, porque cada principal posee namespace, rol y alcance distintos.

## Patrón reutilizable

Antes de reparar identidades masivamente:

1. fijar contrato canónico;
2. censar toda la población;
3. separar activos, históricos, elegibles y holds;
4. detectar colisiones antes del primer write;
5. calcular un plan idempotente y source-safe;
6. ejecutar readback N/N y login real;
7. desplegar solamente después de PASS.

## Control anti-regresión demostrado

El gate detuvo la ejecución porque el manifiesto seguía fijando el blob anterior del auditor. Esta barrera evitó:

- provider reads con fuente no reconciliada;
- Auth writes prematuros;
- cambios de contraseña sin gate;
- deploy sobre una composición contractual inconsistente.

## Estado académico

El contrato y las herramientas source-only quedaron preparados. El censo, repair y deploy no se ejecutaron. La evidencia registra `STOP_RETRY` con cero writes y cero producción.
