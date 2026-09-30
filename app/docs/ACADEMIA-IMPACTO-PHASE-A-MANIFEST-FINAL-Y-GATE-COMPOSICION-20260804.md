# ACADEMIA — IMPACTO DEL MANIFEST FINAL Y GATE DE COMPOSICIÓN PHASE A

**Fecha:** 2026-08-04  
**Estado:** `DOCUMENTED_PENDING_EXECUTED_GATE`

## 1. Aprendizajes reutilizables

Este bloque debe incorporarse a Academia después del PASS ejecutado porque demuestra:

- diferencia entre presencia física, linaje aprobado y composición efectiva;
- recuperación por Git blob y source lock;
- preservación de módulos aprobados sin restauraciones ciegas;
- carga por capas: fuente, composer, permisos, módulos y overlays;
- separación entre warnings P1/P2 y P0 reales;
- reportes multiformato sobre las mismas filas y alcance;
- control de scripts superseded sin eliminarlos sin prueba;
- navegación y permisos fail-closed por rol/persona/scope;
- imposibilidad de afirmar PASS sin ejecutar el gate sobre el HEAD exacto.

## 2. Rutas por rol impactadas

### Administración/Coordinación

- Dashboard;
- Mi Día;
- Histórico;
- Visitas, Ficha y Revisión;
- Postulaciones;
- Reservas;
- Shoppers;
- Finanzas;
- Reportes.

### Shopper/Evaluador

- Mi Día;
- Perfil;
- Disponibles;
- Reservas;
- Mis Visitas;
- Cuestionario;
- Certificación;
- Documentos;
- Beneficios;
- Mis Reportes.

### Cliente

- Panorama;
- Sucursales;
- Planes de acción;
- Capacitación;
- Reportes;
- Mi Programa;
- Novedades.

## 3. Manuales y cursos

Los manuales deben explicar:

1. qué es una autoridad histórica;
2. qué prueba un SHA/blob;
3. por qué un módulo presente no se considera aprobado automáticamente;
4. cómo un overlay puede alterar una fachada sin cambiar el módulo base;
5. cómo verificar sourceRevision, periodo y scope transversal;
6. qué significa fail-closed en Auth, Reservas, Documentos y pagos;
7. por qué PDF/XLSX pueden tener deuda visual sin invalidar la verdad de los datos;
8. por qué no se restaura una versión anterior completa cuando existen root fixes posteriores.

## 4. Estado de integración Academia

- cambios en `app/modules/academia.js`: 0;
- cursos publicados: 0;
- manuales actualizados: 0;
- Gemini: 0;
- revisión humana: pendiente después del gate ejecutado y del freeze.

## 5. Siguiente actualización Academia

Después de:

`PASS_SOURCE_STATIC → PASS_RUNTIME_MULTIROL → CHECKPOINT_VISUAL_PHASE_A_COMPLETA`

actualizar:

- curso de arquitectura y fuentes;
- manual de roles y scopes;
- manual de reportes/exportaciones;
- manual de estados operativos/financieros;
- historial de decisiones y anti-regresión.
