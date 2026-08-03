# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-03  
**Estado vivo:** `PHASE_A_COMPLETE_CUMULATIVE_RECONSTRUCTION_ACTIVE__NO_FRAGMENTED_AB_GATE`

## 1. Baseline única

Continuar exclusivamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge.

No crear otra candidata, shell, rama, PR, Firebase, Hosting o metodología.

Leer primero:

- `ADDENDUM-MAESTRO-CORRECCION-RECONSTRUCCION-PHASE-A-COMPLETA-20260803.md`;
- `MATRIZ-CANDIDATA-ACUMULATIVA-PHASE-A-COMPLETA-20260803.md`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.

## 2. Corrección metodológica vinculante

El checkpoint A+B centrado en CRM/Clientes/Comercial/Marketing quedó anulado. Esos módulos pertenecen al trabajo posterior y no pueden desplazar:

- Dashboard Operativo;
- Visitas;
- Revisión Admin;
- Postulaciones;
- Reservas;
- Histórico;
- Shoppers y perfiles;
- Finanzas completa;
- Portal Cliente/Shopper;
- Reportes y exportaciones.

## 3. Qué debe preservarse

Autoridades históricas:

- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- C6 entrada por perfiles, HR, Staff, Shopper, Cliente, Finanzas y Reservas técnicamente PASS.

No reescribir módulos aprobados por rutina. Primero comparar SHA aprobado contra SHA vivo y restaurar/reconciliar solo diferencias demostradas.

## 4. Alcance mínimo antes de nueva visualización

### Admin/operación

- Dashboard Operativo y drilldowns;
- Mi Día/hoja de ruta;
- Histórico y refresh;
- Visitas/ficha/Revisión;
- Postulaciones;
- Reservas;
- Shoppers.

### Shopper/perfiles

- entrada directa;
- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Día;
- Mi Perfil;
- cuestionario;
- certificaciones;
- documentos;
- beneficios;
- reportes Shopper.

### Finanzas

- Dashboard Financiero;
- Movimientos;
- Liquidaciones;
- Costos;
- CxP/CxC;
- lotes/pagos reales o pendientes de fuente;
- delegado, regalía 0, localBilling false, Q60/L200.

### Portales/reportes

- Portal Cliente;
- Portal Shopper;
- Reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- mismo periodo, alcance, fuente y filas;
- cero métricas/NPS/hallazgos fabricados.

## 5. Estado de los módulos posteriores

CRM Ops Leads, Clientes comerciales, Comercial y Marketing:

`PRESENT_POST_PHASE_A_WORKSTREAM_PENDING_VISUAL`.

Se preservan físicamente. No bloquean el freeze Phase A salvo P0 transversal.

## 6. Validación humana

La próxima revisión válida es una sola:

`CHECKPOINT_VISUAL_PHASE_A_COMPLETA`.

No solicitar a Paula una revisión A+B fragmentada. No repetir capturas antiguas salvo smoke antirretroceso de un área modificada.

## 7. Estado del DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Se usa como comparación técnica. No se presenta como candidata definitiva hasta cerrar matriz, manifest y gates completos.

## 8. Siguiente trabajo exacto para frontend/Claude

No iniciar desarrollo nuevo. Esperar clasificación por módulo:

- `PRESERVAR`;
- `RESTAURAR SHA APROBADO`;
- `RECONCILIAR RESULTADO APROBADO`.

Toda corrección debe ser focal, por archivo, sin alterar backend/adapters ni inventar nueva UX.

## 9. Prohibiciones

- no priorizar CRM sobre Phase A;
- no reauditar módulos frozen sin regresión;
- no datos demo/semillas visibles en conectado;
- no métricas fabricadas;
- no hardcodear agosto;
- no `location.reload()` para refresh HR;
- no writes, deploy, merge o producción sin gate/autorización.
