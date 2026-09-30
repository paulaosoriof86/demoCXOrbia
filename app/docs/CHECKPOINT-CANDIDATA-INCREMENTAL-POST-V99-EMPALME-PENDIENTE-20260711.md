# Checkpoint candidata incremental post-V99 — empalme pendiente

Fecha: 2026-07-11

## Decisión

La candidata recibida queda aceptada como la versión incremental más reciente para continuar el trabajo. No se considera todavía producción lista ni nuevo source lock remoto.

## Auditoría estructural

- 103 archivos.
- Frente a V99: 12 modificados, 0 agregados, 0 eliminados y 91 idénticos.
- 65 archivos JavaScript validados con 0 errores de sintaxis.
- 65 scripts declarados; 0 faltantes y 0 duplicados.
- 49 módulos con IDs únicos.
- UTF-8 sin BOM.

## Avances que deben preservarse

- Regreso seguro a modo Demo mediante recarga.
- Acción desconocida bloqueada también para super.
- Restauración de cursos a borrador con motivo y validación.
- Soft-delete de lecciones.
- Mejoras de copy honesto en correo, documentos, finanzas, operación y proyectos.
- Retiro de varios inputs sensibles de Integraciones.
- Mejoras de Academia y manuales.
- BUILD_ID actualizado en la candidata.

## Pendientes netos acumulados para Claude

1. Unificar el indicador `CX.dataSource` con `CX_BACKEND_DEV`/`cx_imported` en `core/router.js`.
2. Implementar el bridge funcional que hidrate `CX.data`; el selector actual solo bloquea modos sin fuente.
3. Resolver el modo antes de crear seeds demo.
4. Aislar Certificaciones, Finanzas, Correo, Soporte, dashboards y portales de fixtures demo fuera del modo demo.
5. Eliminar el webhook por automatización y las referencias locales ficticias; solo un `connectionRef` backend puede indicar configuración real.
6. Hacer los permisos por acción tenant-aware y scope-aware, con interfaz real o copy honesto.
7. Completar Academia: auditRef por evento, versión de contenido separada del workflow, gates de crear/editar/revisar/aprobar y restauración de lecciones auditada.
8. Mantener certificaciones heurísticas como borrador/revisión; no afirmar publicación o disponibilidad real.
9. Corregir manuales y Academia que todavía enseñan API keys, webhooks, Firebase o secretos en navegador.
10. Derivar BUILD_ID del source lock en vez de mantenerlo manual.
11. Ejecutar smoke visual independiente después del empalme.

## Backend Phase A siguiente

- Empalme atómico de la candidata sobre la rama, preservando backend/adapters/tools/docs existentes.
- Reconciliación del bridge source-safe con la nueva máquina de fuente.
- Carga de 14 periodos, 616 visitas y 213 referencias shopper protegidas en preview read-only.
- IDs estables por tenant/proyecto/periodo/visita.
- Validación de ausencia de duplicados, PII y mezcla demo.
- Connected/Firestore permanece apagado hasta disponer de una base nueva y vacía.

## Estado de ejecución

El conector no permitió completar de forma atómica el reemplazo de todos los archivos grandes. La rama fue restaurada al head seguro anterior; no quedó un empalme parcial en runtime.

Estado seguro: sin merge, deploy, producción, importación real, writes, Auth, reglas, Make, Gemini ni pagos.
