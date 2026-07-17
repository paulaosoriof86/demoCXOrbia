# CXOrbia TyA — Plan de trabajo Phase A con validación visual continua

Fecha original: 2026-07-04  
Última revisión: 2026-07-17, post-empalme V159  
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

Sin validación visual, el estado máximo es:

`TECHNICAL_PASS_PENDING_VISUAL`

No puede declararse `cerrado`, `operativo`, `ACTIVE_BASELINE` ni pasar al siguiente corte.

## 3. Diagnóstico por capa antes de corregir

Ante una diferencia visual:

- datos PASS + pantalla FAIL: revisar runtime, adapter, selector, router o frontend;
- datos FAIL + pantalla FAIL: corregir fuente, mapping o backend;
- contenido PASS + interacción FAIL: corregir flujo/evento/estado del módulo;
- build o fuente no coinciden: invalidar la revisión y publicar el build exacto.

Claude solo recibe una corrección cuando se demuestre que la causa está en frontend y se identifique el archivo o módulo responsable. No se envían paquetes generales ni se repite toda la auditoría.

## 4. Definición de terminado por corte

Un corte solo queda `FROZEN` cuando existen:

1. fuente exacta, periodo, claves y conteos esperados;
2. gate reproducible sobre el mismo snapshot/build;
3. runtime sin fallback demo ni cambio silencioso de fuente;
4. visualización y comportamiento comprobados;
5. aceptación de Paula como `APROBADO`, o P1/P2 documentado que no bloquea;
6. checkpoint, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia y PR actualizados.

Solo un `P0_PROVEN` bloquea la congelación.

## 5. Estado de partida

### Cerrado

- V159 auditada y empalmada.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Manifest, build-lock y verificador V159.
- Gates estructurales iniciales: sintaxis, scripts, módulos, BOM y delta pendiente.
- HR source-safe canonizada con 14 periodos y 616 visitas.
- Adapter portable `CX.data`, materialization plan, Auth/RBAC readiness, importadores, reviewQueue, rollback y contratos de sync preparados.

### No cerrado todavía

V159 permanece en:

`TECHNICAL_PASS_PENDING_VISUAL`

La URL histórica V131/R18D no prueba V159.

## 6. Plan de trabajo vigente

### CORTE 0 — V159 post-empalme

Estado: **ACTIVO AHORA**

Trabajo técnico:

- verificar HEAD, manifest, source lock y build exacto;
- ejecutar gates semánticos del runtime V159;
- ejecutar smoke local/static Admin, Shopper, Cliente y Academia.

Validación visual obligatoria:

- login TyA sin duplicados ni demo engañosa;
- proyecto y periodo separados;
- cambio de periodo que modifique datos, KPIs y filas;
- Dashboard, Proyectos, Periodos, Histórico y Visitas;
- rutas Admin, Shopper, Cliente y Academia;
- copy honesto de integraciones.

Cierre:

- Hosting DEV V159 solo con autorización separada;
- smoke remoto sobre el mismo commit;
- revisión de Paula;
- freeze de V159 como `ACTIVE_BASELINE`.

No se inicia Firebase/backend limpio hasta cerrar este corte.

### CORTE 1 — Contexto, HR e histórico

Objetivo:

Demostrar que la plataforma entiende TyA/Cinépolis y que el selector consulta datos reales distintos.

Módulos:

- Dashboard Operativo;
- Proyectos;
- Periodos;
- Histórico;
- Visitas;
- estado/origen HR.

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

Módulos:

- Visitas Disponibles;
- Postulaciones;
- Reservas/agenda;
- Mi Día;
- Mis Visitas;
- Shoppers;
- Certificación;
- detalle e historial de visita.

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

Módulos:

- Dashboard Financiero;
- Movimientos;
- Liquidaciones;
- Lotes;
- Beneficios del shopper.

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

Prerequisito:

- proyecto Firebase nuevo y vacío verificado;
- no reutilizar Auth/Firestore no vacíos de `cxorbia-backend-dev`;
- sin base vieja.

Trabajo:

- implementar provider Firestore para `loadSnapshot(context)`;
- mantener `mutate(command)` bloqueado;
- conectar `CX.data` en el único punto autorizado;
- impedir fallback demo ante error.

Validación visual:

Repetir Cortes 1, 2 y 3 con señal visible de fuente backend read-only.

No se autorizan materialización ni writes si la lectura visual no coincide con la baseline source-safe.

### CORTE 5 — Materialización controlada DEV

Trabajo:

- regenerar el plan dry-run contra V159 y la fuente vigente;
- confirmar conteos, rutas, lotes, idempotencia y cero datos sensibles;
- materializar solo con autorización expresa;
- aplicar overlays exactos y enviar conflictos a reviewQueue;
- mantener pagos y certificaciones pendientes si la fuente no confirma.

Validación visual:

- muestras GT/HN;
- trazabilidad por tenant, proyecto, periodo, `visitId/hrRowId`, shopper y fuente;
- ausencia de duplicados;
- cero pagos/certificaciones inventados.

### CORTE 6 — Auth, RBAC y alcance por rol

Trabajo:

- identidades opacas de prueba;
- claims por persona + rol + scope + bundles;
- rules deploy bajo autorización separada;
- sin importar Auth legacy.

Perfiles visuales:

- tenant owner/admin;
- coordinador/representante por país;
- operativo;
- finanzas;
- certificación;
- cliente admin/viewer;
- shopper.

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

Llaves obligatorias:

- `tenantId`;
- `projectId`;
- `visitId/hrRowId`;
- `shopperId`;
- `assignmentSource`;
- `assignmentSyncStatus`;
- `lastSyncedAt`.

Make, Storage, Gemini y HR writes se activan únicamente por gates separados.

### CORTE 8 — Ensayo final y producción

Prerequisitos:

- cortes 0–7 congelados;
- rollback probado;
- smoke integral;
- source lock final;
- cero conexión a base vieja;
- autorización expresa de Paula.

Secuencia:

- decisión `GO`, `GO_WITH_WARNINGS`, `HOLD` o `NO_GO`;
- merge/deploy solo con autorización específica;
- smoke de producción;
- monitoreo inicial.

## 7. Cadencia de revisión de Paula

Paula revisa antes de pasar al siguiente corte operativo:

1. V159 post-empalme;
2. contexto/HR/histórico;
3. ciclo shopper;
4. finanzas/certificaciones;
5. backend read-only;
6. materialización DEV;
7. Auth/roles;
8. sync/evidencias;
9. preproducción.

No se solicita revisión después de cada script. Sí se exige revisión antes de avanzar al siguiente corte.

Formato de respuesta:

- `APROBADO`;
- `DIFERENCIA: esperado / observado`;
- `ERROR: acción realizada / resultado`.

Captura solo cuando exista diferencia o error.

## 8. Qué no se reabre desde cero

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
- R11D, R14C, R18A/R18B/R18D;
- manifests y source locks previos.

Se ejecutan, complementan o corrigen focalizadamente contra la baseline vigente.

## 9. Bloqueo externo vivo

La creación automática del proyecto Firebase nuevo y vacío continúa bloqueada por IAM.

`cxorbia-backend-dev` puede usarse para Hosting DEV controlado, pero no como nueva base TyA porque Auth/Firestore no están vacíos.

## 10. Claude/prototipo

- V159 es la candidata empalmada.
- No solicitar V160 por rutina.
- Solo un P0 frontend reproducible justifica corrección inmediata.
- P1/P2 se acumulan por archivo/módulo y no bloquean la baseline.
- Claude no modifica backend, contratos, adapters, tools, Firebase ni proveedores.

## 11. Academia y documentación

Cada corte debe registrar:

- fuente y ambiente;
- rol;
- comportamiento esperado;
- errores y resolución;
- proyecto vs periodo;
- import/materialización;
- certificaciones y pagos;
- sync y rollback;
- estado real de proveedores;
- manuales, checklists, glosario y notificaciones.

## 12. Cierre obligatorio de cada bloque

Informar siempre:

1. corte trabajado;
2. qué se hizo;
3. evidencia técnica;
4. evidencia visual;
5. avance Phase A;
6. qué no se reabrió;
7. Claude/prototipo;
8. Academia;
9. pendiente real;
10. siguiente corte exacto;
11. estado seguro;
12. bloqueo comprobado.

## 13. Estado seguro

Hasta autorización específica:

- sin merge;
- sin producción;
- sin import real;
- sin Firestore/Auth/Storage/HR writes;
- sin Make/Gemini live;
- sin pagos;
- sin base vieja conectada;
- sin datos sensibles crudos en repo.
