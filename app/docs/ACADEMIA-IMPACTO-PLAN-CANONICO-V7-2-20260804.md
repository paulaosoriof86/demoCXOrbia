# Academia — Impacto del plan canónico V7.2

**Fecha:** 2026-08-04  
**Estado:** `DOCUMENTED_ONLY__PENDING_ACTIVE_CANONICAL_BASELINE`

## 1. Alcance

El plan canónico no modifica contenido de Academia todavía. Define cuándo y cómo deberá actualizarse para evitar que manuales, cursos y rutas describan builds parciales o candidatas paralelas.

## 2. Regla de sincronización

Academia se actualizará únicamente sobre el mismo HEAD que alcance:

```text
APPLY_DELTA_DIRECTLY
→ GATES FINALES
→ HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ APROBADO
→ ACTIVE_CANONICAL_BASELINE
```

No se crean manuales para V7.1 HOLD ni para V7.2 antes de su auditoría/empalme.

## 3. Contenido que deberá actualizarse al freeze

### Acceso y Login

- Login único del producto;
- selección de perfil;
- países dinámicos;
- comportamiento desktop, tablet y móvil;
- scroll y acceso al registro;
- recuperación de sesión, refresh y nueva pestaña;
- errores frecuentes de acceso.

### Admin/Operaciones

- navegación por módulos canónicos;
- HR e histórico;
- visitas, postulaciones y reservas;
- certificación, revisión y cuestionario;
- Finanzas, Liquidaciones y estados de pago;
- uso del Laboratorio y lectura de evidencia.

### Shopper

- ingreso y perfil;
- visitas activas e históricas;
- postulación, agenda, reprogramación y cancelación;
- certificación y cuestionario;
- beneficios, liquidaciones y pagos;
- solución de errores de sesión y visualización.

## 4. Evidencia obligatoria

Los manuales y cursos deberán usar capturas del `ACTIVE_CANONICAL_BASELINE`, no imágenes de candidatas HOLD o builds previos. Deben incluir desktop, tablet y móvil cuando el flujo cambie por viewport.

## 5. Interactividad y profundidad

Para cada ruta afectada se requieren:

- pasos concretos;
- botones y campos;
- estado esperado;
- checklist de validación;
- errores frecuentes;
- acciones de recuperación;
- diferencia entre preview, ejecución real y dato confirmado;
- notificación de cambio a los roles afectados.

## 6. Pendientes

- separar Manual y Curso;
- actualizar rutas Admin/Operaciones y Shopper;
- incorporar glosario de candidata canónica, gate, Laboratorio, cleanup y freeze;
- notificar el cambio de Login cuando el baseline quede aprobado;
- mantener Portal Cliente en la misma línea canónica, sin material paralelo.

## 7. Estado seguro

- contenido publicado: 0;
- frontend modificado: 0;
- datos o proveedores: 0;
- deploy/producción: 0.
