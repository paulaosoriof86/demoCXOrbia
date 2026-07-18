# CXOrbia TyA — Plan de trabajo Phase A con validación visual continua

Fecha original: 2026-07-04  
Última revisión: 2026-07-18, validación visual V159 NO APROBADA  
Estado: ACTIVO, OBLIGATORIO Y PREVALENTE

## 1. Objetivo operativo

Acondicionar CXOrbia para que TyA pueda operar el primer proyecto configurable, Cinépolis, con:

- HR e histórico completos;
- shoppers y postulaciones;
- certificaciones presentadas;
- visitas, agenda y cuestionarios;
- liquidaciones y pagos controlados;
- multi-tenant y multi-proyecto;
- sincronización HR/plataforma;
- roles, Academia, manuales y notificaciones;
- base nueva y limpia;
- ninguna conexión o copia de la base vieja.

El resultado debe configurarse y verse desde la plataforma. No se considera avance cerrado si solo existe arquitectura, documentación, contrato o script y el resultado todavía no puede comprobarse en pantalla.

## 2. Regla de ejecución por cortes verticales

Cada bloque sigue obligatoriamente esta secuencia:

```text
FUENTE Y REGLA
→ MAPPING / ADAPTER
→ GATE DE DATOS
→ RUNTIME DEL BUILD EXACTO
→ VALIDACIÓN VISUAL
→ CORRECCIÓN FOCALIZADA SI APLICA
→ FREEZE DEL CORTE
```

Sin validación visual, el estado máximo es `TECHNICAL_PASS_PENDING_VISUAL`. No puede declararse `cerrado`, `operativo`, `ACTIVE_BASELINE` ni pasar al siguiente corte.

## 3. Regla reforzada para candidatas críticas antes del empalme

La validación visual V159 demostró un P0 semántico que los gates estructurales no detectaron. Por autorización expresa de Paula, toda candidata futura que toque módulos críticos Phase A debe seguir:

```text
EXECUTION_LANE_READY
→ AUDITORÍA DELTA ESTRUCTURAL
→ COMPOSITE TEMPORAL candidata + backend/overlays vigentes
→ GATES SEMÁNTICOS CON SNAPSHOT REAL/SOURCE-SAFE
→ VISUALIZACIÓN PRE-EMPALME DEL COMPOSITE EXACTO
→ APROBACIÓN/HOLD DE PAULA
→ APPLY_DELTA_DIRECTLY DEL MISMO HASH APROBADO
→ COMMIT/PUSH ATÓMICO
→ GATES POST-EMPALME DE IDENTIDAD
→ FREEZE
```

El composite temporal no crea rama ni PR nuevo, no modifica `main`, no transporta el ZIP archivo por archivo y no traslada acciones técnicas a Paula.

## 4. Diagnóstico por capa antes de corregir

Ante una diferencia visual:

- datos PASS + pantalla FAIL: revisar runtime, adapter, selector, router o frontend;
- datos FAIL + pantalla FAIL: corregir fuente, mapping o backend;
- contenido PASS + interacción FAIL: corregir flujo/evento/estado del módulo;
- build o fuente no coinciden: invalidar la revisión y publicar el build exacto;
- KPI, fases y listados no coinciden: bloquear freeze y localizar derivaciones duplicadas antes de tocar copy o UI.

Claude solo recibe una corrección cuando se demuestre que la causa está en frontend y se identifique el archivo o módulo responsable. No se envían paquetes generales ni se repite toda la auditoría.

## 5. Definición de terminado por corte

Un corte solo queda `FROZEN` cuando existen:

1. fuente exacta, periodo, claves y conteos esperados;
2. gate reproducible sobre el mismo snapshot/build;
3. runtime sin fallback demo ni cambio silencioso de fuente;
4. visualización y comportamiento comprobados;
5. aceptación de Paula como `APROBADO`, o P1/P2 documentado que no bloquea;
6. checkpoint, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia y PR actualizados.

Solo un `P0_PROVEN` bloquea la congelación.

## 6. Estado de partida actualizado

### Cerrado

- V159 auditada y empalmada.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Manifest, build-lock y verificador V159.
- Gates estructurales iniciales: sintaxis, scripts, módulos, BOM y delta pendiente.
- HR source-safe canonizada con 14 periodos y 616 visitas.
- Adapter portable `CX.data`, materialization plan, Auth/RBAC readiness, importadores, reviewQueue, rollback y contratos de sync preparados.
- Hosting DEV y smoke remoto técnico PASS.

### No cerrado

V159 fue `NO APROBADA` visualmente y permanece en `HOLD_VISUAL_SEMANTIC_P0_PROVEN`. No es `ACTIVE_BASELINE`.

## 7. Plan de trabajo vigente

### CORTE 0 — V159 post-empalme

Estado: **NO CERRADO**

La revisión visual demostró:

- estados de cuestionario/submitido inconsistentes en mayo/junio;
- KPI, fases y listados divergentes;
- liquidaciones contaminadas por estado operativo;
- julio sin asignar/disponibles no alineado a TyA;
- Shopper sin visitas elegibles;
- proyecto+periodo fijo en Shopper/Cliente;
- Cliente sin Academia;
- comparativo trimestral sin histórico;
- manuales superficiales.

Fuente: `app/docs/VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`.

### CORTE 0B — Motor canónico de estados + configuración tenant/login

Estado: **ACTIVO AHORA**

Objetivo: corregir la causa raíz antes de repetir visualización.

Trabajo:

1. Verificar mapping HR vigente para mayo/junio/julio.
2. Construir tabla de verdad por visita.
3. Separar estados explícitos: `assignmentState`, `scheduleState`, `executionState`, `questionnaireState`, `submissionState`, `liquidationState`, `paymentState`.
4. Hacer que Dashboard, Visitas, Shopper y Finanzas consuman una única derivación canónica.
5. Eliminar derivaciones duplicadas por `v.estado` en consumidores visuales.
6. Crear gates de reconciliación KPI/fases/listados/Finanzas.
7. Definir contrato de tenant: países, banderas, proyectos activos/inactivos, roles visibles en login, proyecto inicial, scopes por rol y branding.
8. Corregir exposición de proyecto/periodo por rol.
9. Corregir Academia Cliente y formato de manuales mediante tarea frontend focalizada.
10. Desplegar el build corregido en Hosting DEV y repetir la validación visual.

Criterio de cierre:

- mayo/junio/julio coinciden con la HR y la tabla de verdad;
- KPI, fases, listados y liquidaciones coinciden;
- Shopper ve las visitas elegibles;
- proyecto/periodo están separados en todos los roles;
- login muestra solo roles configurados;
- banderas corresponden a países configurados;
- Cliente ve Academia si tiene contenido/permiso;
- manuales se distinguen de cursos.

No se inicia Corte 1 hasta congelar Corte 0B.

### CORTE 1 — Contexto, HR e histórico

Objetivo: demostrar que la plataforma entiende TyA/Cinépolis y que el selector consulta datos reales distintos.

Módulos: Dashboard Operativo, Proyectos, Periodos, Histórico, Visitas y estado/origen HR.

Criterios:

- Cinépolis como proyecto configurable;
- 14 periodos únicos;
- 616 visitas históricas;
- 44 visitas en el periodo activo;
- 34 GT y 10 HN cuando corresponda;
- MAY/JUN/JUL diferentes;
- junio no tratado como visitas pendientes;
- cambio de periodo altera KPIs, filas, detalle y exportación aplicable.

Cierre visual obligatorio antes de avanzar.

### CORTE 2 — Ciclo shopper y operación de campo

Módulos: Visitas Disponibles, Postulaciones, Reservas/agenda, Mi Día, Mis Visitas, Shoppers, Certificación, detalle e historial de visita.

Criterios:

- solo visitas elegibles disponibles;
- postulaciones del periodo activo;
- asignaciones HR/plataforma sin duplicado;
- shopper identificado por llave estable;
- certificación presentada preservada cuando exista fuente;
- conflictos visibles en reviewQueue;
- ninguna identidad completada por nombre o coincidencia visual.

Cierre visual obligatorio antes de avanzar.

### CORTE 3 — Finanzas, liquidaciones y pagos

Módulos: Dashboard Financiero, Movimientos, Liquidaciones, Lotes y Beneficios del shopper.

Criterios:

- honorario, boleto, combo/reembolso, total y moneda separados;
- junio como liquidaciones/pagos pendientes;
- hasta mayo pagado solo donde la fuente lo confirme;
- liquidación no equivale a pago;
- cero pagos, lotes o certificaciones inferidos;
- cambio de periodo altera filas, KPIs y detalle;
- reviewQueue visible ante fuente incompleta.

Cierre visual obligatorio antes de avanzar.

### CORTE 4 — Backend nuevo, limpio y `CX.data` read-only

Prerequisito: proyecto Firebase nuevo y vacío verificado; no reutilizar Auth/Firestore no vacíos de `cxorbia-backend-dev`; sin base vieja.

Trabajo:

- implementar provider Firestore para `loadSnapshot(context)`;
- mantener `mutate(command)` bloqueado;
- conectar `CX.data` en el único punto autorizado;
- impedir fallback demo ante error.

Validación visual: repetir Cortes 1, 2 y 3 con señal visible de fuente backend read-only.

No se autorizan materialización ni writes si la lectura visual no coincide con la baseline source-safe.

### CORTE 5 — Materialización controlada DEV

- regenerar el plan dry-run contra la baseline aprobada y la fuente vigente;
- confirmar conteos, rutas, lotes, idempotencia y cero datos sensibles;
- materializar solo con autorización expresa;
- aplicar overlays exactos y enviar conflictos a reviewQueue;
- mantener pagos y certificaciones pendientes si la fuente no confirma.

Validación visual: muestras GT/HN, trazabilidad por tenant/proyecto/periodo/llaves, ausencia de duplicados y cero pagos/certificaciones inventados.

### CORTE 6 — Auth, RBAC y alcance por rol

- identidades opacas de prueba;
- claims por persona + rol + scope + bundles;
- rules deploy bajo autorización separada;
- sin importar Auth legacy.

Perfiles visuales: tenant owner/admin, coordinador/representante por país, operativo, finanzas, certificación, cliente admin/viewer y shopper.

Validar rutas, acciones, países, proyectos, datos visibles, Academia y notificaciones. Ver una ruta no equivale a tener permiso para ejecutar la acción.

### CORTE 7 — Sincronización HR/plataforma, evidencias y operación completa

Casos mínimos:

- HR → plataforma;
- plataforma → HR;
- visita retirada de disponibles al asignarse;
- no duplicación al reflejarse;
- conflicto enviado a revisión;
- cuestionario configurable;
- reprogramación/cancelación;
- certificación preservada;
- liquidación de junio con estado real;
- evidencia protegida;
- pago nunca confirmado por inferencia.

Llaves obligatorias: `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`.

Make, Storage, Gemini y HR writes se activan únicamente por gates separados.

### CORTE 8 — Ensayo final y producción

Prerequisitos: cortes 0B–7 congelados, rollback probado, smoke integral, source lock final, cero conexión a base vieja y autorización expresa de Paula.

Secuencia: decisión `GO`, `GO_WITH_WARNINGS`, `HOLD` o `NO_GO`; merge/deploy solo con autorización específica; smoke de producción; monitoreo inicial.

## 8. Cadencia de revisión de Paula

Paula revisa antes de pasar al siguiente corte operativo:

1. Corte 0B corregido;
2. contexto/HR/histórico;
3. ciclo shopper;
4. finanzas/certificaciones;
5. backend read-only;
6. materialización DEV;
7. Auth/roles;
8. sync/evidencias;
9. preproducción.

Formato: `APROBADO`, `DIFERENCIA: esperado / observado` o `ERROR: acción realizada / resultado`.

## 9. Qué no se reabre desde cero

- revisión admin funcional;
- submitido HR-driven/configurable;
- wizard Phase A;
- adapter portable `CX.data`;
- domain mapping;
- materialization plan;
- matriz Auth/claims;
- importadores de pagos/certificaciones;
- reviewQueue/conflictos;
- rollback/auditoría;
- HR canonical/source-safe;
- manifests y source locks previos.

Se ejecutan, complementan o corrigen focalizadamente contra la baseline vigente.

## 10. Bloqueo externo vivo

La creación automática del proyecto Firebase nuevo y vacío continúa bloqueada por IAM. `cxorbia-backend-dev` puede usarse para Hosting DEV controlado, pero no como nueva base TyA porque Auth/Firestore no están vacíos.

## 11. Claude/prototipo

- No solicitar nueva candidata por rutina.
- Claude solo recibe tareas frontend localizadas después del contrato backend.
- Claude no modifica backend, contratos, adapters, tools, Firebase ni proveedores.
- No puede recalcular lógica de negocio dentro de módulos UI.

## 12. Academia y documentación

Cada corte debe registrar fuente/ambiente, rol, comportamiento esperado, errores y resolución, proyecto vs periodo, import/materialización, certificaciones/pagos, sync/rollback, estado real de proveedores, manuales, checklists, glosario y notificaciones.

Los manuales deben ser documentos/instructivos CXOrbia profundos; no se aceptan cursos breves presentados como manuales.

## 13. Cierre obligatorio de cada bloque

Informar siempre: corte trabajado, qué se hizo, evidencia técnica, evidencia visual, avance Phase A, qué no se reabrió, Claude/prototipo, Academia, pendiente real, siguiente corte exacto, estado seguro y bloqueo comprobado.

## 14. Estado seguro

Hasta autorización específica: sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos, base vieja conectada ni datos sensibles crudos en repo.
