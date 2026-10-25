# PAQUETE CLAUDE V2 — ACADEMIA Y ENTREGA

Fecha: 2026-07-17

## 1. Academia acumulada obligatoria

Academia debe sincronizarse con cada módulo modificado en esta candidata.

### Acceso y rutas

- Acceso persistente a Mi ruta, cursos pendientes, manuales, novedades y solicitud de capacitación.
- Rutas por rol y módulo.
- Búsqueda, filtros y glosario clickeable.
- Contenido técnico aislado de audiencias comerciales.

### Administración completa

Controles visibles para crear, editar, enviar a revisión, aprobar, publicar, archivar, restaurar, duplicar, versionar, soft-delete, asociar rol/tenant/proyecto/país/módulo, adjuntar recursos y registrar motivo/auditoría.

### Profundidad

Cada manual o curso tocado explica:

- qué es y para qué sirve;
- valor operativo/comercial;
- rol objetivo;
- ruta y botones;
- datos a ingresar;
- estados y validación esperada;
- errores frecuentes;
- qué hacer si falla;
- checklist y ejemplo práctico.

No aceptar textos superficiales.

### Backfill

Actualizar o verificar contenido de:

- proyecto vs periodo, histórico y KPIs;
- fuente externa y vista previa;
- importadores y revisión humana;
- certificaciones, carryover y excepciones;
- beneficios, liquidaciones, pagos y lotes;
- postulaciones, asignaciones y reprogramación;
- evidencias y cuestionarios;
- comunicaciones y automatizaciones;
- CRM, documentos, Portal Cliente y shopper history;
- readiness comercial;
- novedades de producto.

### Notificaciones Academia

Curso asignado, manual/lección actualizada, nueva versión, revisión pendiente, capacitación solicitada/programada/completada y cambio de flujo operativo.

IA solo prepara borradores; nunca publica sin revisión humana.

## 2. Matriz de cierre final

Claude debe entregar una tabla con:

`Bloque | Estado | Archivos revisados | Archivos modificados | Evidencia breve | Pendiente real`

Filas mínimas:

1. Copy comercial y estados.
2. Contenido técnico y navegación directa.
3. Handoff/documentación.
4. Proyecto/periodo/histórico.
5. CX.data/fuente externa.
6. Readiness.
7. Importadores.
8. Controles administrativos.
9. Certificaciones.
10. Beneficios/pagos/lotes.
11. Postulaciones/asignaciones/reservas/visitas.
12. Comunicaciones/notificaciones/automatizaciones.
13. CRM/documentos/Portal/history.
14. Evidencias/cuestionarios.
15. Login/white-label/responsive.
16. Novedades.
17. Academia acceso.
18. Academia administración.
19. Academia profundidad/backfill.
20. Seguridad/datos sensibles.

Estados permitidos: `PRESERVADO_VERIFICADO`, `CORREGIDO_EN_ESTA_CANDIDATA`, `NO_APLICA_CON_EVIDENCIA`, `BLOQUEADO_FRONTEND_REAL`.

## 3. Entregables exclusivos de Claude

Obligatorios:

1. ZIP completo derivado de `Prototype development request fix.zip`.
2. Identidad interna nueva y consecutiva.
3. Lista exacta de agregados, modificados y eliminados.
4. Matriz completa.
5. `RESUMEN-PARA-CLAUDE.md` actualizado.
6. `PENDIENTES-PROTOTIPO.md` actualizado.
7. Changelog/reporte actualizado.
8. Declaración de no tocar backend/tools/workflows/Firebase/TyA real/integraciones reales.
9. Declaración de no agregar secretos o datos sensibles.
10. Lista de pruebas ejecutadas y no ejecutadas.

Opcionales solo si el entorno lo permite: manifest interno, hash, verificador, smoke y capturas. No fabricar resultados.

La ausencia de estas pruebas no autoriza detener cambios frontend ni entregar un único fix.

## 4. Criterio de aceptación

La candidata queda lista para auditoría solo cuando:

- no se detuvo tras el primer hallazgo;
- toda la matriz fue revisada;
- todas las brechas frontend comprobadas fueron corregidas;
- las brechas backend se señalaron sin simular funcionalidad;
- Academia se actualizó con módulos tocados;
- handoff dejó V82;
- no hay valores internos crudos como fallback visible;
- no se hardcodeó TyA/Cinépolis;
- se entregó ZIP completo y delta exacto.

ChatGPT/Codex ejecutará manifest, hashes, gates, sintaxis, smoke, auditoría y empalme directo.

## 5. Instrucción final

Claude debe continuar ahora módulo por módulo, sin preguntar si debe seguir y sin cerrar después de corregir una sola fuga. Debe completar todo lo frontend y Academia de su alcance, declarar honestamente pruebas no ejecutadas y entregar una candidata acumulada completa.