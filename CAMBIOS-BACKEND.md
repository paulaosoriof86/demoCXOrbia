# CAMBIOS-BACKEND.md

Registro obligatorio de cambios de backend, infraestructura y migración.

## 2026-06-27 — Configuración inicial Firebase DEV y Hosting DEV

- ARCHIVO: `.firebaserc`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se agregó alias `dev` y `default` apuntando a `cxorbia-backend-dev`. Se agregó target de Hosting `cxorbia-dev` para el sitio `cxorbia-backend-dev`.
- POR QUÉ: Preparar infraestructura DEV nueva y limpia, sin usar la base ni hosting viejo.
- IMPACTO EN FRONTEND: Ninguno. No toca `/app/modules` ni lógica UI.
- PENDIENTE/RIESGO: Producción `tya-plataforma.web.app` se mantiene intacta; no hay deploy autorizado.

- ARCHIVO: `firebase.json`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se configuró Firebase Hosting con `public: app`, rewrite SPA hacia `/index.html`, headers UTF-8 para HTML/JS/CSS/JSON/Webmanifest, y referencias a reglas Firestore/Storage.
- POR QUÉ: El prototipo modular aprobado vive en `/app`; Hosting debe servir esa carpeta sin mover archivos UI.
- IMPACTO EN FRONTEND: Ninguno. Solo define cómo se sirve `/app`.
- PENDIENTE/RIESGO: No ejecutar deploy hasta autorización explícita. Revisar headers en preview antes de producción.

- ARCHIVO: `firestore.rules`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se agregaron reglas base multi-tenant por `tenantId`, `projectId` y rol (`super`, `admin`, `ops`, `shopper`, `cliente` pendiente de ajuste fino). Deny-by-default incluido.
- POR QUÉ: Preparar base Firestore nueva segmentada y segura antes de conectar `CX.data`.
- IMPACTO EN FRONTEND: Ninguno inmediato. Cuando Auth real esté activo, el frontend necesitará claims/perfil consistentes.
- PENDIENTE/RIESGO: Validar reglas con emulador o Rules Playground antes de publicar. Ajustar permisos específicos de cliente/shopper según flujos reales.

- ARCHIVO: `firestore.indexes.json`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se agregó archivo vacío de índices Firestore.
- POR QUÉ: Dejar estructura Firebase CLI completa y controlada desde repo.
- IMPACTO EN FRONTEND: Ninguno.
- PENDIENTE/RIESGO: Agregar índices cuando las consultas reales del adapter los requieran.

- ARCHIVO: `storage.rules`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se agregó placeholder cerrado (`allow read, write: if false`).
- POR QUÉ: Storage está pendiente por Blaze; no se deben permitir evidencias ni archivos hasta definir reglas y migración.
- IMPACTO EN FRONTEND: Ninguno inmediato.
- PENDIENTE/RIESGO: Activar Blaze y diseñar rutas privadas antes de habilitar evidencia.

- ARCHIVO: `CAMBIOS-BACKEND.md`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se creó bitácora obligatoria de cambios backend.
- POR QUÉ: Regla de documentación obligatoria: si no está documentado, no se hizo.
- IMPACTO EN FRONTEND: Ninguno.
- PENDIENTE/RIESGO: Mantenerlo actualizado en cada cambio.

- ARCHIVO: `RESUMEN-PARA-CLAUDE.md`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se agregó resumen ejecutivo para continuidad con Claude.
- POR QUÉ: Facilitar ajustes futuros del frontend sin tocar módulos durante backend.
- IMPACTO EN FRONTEND: Ninguno.
- PENDIENTE/RIESGO: Completar al cierre de cada sesión.

- ARCHIVO: `PENDIENTES-PROTOTIPO.md`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se agregó lista viva de pendientes detectados durante migración.
- POR QUÉ: Registrar lo que requiera ajuste de frontend o validación posterior.
- IMPACTO EN FRONTEND: Ninguno.
- PENDIENTE/RIESGO: Priorizar con Claude antes de modificar UI.

## 2026-06-27 — Aclaración producto CXOrbia vs tenant T&A

- ARCHIVO: `ARQUITECTURA-TENANTS-TYA.md`
- TIPO: nuevo
- QUÉ CAMBIÓ: Se documentó que `demoCXOrbia` es el prototipo/base comercializable de CXOrbia y que T&A Consultores será el primer cliente/tenant real.
- POR QUÉ: Evitar que la migración de T&A contamine el producto genérico. T&A debe entrar como tenant, no como lógica fija.
- IMPACTO EN FRONTEND: Ninguno. No toca `/app/modules` ni core UI.
- PENDIENTE/RIESGO: Al crear el adapter, mantener `tenantId` y `projectId` como configuración/datos, no hardcodeados en módulos.

- ARCHIVO: `RESUMEN-PARA-CLAUDE.md`
- TIPO: modificado
- QUÉ CAMBIÓ: Se agregó sección 1.1 con la decisión producto vs cliente.
- POR QUÉ: Garantizar continuidad: CXOrbia sigue como plataforma comercializable; T&A es primer tenant real.
- IMPACTO EN FRONTEND: Ninguno.
- PENDIENTE/RIESGO: Revisar que futuras mejoras del prototipo no dependan de datos reales de T&A.

- ARCHIVO: `PENDIENTES-PROTOTIPO.md`
- TIPO: modificado
- QUÉ CAMBIÓ: Se reemplazó la duda de repo por una decisión clara: prototipo comercializable en `demoCXOrbia`; T&A como tenant real.
- POR QUÉ: Separar evolución comercial del producto y migración del primer cliente.
- IMPACTO EN FRONTEND: Ninguno.
- PENDIENTE/RIESGO: Definir después repo privado/productivo definitivo para T&A si corresponde.
