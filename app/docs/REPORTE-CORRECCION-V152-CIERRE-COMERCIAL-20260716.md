# REPORTE — V152 (paquete "V151 Cierre Comercial · 2 P0", 20260716)

Baseline: `Prototype development request CXOrbia V151.zip`.

## Corrección crítica encontrada durante el gate propio

El login demo "admin" asigna internamente `user.role='super'` (para tener acceso pleno a datos
protegidos — `canSeeProtectedData()`), así que gatear Diagnóstico/SaaS/curso técnico por
`effectiveRole()==='super'` (mi solución en V150/V151) **no ocultaba nada** del admin comercial
normal — el mismo rol interno que ya usa el botón "Entrar como admin". Corregido con un flag
nuevo y desacoplado: `CX.session.hasTechAccess()` (`core/store.js`), que exige además una marca
de sesión (`sessionStorage.cx_tech_access`) activable únicamente vía parámetro de URL no
comercial (`?internal=1`) — nunca un botón de la interfaz. Verificado en runtime: admin normal
→ Diagnóstico/SaaS/curso backend bloqueados; con el flag de sesión activo → accesibles. 0 errores.

## P0-1 — Estado demo limpio sin residuos de prueba
- `core/data.js`: segunda migración idempotente `cx_projects_migration_v151_commercial_cleanup_1`
  — purga por nombre conocido ("proyecto a"/"proyecto b"/"test dedupe unico", normalizado) y por
  metadatos de fixture (`testFixture`/`fixture`/`createdByTest`), sin tocar proyectos reales.
- Limpieza inmediata del residuo real detectado en la vista previa compartida (mis propias
  pruebas anteriores dejaron "Proyecto A"/"Test Dedupe Unico" en `cx_custom_projects" —
  eliminados de la sesión activa).
- `app.js`: `CX.session.user.name` para roles de prueba (ops/coordinador/aliado) ya no lleva el
  sufijo "(prueba)" — ahora "Equipo Operativo", etc.

## P0-2 — Lenguaje comercial para TODOS los roles (incluye admin)
- **Diagnóstico & Readiness, Consola SaaS y el curso "Backend técnico"** ahora requieren
  `hasTechAccess()` real (ver arriba) — invisibles para el admin comercial estándar, sin entrada
  de navegación, solo alcanzables por una ruta no comercial explícita.
- Reescrito a lenguaje comercial (sin "backend"/"reviewQueue"/"pendiente backend" crudos) en:
  `importador.js` (badges de proceso + toasts), `hr-source.js` (estado "Pendiente backend" →
  "Pendiente de conexión"), `finanzas.js` (toast de liquidaciones), `cert.js` (toast de
  re-certificación), `saas-console.js` (texto general — su contenido interno ahora vive detrás
  de `hasTechAccess()` de todas formas), `integraciones.js` (badges de fuente, toasts de
  solicitud/preferencia, texto de credenciales), `automatizaciones.js` (outbox, gate de Make/IA),
  `configuracion.js` (invitaciones), `correo.js` (conexión de bandeja).
- Se preserva la honestidad de estado (nunca se declara "conectado/enviado" sin gate real) —
  solo se cambió el vocabulario técnico por equivalentes funcionales ("pendiente de conexión",
  "pendiente de activación", "vista previa").

## Gate técnico
- Sintaxis: 11 archivos tocados — PASS.
- Runtime: 0 errores. Verificado en vivo: catálogo de proyectos sin residuos, admin comercial
  sin acceso a Diagnóstico/SaaS/curso backend, acceso real solo con `hasTechAccess()`.
- Manifest V152 regenerado.
- No se tocó: Firebase, HR real, adapters, R11D/R14C, pagos, certificaciones, backend.
- No se agregó TyA/Cinépolis ni lógica de tenant real — se mantienen los 3 proyectos demo
  curados (Retail/Banca/Restaurantes).

## Pendiente explícito
- El gate de "recarga dura real del navegador" con 5 copias de residuos sembradas sigue sin ser
  reproducible end-to-end en este entorno de vista previa (mismo caveat de V150) — la migración
  se verificó unitariamente y la limpieza de la sesión activa se confirmó en vivo.
