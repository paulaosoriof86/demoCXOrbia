# PENDIENTES BACKEND CHATGPT — CXORBIA V66

Fecha: 2026-07-02
Base visual vigente: V66.

## Aclaración de preview

El preview normal usa `app/index.html` y datos mock/localStorage. Por eso aparecen proyectos demo y no necesariamente TyA/Cinépolis real. La vista backend DEV vive en `app/index-backend-dev.html`, que fue preservado durante el overlay V66 y requiere sincronización controlada con los módulos nuevos antes de continuar Sprint 9.

## Pendientes backend

1. Revisar `app/index-backend-dev.html` y sincronizarlo con módulos nuevos V66 sin romper backend.
2. Diagnosticar Sprint 9: no está cerrado y no debe documentarse como completado.
3. Mantener la interfaz `CX.data`, pero conectar adapter Firestore filtrado antes del render por `tenantId`, `projectId`, `periodId`, `country`, `role`, `plan`, `permissions` y `featureFlags`.
4. Verificar tenant DEV `tya` y proyecto `cinepolis-abril-26`: seed, HR, visitas, shoppers, postulaciones, certificaciones, liquidaciones, lotes y reglas.
5. Mantener acciones operativas reales bloqueadas hasta autorización expresa.
6. Diseñar auditoría backend para acciones: usuario, rol, tenant, proyecto, periodo, país, estado anterior, estado nuevo, motivo, autorización, fecha, canal e impacto en shopper score.
7. Modelar autorización fuera de rango con responsable, motivo y efecto de puntaje.
8. Modelar certificación por shopper/proyecto/tenant/vigencia/banco/intentos/prerrequisito.
9. Modelar finanzas: movimientos, CxC, CxP, presupuestos, vencimientos, lotes, liquidaciones, beneficiarios, pagadores, proyecto, país, moneda, conciliación y fuente.
10. Modelar recursos/documentos en Storage con categorías, archivos múltiples, visibilidad por rol, embed/preview, control de lectura y versiones.
11. Modelar notificaciones: Mi Día, campanita, tablón, cuadro grande al ingresar, solicitudes pendientes y recordatorios dirigidos.
12. Separar configuración TyA/Cinépolis como tenant DEV, sin hardcodear la plataforma comercial.

## Pendientes para Claude que no debe resolver backend directamente

Ver `AUDITORIA-VISUAL-PAULA-V66-20260702.md` y `PAQUETE-PARA-CLAUDE-CXORBIA-V66-20260702.md`. Backend no debe rediseñar módulos UI, salvo ajustes controlados para conectar adapter/preview.