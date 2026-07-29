# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__CANONICAL_BACKEND_INVENTORY_PASS__INCREMENTAL_PHASEA_GAP_PASS__ANOMALY_PROBE_ACTIVE`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

La “base vieja” que no se conecta/copia es la **plataforma legacy TyA Consultores actualmente operativa y destinada a retiro**. `cxorbia-backend-dev` es el backend DEV canónico de CXOrbia trabajado desde junio y debe reutilizarse.

## 2. Secuencia por corte
`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

## 3. Carril de candidatas
`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No nueva rama/PR, PowerShell, incoming, nueva candidata ni tareas manuales de Paula por rutina.

## 4. Arquitectura — lock corregido

### Legacy TyA Consultores
Sistema actual a retirar. Solo origen de datos útiles/limpios; no código, parches, fixes, dashboard ni arquitectura.

### `cxorbia-backend-dev`
Backend DEV canónico de CXOrbia; TyA es primer tenant. Reutilizar lo ya materializado.

### `cxorbia-tya-dev-260729-c4`
Sandbox técnico Corte 4. Preservar aprendizajes, no usar como destino de datos.

### Hosting público TyA
Conservar URL pública actual; cutover final reemplaza la app legacy por CXOrbia con smoke/rollback/autorización.

## 5. Cortes cerrados

### M1 / Corte 1 / Corte 2A
`FROZEN/APROBADO`.

### Corte 3 — Finanzas e histórico de pagos
`FROZEN_ACTIVE_BASELINE`.

- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- Source lock: 14 periodos, junio 2025–julio 2026, 44 visitas por periodo = 616.
- R26–R32: 135/135 PASS.
- HR remota, Hosting DEV y smoke pagos: PASS.
- Mayo: 44 pagadas / 0 pendientes / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy permanecen backlog.

## 6. Corte 4 — `CX.data` read-only / recuperación del backend canónico

### 6.1 Sandbox técnico — aprendizaje cerrado
En `cxorbia-tya-dev-260729-c4` se probaron/corrigieron:
- fail-closed sin demo/localStorage;
- backend vacío first-class;
- null-safety proyecto/período;
- role-switch sin DOM residual;
- asset-integrity/anti-dangling-script;
- remoto 0 pageerrors;
- visual humana Admin/Shopper vacío correcta.

El sandbox no se promueve a destino.

### 6.2 Inventario read-only canónico — PASS
`cxorbia-backend-dev` contiene:
- Auth users=17 con claims tenant/proyecto/rol/shopper;
- 83 rutas Firestore completas/no truncadas;
- 3 clients;
- 29 projects;
- 619 visits;
- 557 questionnaires;
- 215 shoppers;
- 255 liquidations;
- 3 postulations;
- 1 application;
- 20 notifications;
- 572 shopperBenefits;
- 0 certifications localizadas;
- 0 shoppers con certificaciones embebidas detectables por campos.

Provider writes=0; no PII exportada.

### 6.3 Reconciliación contra source lock — PASS incremental
Decisión: `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`.

- Esperados: 28 proyectos país/periodo y 616 visitas.
- Encontrados: 26 proyectos canónicos.
- Faltan `cinepolis-julio-26` y `cinepolis-julio-26-hn`: 44 visitas.
- Encontradas en proyectos canónicos: 574; esperado para esos 26: 572.
- Excesos: `cinepolis-abril-26` +1 y `cinepolis-junio-26-hn` +1.
- Pilotos/no canónicos: `julio-pilot`, `r1`, `tya-piloto` con 45 visitas en total; no borrar por inferencia.
- Al resolver los 2 excesos y agregar julio 2026, el histórico canónico queda en 616.

### 6.4 Gate activo
Probe read-only de `sourceRow/sourceKey/sourceSheet` para los dos excesos, sin PII ni provider writes.

### 6.5 Cierre Corte 4
Se cierra cuando:
1. probe de excesos clasificado;
2. mapa exacto ya-existe/falta documentado;
3. binding/read-path canónico de `CX.data` preparado sin reintroducir VIS-01/VIS-02/VIS-02B;
4. smoke read-only de `cxorbia-backend-dev` PASS;
5. documentación reconciliada.

No requiere poblar otra base.

## 7. Corte 5 — materialización DEV incremental
Solo faltantes demostrados:
- julio 2026 HR: 34 GT + 10 HN, sujeto a dry-run/idempotencia;
- corregir únicamente duplicados/excesos demostrados por llave estable y autorización;
- shoppers legacy: diff contra 215 existentes;
- certificaciones legacy: materializar historial faltante (presentadas/aprobadas/reprobadas según fuente);
- no reimportar visitas legacy si HR ya es fuente;
- pilotos/no canónicos se revisan por separado, sin borrado automático;
- datos sensibles protegidos.

Prompt legacy preparado: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 8. Corte 6 — Auth/RBAC
Reutilizar Auth DEV existente cuando corresponda; claims por persona/rol/scope, países/proyectos/rutas/acciones/Academia/notificaciones. No importar Auth legacy a ciegas.

## 9. Corte 7 — sincronización y evidencias
HR→plataforma, plataforma→HR, no duplicación, reviewQueue, cuestionario configurable, evidencias protegidas, Make/Gemini con gates.

## 10. Corte 8 — preproducción y producción
- cortes previos congelados;
- refresh final delta legacy si aplica;
- rollback;
- smoke integral;
- verificar proyecto dueño del Hosting público actual;
- desplegar CXOrbia sobre la URL pública que ya usan shoppers;
- autorización específica;
- no cambiar URL pública por rutina.

## 11. Claude/prototipo
No nueva candidata por esta corrección. Preservar fixes core/entrypoint. No tocar `app/modules` en estos gates.

## 12. Academia
Documentar separación legacy/backend/sandbox, migración incremental, cutover con rollback y patrones fail-closed/empty-backend/role-switch/asset-integrity.

## 13. Estado seguro
Sin producción, merge, nuevos Hosting, Firestore/Auth/Storage/HR writes, imports, pagos/lotes, Make ni Gemini live durante inventario/reconciliación/dry-run.
