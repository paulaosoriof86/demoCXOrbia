# REPORTE — V154 (paquete "V153 dos P0 reales restantes", 20260716)

Baseline: `Prototype development request CXOrbia V153.zip`.

## P0-1 — Migración de proyectos segura y repetible
Bug real confirmado: la limpieza legacy no comprobaba tenant (podía borrar un proyecto real de
OTRO tenant solo por llamarse "Proyecto A"), y quedaba desactivada para siempre tras la primera
ejecución (un residuo creado después de la marca de migración sobrevivía). Corregido con dos
mecanismos separados en `core/data.js`:
- **A) Legacy (una vez):** ahora exige `p.tenantId===_TENANT_ID` antes de borrar por nombre
  conocido o metadatos de fixture.
- **B) Repetible (cada carga):** nueva pasada, sin depender de ninguna marca, que solo borra
  registros del tenant ACTUAL con metadatos explícitos de fixture (nunca por nombre) — así un
  fixture nuevo creado después de la migración legacy no sobrevive.

Verificado en runtime: 2 registros sembrados para `otro-tenant-real` (uno llamado "Proyecto A",
otro con `fixture:true`) sobreviven intactos tras recargar la app con la marca de migración ya
presente — ninguno de los dos pertenece al tenant activo de la sesión.

## P0-2 — Gate comercial real y copy transversal
### A. Bug de identificador corregido
Mi reemplazo global de "backend"→"sistema central" en V153 corrompió por accidente el filtro
`c.id!=='a_backend'` a `c.id!=='a_sistema central'` — el curso técnico volvía a ser visible.
Corregido y reverificado: `hasBackendCourseNow: false` para el admin comercial.

### B. `hasTechAccess()` endurecido
`?internal=1` en la URL nunca es una protección real. `CX.session.hasTechAccess()` ahora es una
constante de build — siempre `false` en este build comercial, sin ningún mecanismo de UI/URL/
sessionStorage que lo active. Verificado: `techAccess: false`.

### C. Copy transversal — módulos señalados por el paquete
Reescritos a lenguaje comercial: `core/automations.js` (CANALES, connectionRef, hookStatus),
`core/manuales-data.js` (manuales de rol admin/automatizaciones/integraciones — el manual
`superadmin` se dejó con vocabulario técnico intacto, es su audiencia explícita),
`modules/marketing.js`, `modules/postulaciones.js` (4 toasts), `modules/revision-admin.js`
(3 instancias), `modules/shoppers.js` (nota de datos protegidos + tooltip "Contrato de contexto
único" que aún exponía jerga — ya corregido antes en cliente.js pero faltaba aquí).

## Gate técnico
- Sintaxis: 8 archivos tocados — PASS.
- Runtime: 0 errores. Curso backend oculto, hasTechAccess() false, migración tenant-scoped
  verificada con datos reales de otro tenant preservados.
- Manifest V154 regenerado.
- Conserva Retail/Banca/Restaurantes. No se tocó backend/Firebase/TyA/HR real/R11D/R14C/pagos/
  certificaciones.

## Pendiente explícito
- El "0 coincidencias" absoluto de `modules/importador.js`/`modules/integraciones.js`/
  `modules/hr-source.js` ya recibió una pasada en V152/V153; no se re-auditaron línea por línea
  en esta ronda — se priorizaron los archivos que el paquete señaló como aún con coincidencias
  reales confirmadas.
