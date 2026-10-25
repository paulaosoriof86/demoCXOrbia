# AVANCE BACKEND MIENTRAS CLAUDE TRABAJA — CXORBIA V66

Fecha: 2026-07-02
Rama: `release/cxorbia-tya-rc-20260630`
Base visual vigente: V66
Restricciones respetadas: sin deploy, sin Hosting, sin producción, sin modificar backend protegido.

## Objetivo de este avance

Aprovechar el tiempo mientras Claude prepara el siguiente prototipo, sin tocar módulos visuales ni romper backend. El trabajo se limita a auditoría técnica, documentación de integración y preparación de próximos pasos backend.

## Hallazgos confirmados

### 1. Preview normal sigue siendo demo/localStorage

`app/index.html` carga `core/data.js`, `core/hr.js`, `core/automations.js` y demás core visual, pero no carga Firebase ni backend DEV. Por eso el preview normal muestra proyectos demo y no necesariamente TyA/Cinépolis real.

### 2. Configuración backend DEV existe, pero el adapter está desactivado

`app/core/backend-config.js` define Firebase DEV `cxorbia-backend-dev`, tenant inicial `tya` y colecciones esperadas. También deja `enabled:false`, por lo que no debe asumirse que la UI normal está leyendo Firestore.

### 3. Vista backend DEV debe sincronizarse con V66 antes de Sprint 9

`app/index-backend-dev.html` conserva Firebase SDK y archivos `backend-*`, pero al haber preservado backend durante el overlay V66, es necesario auditar si ya carga todos los módulos nuevos de V66, especialmente `periodos`, `historico`, `novedades` y `cliente-insights`. Esta sincronización toca un archivo protegido, por lo que debe hacerse solo con autorización explícita y script reversible.

### 4. Puente UI/backend sigue seguro

`backend-ui-action-bridge.js` mantiene `uiConnected:false` y `mutatesByDefault:false`. Las acciones solo se habilitan con flag DEV y token, por lo que no hay botones reales conectados desde UI.

### 5. Acciones operativas actuales son insuficientes para hallazgos V66

`backend-operational-actions.js` soporta solicitudes auditables para asignar visita, reprogramar, marcar visita realizada, marcar cuestionario, marcar submitido/validado y cambiar estado de postulación. Sin embargo, V66 requiere modelar nuevas acciones backend:

- autorizar visita fuera de rango;
- registrar motivo y responsable;
- afectar o no puntaje del shopper según responsabilidad;
- notificar por Mi Día/campanita/tablón;
- mover liquidación a lote;
- registrar pago de lote por beneficiario;
- crear/editar CxC/CxP con proyecto, pagador, beneficiario, vencimiento y fuente;
- registrar certificación por shopper/proyecto/vigencia;
- registrar lectura de recursos/manuales;
- auditar importaciones inteligentes;
- registrar documentos en Storage con visibilidad por rol.

## Backend que se puede avanzar sin esperar a Claude

1. Diseñar modelo de datos Firestore multi-tenant/multi-proyecto.
2. Definir scopes obligatorios: `tenantId`, `projectId`, `periodId`, `country`, `role`, `plan`, `permissions`, `featureFlags`.
3. Preparar auditoría de acciones con `actorId`, `actorRole`, `tenantId`, `projectId`, `periodId`, `country`, `entityType`, `entityId`, `before`, `after`, `reason`, `authorizedBy`, `responsibility`, `scoreImpact`, `createdAt`.
4. Preparar estructura de certificaciones por shopper/proyecto/vigencia.
5. Preparar estructura de finanzas: movimientos, CxC, CxP, presupuestos, vencimientos, lotes, liquidaciones, pagador, beneficiario, fuente y conciliación.
6. Preparar estructura de recursos/documentos en Storage con categoría, visibilidad, embed/preview, lectura y versiones.
7. Preparar notificaciones persistentes para Mi Día, campanita, tablón y cuadro grande al ingresar.
8. Validar tenant DEV `tya` y proyecto `cinepolis-abril-26` con script local seguro antes de afirmar que la HR histórica está conectada.

## Lo que NO se debe avanzar hasta recibir nuevo prototipo de Claude

- Cambios visuales en módulos.
- Reparar botones UI desde backend.
- Rediseñar manuales, cursos, reportes, CRM, marketing, finanzas visual o portal cliente.
- Conectar acciones reales a botones.
- Cambiar `app/index-backend-dev.html` sin autorización explícita, porque es archivo protegido.

## Próxima acción recomendada

Preparar y ejecutar un script local de auditoría backend DEV que no escriba nada, genere reporte, copie a portapapeles y confirme:

1. repo/rama/HEAD correctos;
2. que no hay cambios locales pendientes;
3. si `index-backend-dev.html` está desfasado frente a V66;
4. si Firebase config apunta a `cxorbia-backend-dev`;
5. si hay credencial local disponible;
6. si tenant `tya` y proyecto `cinepolis-abril-26` existen en Firestore DEV;
7. qué colecciones tienen documentos;
8. si hay HR/visitas/shoppers/liquidaciones/certificaciones/lotes;
9. sin hacer writes, deploy ni Hosting.

## Estado

Backend no se modificó en este avance. Queda listo el diagnóstico para continuar con script seguro o para aplicar sincronización controlada cuando Paula autorice.