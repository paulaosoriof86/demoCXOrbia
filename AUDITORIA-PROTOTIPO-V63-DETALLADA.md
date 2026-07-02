# AUDITORIA-PROTOTIPO-V63-DETALLADA

Fecha: 2026-07-01
ZIP auditado: Prototype development request CXOrbia V63.zip
Rama objetivo: release/cxorbia-tya-rc-20260630
Base previa confirmada: V62 en commit a5ce7322116deaaeef2c40f6ec920f460a792244

## Resultado ejecutivo

V63 es aplicable sobre la RC de CXOrbia, pero solo preservando backend protegido y sin activar producción. La auditoría estática del ZIP validó que la entrega no contiene Firebase raíz, no contiene `app/core/backend*.js`, no contiene `app/index-backend-dev.html`, no contiene `firestore.rules`, no contiene `firebase.json` y no contiene `.firebaserc`.

V63 mantiene el enfoque de prototipo y no debe interpretarse como backend real. LocalStorage/mock sigue siendo aceptable para prototipo, pero el preview backend no debe presentarlo como Firestore real.

## Estructura del ZIP

El ZIP contiene 85 archivos bajo `app/`.

Archivos relevantes modificados frente a la comparación disponible:

- `app/app.js`
- `app/core/config.js`
- `app/core/data.js`
- `app/core/liquidacion.js`
- `app/core/router.js`
- `app/docs/CAMBIOS-PROTOTIPO.md`
- `app/index.html`
- `app/modules/academia.js`
- `app/modules/configuracion.js`
- `app/modules/dashboard.js`
- `app/modules/documentos.js`
- `app/styles/layout.css`

Archivo eliminado por V63:

- `app/modules/aprendizaje.js`

## Validaciones realizadas en sandbox

- Descompresión del ZIP: OK.
- Cantidad de archivos detectados: 85.
- `node --check` sobre archivos JavaScript del ZIP: OK.
- Revisión UTF-8/BOM: sin alertas relevantes en la auditoría previa.
- Revisión de presencia de backend protegido dentro del ZIP: no incluido, salvo `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`, que debe protegerse y no sobrescribirse.

## Avances que V63 conserva o mejora

1. `modules/rutas.js` no debe cargarse desde `index.html`, reduciendo riesgo de sobrescribir HR completa.
2. `modules/aprendizaje.js` queda eliminado como archivo huérfano.
3. `academia.js` registra `aprendizaje` dentro del módulo correcto.
4. `liquidacion.js` distingue cuestionario realizado sin submit como `pendiente_submitir`.
5. `router.js` y `config.js` agregan matriz visual de permisos y `roleCanAccess`.
6. Dashboard incluye confirmación antes de eliminar visita.
7. Se refuerzan detalles/drill visuales en dashboard.
8. Configuración avanza en modo demo/cliente y selector de proyecto inicial.

## Pendientes que V63 no cierra

1. Centro de actualizaciones / Novedades / Release Management SaaS multi-tenant: no aparece implementado visualmente.
2. Separación total entre modo demo y modo cliente TyA: sigue requiriendo depuración visual.
3. Evitar que retail, banca o food parezcan operación real de TyA/Cinépolis.
4. HR TyA completa con GT/HN, quincena, franja, sucursal, shopper, estado, disponible desde, fechas, cuestionario, submitido, liquidación, reembolsos y evidencias.
5. Reglas TyA Q1/Q2 representadas visualmente de forma completa.
6. Dashboard/KPIs con drill consistente y sin duplicados o mezclas de moneda/estado.
7. Postulaciones y asignaciones con todas las solicitudes, trazabilidad y sin doble asignación visual.
8. Flujo shopper completo y perfil shopper completo.
9. Beneficios/liquidaciones con separación de honorarios, reembolsos, país, moneda, lote, fecha estimada y pagada.
10. Certificaciones, Academia y Documentos con profundidad operativa.
11. Portal cliente, soporte, reportes, integraciones, automatizaciones, correo y marketing con estados honestos.

## Riesgos para backend

- Si se aplica el ZIP completo sin protección, podría sobrescribir `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`.
- Si se toma localStorage/mock como backend real, se generaría falso avance.
- Si se cambia `app/index.html` sin revisar el punto de conexión, puede romperse el preview backend.
- Si se cargan módulos de prototipo de forma no controlada, puede reintroducirse comportamiento visual no alineado con TyA.

## Recomendación técnica

Aplicar V63 con protección de backend y validación posterior. No hacer deploy, no Hosting, no producción, no datos reales, no Orbit y no Orbia. Después de aplicar V63, ejecutar Sprint 1: gate preview backend V63 con servidor Node local solo si es indispensable para validar navegador.
