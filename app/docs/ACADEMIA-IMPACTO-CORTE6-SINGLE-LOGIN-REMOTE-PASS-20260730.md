# Academia — impacto Corte 6 · acceso aprobado vs gates provider

**Fecha:** 2026-07-30  
**Estado:** `AUTOENTRY_HUMAN_VISUAL_FIX_STATIC_PASS__PENDING_REDEPLOY_VISUAL`

## Corrección de criterio
La validación humana demostró dos veces que Firebase/Auth no debe transformarse en pasos visibles añadidos al prototipo:
1. no debe existir una pantalla previa `Acceso seguro`;
2. tampoco debe agregarse `Usuario + Contraseña` debajo de la selección de perfil cuando ese no es el flujo aprobado del prototipo.

Para el **preview humano DEV**, el flujo esperado es: seleccionar perfil → entrar automáticamente al recorrido de ese rol. La HR source-safe es la fuente visual explícita; Auth/RBAC se comprueba mediante gates técnicos separados.

Esto no significa eliminar autenticación de producción. En operación real, Firebase Auth/claims permanece detrás del contrato de acceso aprobado, con recuperación/cambio de acceso y scopes; provider email, UID, claims y namespaces no son contenido operativo para el usuario final.

## Contenido que Academia debe reflejar
- diferencia entre validación UX DEV y autenticación real de producción;
- acceso por rol sin pasos técnicos inventados;
- recuperación/cambio de acceso cuando aplique en producción;
- tenant/proyecto/rol y shopperId exacto;
- mínimo privilegio y conflictos a revisión humana;
- troubleshooting: distinguir problema de UI, credencial operativa y scope sin exponer provider técnico;
- no pedir al usuario passwords o cuentas técnicas para una prueba visual.

## Patrón reusable
- **Producto/UX:** conserva su contrato visible aprobado.
- **Provider/Auth:** se valida y aplica detrás del adapter/gates.
- **Preview humano:** puede usar fuente source-safe explícita y read-only; nunca debe presentarla falsamente como una sesión provider autenticada.
- **Release:** un PASS técnico no sustituye la validación humana.

## Estado y siguiente actualización
El fix de auto-entry pasó gate estático con baseline `cinepolis`/14 periodos/616 visitas y sin provider write. Falta autorización de un único redeploy DEV, smoke remoto y nueva visual. Solo después se congela Corte6 y Academia registra el flujo final aprobado.
