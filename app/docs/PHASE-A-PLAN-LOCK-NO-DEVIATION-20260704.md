# Phase A plan lock no deviation

Fecha original: 2026-07-04  
Última revisión: 2026-07-17, después del empalme V159  
Estado: ACTIVO Y OBLIGATORIO

## 1. Decisión de revisión

El plan **no se reinicia ni se reemplaza por otra arquitectura**. El eje Phase A sigue siendo correcto.

Sí se ajusta la secuencia porque el documento anterior todavía trataba V79 y varias tareas preparatorias como pendientes desde cero. Después de V159, esas piezas deben clasificarse como cerradas, preparadas o pendientes de activación, no reconstruirse.

El objetivo rector permanece:

> Que Paula pueda ver y operar TyA con información real/source-safe, HR e histórico, shoppers, postulaciones, certificaciones presentadas, visitas, cuestionarios, liquidaciones/pagos y sincronización controlada, dentro de una base nueva y limpia y sin promesas falsas de integración.

## 2. Estado actual comprobado

### Cerrado

- V159 auditada, empalmada y con commit verificable.
- Manifest, build-lock y verificador V159 generados.
- Gates estructurales iniciales: sintaxis, scripts, módulos, BOM y delta pendiente.
- HR source-safe canonizada: 14 periodos y 616 visitas.
- Separación proyecto/periodo y gate histórico/KPI preparados.
- Importadores source-safe de pagos y certificaciones preparados.
- Materialización completa dry-run preparada: 1,421 operaciones en 4 lotes, sin escrituras.
- Adapter `CX.data` provider-neutral preparado con writes en HOLD.
- Matriz Auth/RBAC y scopes preparada.
- ReviewQueue, rollback, auditoría y conflictos preparados.
- Hosting DEV histórico V131/R18D validado, pero no representa V159.

### Preparado, no activado

- proveedor Firestore para `CX.data`;
- materialización en base nueva;
- Auth y protected reads;
- rules deploy;
- writes controlados;
- sync HR/plataforma;
- Make, Gemini y Storage;
- producción.

### Bloqueo externo vivo

La creación automática de un Firebase nuevo y vacío fue rechazada por IAM. `cxorbia-backend-dev` puede seguir usándose como Hosting DEV controlado, pero **no debe convertirse en la base de datos nueva de TyA** porque su Auth/Firestore no están vacíos.

## 3. Trabajo que no se reabre desde cero

No reconstruir:

- revisión admin funcional;
- submitido HR-driven/configurable;
- wizard Phase A;
- matriz Auth/claims;
- contratos y validadores de import/sync;
- adapter portable `CX.data`;
- domain mapping;
- reviewQueue/conflictos;
- rollback/auditoría;
- HR canonical/source-safe;
- R11D, R14C, R18A/R18B/R18D;
- materialization plan;
- manifest y source locks previos.

Solo se complementan o ejecutan contra V159 cuando corresponda.

## 4. Plan vigente ajustado

### Bloque A1 — Cierre post-empalme V159

Estado: **ACTIVO AHORA**

1. Verificar el HEAD exacto V159 y su source lock.
2. Ejecutar gates semánticos sobre el build empalmado:
   - proyecto y periodo independientes;
   - histórico diferenciado;
   - 14 periodos;
   - 616 visitas;
   - 44 visitas en el periodo activo;
   - MAY/JUN/JUL diferentes;
   - junio ejecutado y liquidaciones/pagos pendientes;
   - GT/HN, país y moneda;
   - shoppers históricos y reviewQueue;
   - certificaciones presentadas/pending source;
   - finanzas sin pagos inventados;
   - rutas Admin, Shopper, Cliente y Academia.
3. Ejecutar smoke local/static del build V159 exacto.
4. No usar la URL DEV de V131/R18D como prueba visual de V159.
5. Si los gates técnicos pasan, solicitar autorización separada para publicar **solo Hosting DEV V159**, sin rules, Auth, Firestore, Storage, imports ni producción.
6. Ejecutar smoke remoto del build exacto.
7. Solicitar validación visual de Paula.
8. Con PASS visual, congelar V159 como `ACTIVE_BASELINE`.

Solo un `P0_PROVEN` detiene la congelación. P1/P2 se documentan.

### Bloque A2 — Resolución de backend limpio

Estado: **PENDIENTE DESPUÉS DE BASELINE V159**

1. Resolver IAM o crear mediante identidad administradora un proyecto Firebase nuevo y vacío.
2. No reutilizar la base vieja ni el Firestore/Auth no vacío de `cxorbia-backend-dev`.
3. Verificar read-only que Auth, Firestore, Storage y Functions de negocio están vacíos/inactivos.
4. Registrar target, rollback y estado seguro.

No se cambia a Supabase ni se reinventa el stack salvo decisión expresa y evidencia de bloqueo definitivo de Firebase.

### Bloque A3 — Conexión `CX.data` read-only

Estado: **PREPARADO, PENDIENTE DE TARGET LIMPIO**

1. Implementar únicamente el provider Firestore requerido por el adapter portable:
   - `loadSnapshot(context)`;
   - `mutate(command)` permanece bloqueado.
2. Conectar `CX.data` en el único punto autorizado.
3. Hidratar snapshot source-safe por `tenantId`, `projectId`, periodo y país.
4. Validar que un fallo de proveedor no cae a datos demo.
5. Ejecutar smoke Admin/Shopper/Cliente con lecturas controladas.

### Bloque A4 — Materialización controlada DEV

Estado: **PLAN DRY-RUN LISTO; WRITES EN HOLD**

1. Regenerar el plan completo contra la baseline V159 y la fuente vigente, sin rehacer arquitectura.
2. Confirmar conteos, rutas, lotes y cero datos sensibles.
3. Mantener pagos y certificaciones en estados pendientes cuando la fuente no los confirme.
4. Aplicar overlays exactos y enviar conflictos a reviewQueue.
5. Ejecutar materialización solo con autorización explícita para Firestore DEV writes.
6. Verificar idempotencia, auditoría y rollback.

### Bloque A5 — Auth, RBAC y lecturas protegidas

Estado: **READINESS LISTO; ACTIVACIÓN EN HOLD**

1. Crear identidades opacas de prueba, sin importar Auth legacy.
2. Aplicar claims por persona + rol + scope + bundles.
3. Desplegar rules solo con autorización separada.
4. Validar:
   - tenant owner;
   - país/coordinador;
   - operativo;
   - finanzas;
   - certificación;
   - cliente admin/viewer;
   - shopper propio.
5. Confirmar navegación y acciones, no solo visibilidad de rutas.

### Bloque A6 — Histórico financiero y certificaciones

Estado: **IMPORTADORES LISTOS; FUENTES/WRITES EN HOLD**

1. Revalidar el control financiero vigente sin inferir pagos.
2. Mantener hasta mayo como pagado solo donde la fuente documentada lo confirme.
3. Tratar junio como liquidaciones/pagos pendientes y control administrativo.
4. Preservar certificaciones ya presentadas mediante IDs estables.
5. Ejecutar dry-run, revisión humana y luego import controlado con autorización.
6. No pagar automáticamente ni habilitar visitas por certificaciones no confirmadas.

### Bloque A7 — Sincronización HR/plataforma y evidencias

Estado: **CONTRATOS LISTOS; INTEGRACIONES LIVE EN HOLD**

1. Validar dry-run de ambos sentidos con:
   - `tenantId`;
   - `projectId`;
   - `visitId/hrRowId`;
   - `shopperId`;
   - `assignmentSource`;
   - `assignmentSyncStatus`;
   - `lastSyncedAt`.
2. No deduplicar por nombre.
3. Activar primero outbox/revisión, después Make con autorización expresa.
4. Mantener HR writes desactivados hasta smoke y rollback aprobados.
5. Activar Storage/evidencias solo cuando el gate y el plan de datos sensibles estén cerrados.
6. Gemini queda después del flujo operativo real y siempre con revisión humana.

### Bloque A8 — GO/NO GO y producción controlada

Estado: **HOLD**

Requiere:

- V159 `ACTIVE_BASELINE`;
- backend limpio verificado;
- datos reales/source-safe materializados y auditados;
- Auth/RBAC/rules PASS;
- histórico, shoppers, certificaciones y finanzas PASS;
- sync y evidencias con gates;
- smoke integral por rol;
- rollback probado;
- autorización expresa de Paula para producción;
- ninguna conexión a la base vieja.

Después:

1. decidir `GO`, `GO_WITH_WARNINGS`, `HOLD` o `NO_GO`;
2. congelar source lock;
3. merge/deploy únicamente con autorización específica;
4. ejecutar smoke de producción y monitoreo inicial.

## 5. Prioridad real

El orden no cambia por cantidad de documentación existente:

1. cerrar V159 visual y técnicamente;
2. obtener backend nuevo y limpio;
3. conectar lectura real mediante `CX.data`;
4. materializar Phase A en DEV;
5. proteger acceso con Auth/RBAC;
6. completar finanzas/certificaciones;
7. activar sync/evidencias;
8. producción controlada.

No se construye más infraestructura abstracta si no acerca uno de estos ocho resultados.

## 6. Claude/prototipo

- V159 es la candidata empalmada; no solicitar V160 por rutina.
- Solo un P0 reproducible de la validación post-empalme justifica corrección inmediata.
- P1/P2 se acumulan por archivo/módulo y no bloquean la baseline.
- Mantener copy honesto para Firestore, Auth, Storage, Make, Gemini, HR sync, pagos e imports.
- No hardcodear Cinépolis como default.

## 7. Academia

Cada bloque debe reflejarse en:

- rutas y permisos por rol;
- proyecto vs periodo;
- fuente source-safe vs runtime real;
- revisión humana y conflictos;
- import/dry-run/materialización;
- certificaciones y pagos;
- sync y rollback;
- estados de integraciones;
- manuales, checklists, glosario y notificaciones.

## 8. Estado seguro

Hasta autorización específica:

- sin merge;
- sin producción;
- sin Firestore/Auth/Storage/HR writes;
- sin import real;
- sin Make/Gemini live;
- sin pagos;
- sin base vieja conectada;
- sin datos sensibles crudos en repo.
