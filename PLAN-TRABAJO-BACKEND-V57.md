# PLAN-TRABAJO-BACKEND-V57.md

## Contexto

Paula entregó `Prototype development request CXOrbia V57.zip` como prototipo más reciente de Claude. A partir de este punto, el backend debe trabajarse sobre V57 como base visual más reciente, sin perder lo ya construido en Firebase DEV ni la documentación existente.

## Regla de continuidad

1. V57 es la nueva referencia visual/funcional.
2. No usar la rama backend vieja como base visual.
3. No tocar `/app/modules` para resolver backend.
4. Mantener `app/index.html` como prototipo normal.
5. Mantener un preview separado `app/index-backend-dev.html` para backend DEV.
6. Portar solo backend/config/docs al prototipo más reciente.
7. Cada entrega de Claude debe revisarse antes de seguir: estructura, scripts, cambios de `CX.data`, cambios de roles, nuevos localStorage keys y nuevos requisitos backend.

## Fase B1 — Ingesta V57 y control de base

Estado: completada documentalmente.

Hallazgos V57:

- 85 archivos en `/app`.
- `index.html` conserva `<meta charset="UTF-8">`.
- No carga backend todavía, solo core/módulos demo.
- Incluye docs nuevos en `app/docs/`.
- Incluye `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md` con requerimientos backend actualizados.
- Se detectó un posible carácter roto en `app/modules/aprendizaje.js`.

## Fase B2 — Port backend sobre V57 sin romper visual

Estado: siguiente fase activa.

Objetivo:

- Crear rama/paquete V57 + backend DEV controlado.
- Reaplicar archivos backend ya creados sin sobreescribir módulos de V57.
- Mantener `app/index.html` intacto como demo/prototipo normal.
- Mantener `app/index-backend-dev.html` como único preview backend.

Archivos backend a portar/conservar:

- `app/core/backend-config.js`
- `app/core/backend-config-preview-dev.js`
- `app/core/backend-firebase.js`
- `app/core/backend-finance-benefits.js`
- `app/core/backend-cxdata-finance-read.js`
- `app/core/backend-operational-actions.js`
- `app/core/backend-preview-status.js`
- `app/index-backend-dev.html`
- `firebase/schema/**`
- `firebase/contracts/**`
- `firebase/client-write-tools/**`
- `firebase/auth-dev-tools/**`

Gate:

- V57 abre como demo normal desde `app/index.html`.
- Preview backend abre desde `app/index-backend-dev.html`.
- No hay cambios manuales en módulos V57.
- Preview informa con claridad si lee Firestore o localStorage/demo.

## Fase B3 — Preview backend real

Objetivo:

- Auth OK.
- Fuente Firestore.
- Tenant `tya`.
- Rol activo.
- Conteos reales Firestore.
- Sin proyecto `banca` ni conteos demo.

## Fase B4 — Adapter `CX.data` lectura real

Objetivo:

- Respetar la interfaz actual del prototipo V57.
- Conectar lecturas de proyectos, visitas, shoppers, beneficios, finanzas, recursos y configuración.
- No romper módulos.

## Fase B5 — Escrituras y auditoría

Objetivo:

- Persistir postulación, asignación, agenda, cuestionario, pagos, CxC/CxP y estados.
- Registrar auditoría por usuario, rol, tenant, proyecto y acción.

## Fase B6 — Storage, IA y Make

Objetivo:

- Storage para logos, recursos, evidencias y manuales.
- IA multi-proveedor segura por tenant.
- Webhooks Make por automatización.

## Fase B7 — Migración base buena TyA

La base completa TyA se pedirá después de cerrar el gate del preview Firestore TyA visible. No conectar base vieja directamente. No cargar datos finales mientras el preview aún pueda estar leyendo localStorage/demo.
