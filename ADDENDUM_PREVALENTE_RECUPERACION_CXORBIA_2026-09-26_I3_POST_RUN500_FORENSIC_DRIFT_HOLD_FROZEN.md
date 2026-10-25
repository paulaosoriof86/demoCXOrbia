# ADDENDUM PREVALENTE — I3 POST-RUN500 FORENSIC DRIFT HOLD

**Fecha:** 2026-09-26  
**ID:** `CXORBIA-I3-POST-RUN500-FORENSIC-DRIFT-20260926`  
**Estado:** `FROZEN_PREVALENT_UNTIL_P0_REPROOF`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `recovery/cxorbia-phase-a-20260831`  
**Producción:** `DO_NOT_TOUCH`

## 1. Motivo

Run 500 permanece evidencia histórica válida para el artifact exacto que certificó. Sin embargo, la auditoría forense post-Run500 encontró drift/defectos concretos y reproducibles que su propio mecanismo terminal no podía detectar. Por la cláusula vigente de reapertura ante drift reproducible, el current state deja de ser I3=GO y pasa a **I3=HOLD**. No se abre I5, no se crea otra candidata y no se reaudita desde cero.

## 2. Evidencia viva que sí coincide

La revisión HR viva observada continúa siendo `d9bbb352738196d71602a3adb080e4f8bf37e7211a3bc2ffea13711454c71f95`. Para septiembre 2026, la autoridad HR expone 44 visitas (GT 34 / HN 10), 43 asignadas, 1 disponible, 7 asignadas sin agendar, 26 realizadas, 18 pendientes de realizar, 3 con cuestionario pendiente, 8 con cuestionario completo sin submitir, 15 submitidas, 0 liquidadas y 4 fuera de rango. El Dashboard DEV observado coincide con esos conteos. Por tanto, esta reapertura **no** es una acusación de fallo global de HR/Dashboard.

## 3. P0 nuevos

- **VRM-076 — RELEASE_COMPOSITION_FAILURE:** el finalizador terminal de Module Truth convierte mecánicamente todas las clasificaciones a `MATCH`; el 20/20 terminal no constituye prueba exhaustiva por módulo.
- **VRM-077 — MAPPING_FAILURE:** existe una postulación aprobada visible de Paula Osorio para C. Paseo Cayalá 2026-09-26 como “validando asignación”, mientras la misma revisión HR asigna `SEPTIEMBRE 26!23` a Ariana Martínez. La UI no eleva el conflicto real.
- **VRM-078 — FUNCTIONAL_DEFECT:** el wizard deja seleccionar Google Sheets/Excel pero nunca puede generar `providerBindingId`/`mappingRef`, aunque luego exige ambos para crear el proyecto externo.
- **VRM-079 — PROVIDER_FAILURE:** Documentos ofrece carga binaria, pero el runtime protegido certificado no habilita las dos precondiciones de Storage que `uploadBinary()` exige; Run500 solo probó render de la ruta.
- **VRM-080 — PERSISTENCE_FAILURE:** Configuración sigue guardando usuarios/roles/permisos y otros estados autoritativos en localStorage/memoria mientras declara autoadministración de toda la plataforma.
- **VRM-081 — AUTH_FAILURE:** la reconciliación viva reporta 103 identidades en revisión y 30 migraciones pendientes, incluidas colisiones de login visible; Run500 probó casos representativos, no la población completa.

## 4. Causa raíz sistémica

La causa común ya no es “otra versión vieja” de manera genérica. Es un **desacople entre certificación y capacidad real**:

1. los gates terminales prueban render/semántica agregada y algunos flujos focales;
2. no ejecutan cada capacidad que la UI expone;
3. el finalizador de Module Truth reemplaza la clasificación real por `MATCH`;
4. por eso un artifact puede quedar verde aunque existan rutas visibles sin proveedor durable, conflictos HR no reflejados y población Auth no cerrada.

Esto explica la recurrencia: se corrige un owner, el gate agregado pasa, y la siguiente visualización descubre otra capacidad que nunca fue realmente probada.

## 5. AFTER obligatorio

1. Run500 queda histórico; no autoriza I4 mientras estos P0 estén abiertos.
2. La candidata sigue siendo una sola y acumulativa; no reconstruir módulos.
3. Corregir únicamente owners de VRM-076..VRM-081.
4. Module Truth no puede autoasignar `MATCH`; debe exigir receipt owner-specific.
5. Agregar pruebas de acción real para proyecto externo, recurso binario, configuración durable, conflicto postulación↔HR y universo Auth.
6. Repetir solo gates owners afectados y luego la cadena terminal sobre el mismo artifact.
7. Producción permanece `DO_NOT_TOUCH`.

## 6. Siguiente acción exacta

Ejecutar un único paquete focal I3 sobre la misma línea canónica para VRM-076..VRM-081, con precondition HEAD/tree, readback de cada owner y re-certificación terminal same-artifact. No requiere autorización productiva; **I4 sí seguirá requiriéndola después de recuperar I3=GO**.
