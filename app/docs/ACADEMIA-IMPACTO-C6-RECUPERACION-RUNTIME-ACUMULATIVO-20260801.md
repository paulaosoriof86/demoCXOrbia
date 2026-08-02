# ACADEMIA — IMPACTO C6 RECUPERACIÓN DEL RUNTIME ACUMULATIVO

**Fecha:** 2026-08-02  
**Estado:** DOCUMENTADO · SIN PUBLICACIÓN

## Lección central

Una plataforma acumulativa debe demostrar autenticación, fuente operativa, overlay protegido, identidad exacta y coherencia semántica. Un marcador global correcto no compensa objetos canónicos incorrectos.

## Caso Shopper nueva pestaña — cerrado

Queda como gate permanente de regresión:

- overlay protegido aplicado;
- identidad exacta;
- `ownVisits=1`;
- tres recargas y nueva pestaña estables.

## Caso financiero — causa raíz corregida en fuente

Causa:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

Correctivo:

- registro multi-tenant por llave técnica `tenantId::projectId`;
- resolución por identificadores técnicos, nunca por nombre visible;
- materialización de projectConfig en cada periodo canónico antes de `normalizeAll()`;
- ejecución del orden en script load, actualización HR, autoridad protegida, backend-ready y cambio de proyecto;
- gate predeploy con smoke local read-only.

Resultado source-only:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

El smoke partió de objetos `directo/local/regalía 10` y demostró una salida única `delegado/coordinación/regalía 0` para `period()`, `project()` y Finanzas.

## Contratos que deben enseñarse

1. HR viva gobierna periodos, visitas y estados.
2. Firestore protegido enriquece identidad, perfil y certificación.
3. Auth restaurada no equivale a overlay aplicado.
4. Reload y nueva pestaña son gates distintos.
5. La configuración financiera nace de una llave técnica exacta.
6. El orden correcto es configuración → materialización → normalización → consumo → gate.
7. No se clasifica un proyecto por nombre visible.
8. Un marcador global no sustituye los objetos canónicos.
9. Las regalías solo aplican a facturación local explícita.
10. El honorario Shopper es obligación, no ingreso delegado.
11. Comisión y reparto no se inventan.
12. Dos verdades simultáneas son un bloqueo.
13. Un PASS source-only no equivale a PASS remoto.
14. Un fallo después de deploy exige STOP_RETRY.
15. Producción requiere PASS acumulativo y aprobación humana.

## Impacto en manuales y cursos

Actualizar:

- manual de configuración financiera por proyecto;
- lección de llaves técnicas multi-tenant;
- diagrama de precedencia configuración/materialización/normalización;
- checklist `projectConfig` vs `period()` vs `project()` vs Finanzas;
- caso directo, delegado y regional;
- protocolo de gate source-only y gate remoto;
- caso de error: marcador delegado con objeto directo;
- protocolo STOP_RETRY.

## Estado seguro

Este bloque no ejecutó deploy, Cloud Run, Firestore/Auth/HR/Rules/Storage writes, Make, Gemini, pagos, merge o producción. La publicación de Academia requiere revisión humana posterior.
