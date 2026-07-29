# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_INVENTORY_PASS__LIVE_HR_PASS_WITH_AUG_HN_HOLD__CANONICAL_PLAN_PASS__R16E_READONLY_AUTH_PENDING`

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
- Source lock hasta julio: 14 periodos, junio 2025–julio 2026, GT34+HN10=44 por periodo = 616 visitas.
- R26–R32: 135/135 PASS.
- HR remota, Hosting DEV y smoke pagos: PASS.
- Mayo: 44 pagadas / 0 pendientes / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy permanecen backlog.

## 6. Corte 4 — `CX.data` read-only / recuperación del backend canónico

### 6.1 Sandbox técnico — aprendizaje preservado
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
- Faltan julio 2026 GT+HN en la materialización period-country anterior: 44 visitas.
- Dos excesos ya quedaron localizados exactamente:
  - Abril 2026: `sprint5-visit-mutation-no-real-data`, sintético y sin llaves HR.
  - Junio 2026 HN: `hr-58fb469666080189`, sourceRow 12; HR actual solo tiene rows 2..11.
- Pilotos/no canónicos `julio-pilot`, `r1`, `tya-piloto` se preservan separados; no delete automático.

### 6.4 HR viva actual — PASS con HOLD focalizado
HR source-safe actual:
- 15 periodos;
- 30 tabs;
- 684 visitas;
- 236 referencias shopper protegidas;
- julio 2026 GT=34/HN=10 correcto.

`AGOSTO 26 HN` está bloqueado por inconsistencia de fuente: sus 34 filas tienen País=GT. Agosto HN no entra en materialización/sync hasta corregir o confirmar la fuente. El hallazgo no bloquea julio.

### 6.5 Plan canónico aprobado — refresh offline PASS
Se reutilizaron builders R6/R16D existentes, sin provider calls ni writes:
- 1 tenant;
- 1 proyecto padre `cinepolis`;
- 14 periodos;
- 210 shoppers en el plan histórico;
- 616 visitas;
- 572 controles de liquidación;
- 0 certificaciones;
- 0 pagos;
- 1,415 operaciones.

El modelo de producto aprobado es **proyecto padre `cinepolis` → periodos → visitas**. Los documentos period-country ya existentes en Firestore son estado/materialización previa a comparar y reutilizar, no el modelo semántico final por defecto.

### 6.6 Gate activo para cerrar Corte 4
Ejecutar **R16E provider compare read-only** contra `cxorbia-backend-dev` bajo autorización explícita.

R16E debe:
1. reconstruir/reusar el plan aprobado;
2. leer solo documentos/fields allowlisted;
3. clasificar `create/update/noop/review`;
4. preservar extras, sin deletes;
5. generar write plan exacto, sin ejecutarlo;
6. hacer 0 writes.

### 6.7 Cierre Corte 4
Corte 4 se cierra cuando:
1. R16E read-only PASS;
2. mapa exacto `create/update/noop/review` documentado;
3. binding/read-path canónico de `CX.data` queda preparado sin reintroducir VIS-01/VIS-02/VIS-02B;
4. smoke read-only de `cxorbia-backend-dev` PASS;
5. documentación reconciliada.

No requiere poblar otra base.

## 7. Corte 5 — materialización DEV incremental
Solo faltantes demostrados y autorizados:
- julio 2026 HR: 34 GT + 10 HN;
- limpieza de los 2 extras solo si el write plan demuestra el delete/update correcto;
- shoppers legacy: diff por llave estable contra 215 existentes;
- certificaciones legacy: materializar historial faltante de presentadas/aprobadas/reprobadas según fuente;
- no reimportar visitas legacy cuando HR es fuente;
- pilotos/no canónicos se revisan por separado;
- agosto HN permanece HOLD hasta corregir/confirmar fuente;
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
No nueva candidata por esta corrección. Preservar fixes core/entrypoint. No tocar `app/modules` en estos gates. No convertir periodos en proyectos separados en UX/producto.

## 12. Academia
Documentar separación legacy/backend/sandbox, proyecto vs periodo, migración incremental, carryover de certificaciones, cutover con rollback y fail-closed ante fuente inconsistente.

## 13. Estado seguro
Sin producción, merge, nuevos Hosting, Firestore/Auth/Storage/HR writes, imports, pagos/lotes, Make ni Gemini live hasta autorización específica del gate correspondiente.
