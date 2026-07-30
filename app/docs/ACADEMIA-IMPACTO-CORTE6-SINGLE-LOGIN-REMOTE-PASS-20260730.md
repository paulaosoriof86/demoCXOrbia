# Academia — impacto Corte 6 · acceso, source-safe e identidad protegida

**Fecha:** 2026-07-30  
**Estado:** `AUTOENTRY_HUMAN_VISUAL_OBSERVED_PASS__PROTECTED_IDENTITY_READONLY_PASS__AUGUST_NEXT`

## Criterio reusable
La validación humana demostró que Firebase/Auth no debe transformarse en pasos visibles añadidos al prototipo:
1. no debe existir una pantalla previa `Acceso seguro`;
2. tampoco debe agregarse `Usuario + Contraseña` al seleccionar perfil cuando ese no es el flujo aprobado.

Para el preview humano DEV, el flujo correcto es perfil → entrada automática. La evidencia visual actual confirma ese auto-entry.

## Source-safe no equivale a identidad final
La HR source-safe es un artefacto de validación que deliberadamente enmascara PII. Por eso puede mostrar `Shopper protegido` sin que eso implique pérdida de identidad.

La plataforma protegida debe aplicar otra regla: Auth/RBAC/Rules + Firestore protegido. Admin/Operativo recibe la identidad necesaria para operar; shopper únicamente su propia identidad; cliente solo el alcance autorizado.

Nunca se deben publicar nombres reales dentro de un JS source-safe estático para “corregir” una visual de preview.

## Evidencia de identidad protegida
Gate read-only: `PASS_C6_PROTECTED_IDENTITY_READONLY_RUNTIME_READY`.

- shoppers Firestore protegidos340;
- perfiles con nombre real340;
- placeholders0;
- visitas canónicas616;
- visitas con nombre real616;
- placeholders0;
- shopperIds canónicos referenciados194;
- perfiles referenciados existentes194/194 y con nombre real194/194;
- Rules shopper protegidas y deny-by-default PASS;
- adapter de lectura protegido/nombre real PASS;
- Rules desplegadas verificadas/hash PASS;
- source-safe público sigue enmascarado PASS.

GitHub: `PASS_C6_PROTECTED_IDENTITY_READONLY`.

## Patrón de seguridad reusable
- **Source-safe:** minimiza datos para repo, logs, evidencias y previews públicos.
- **Protected runtime:** revela únicamente lo requerido por el rol autenticado.
- **Release gate:** debe comprobar que un Admin autenticado no recibe placeholders cuando existe identidad canónica real, sin exportar esa PII al artefacto de QA.
- **Fail closed:** ausencia/conflicto de identidad debe ir a HOLD/revisión, nunca resolverse por coincidencia visual de nombre.

## Contenido que Academia debe reflejar
- diferencia entre validación UX DEV y autenticación real;
- privacidad por capa: source-safe vs protected runtime;
- acceso por rol sin pasos técnicos inventados;
- recuperación/cambio de acceso;
- tenant/proyecto/rol y shopperId exacto;
- mínimo privilegio y conflictos a revisión humana;
- troubleshooting separando UI, fuente, identidad, credencial y scope;
- gates que validan identidad real por conteos/contratos sin exponer valores sensibles.

## Siguiente actualización
El siguiente bloque operativo es refresh HR read-only de agosto y resolución del HOLD HN. Después de un delta write autorizado/readback, la preproducción autenticada deberá validar visualmente identidad real antes del cutover.