# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-03  
**Estado:** `ACTIVE_COMPLETE_PHASE_A_CUMULATIVE_RECONSTRUCTION__NO_FRAGMENTED_AB_GATE`

## 1. Objetivo

Cerrar y poner en producción Phase A sobre una sola baseline acumulativa, preservando todo lo ya aprobado y probado.

Baseline:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- DEV canónico `cxorbia-backend-dev`;
- producción `tya-plataforma`, intacta hasta cutover autorizado.

## 2. Secuencia obligatoria

`FUENTES Y APROBACIONES → MATRIZ SHA COMPLETA → COMPOSICIÓN PHASE A → GATES SOURCE/STATIC → RUNTIME MULTIROL → DEV ÚNICO → VALIDACIÓN HUMANA COMPLETA → FREEZE → AGOSTO/DISPONIBLES/POSTULACIONES → CUTOVER`.

No se divide la aprobación en A+B/C+D/E+F/G. Ese esquema queda superado.

## 3. Phase A indispensable

### Base transversal

- entrada directa por Administración/Coordinación, Portal Cliente y Shopper/Evaluador;
- Auth técnica aislada;
- tenant/proyecto/periodo;
- HR viva y refresh in-place;
- `CX.data` canónico;
- navegación y permisos por rol;
- cache/build-lock/service worker coherentes.

### Operación

- Dashboard Operativo y drilldowns;
- Mi Día/hoja de ruta;
- Proyectos, Periodos, HR e Histórico;
- Visitas, detalle y Revisión Admin;
- Postulaciones;
- Reservas/asignación;
- Shoppers y notificaciones operativas.

### Shopper/perfiles

- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Día;
- Mi Perfil;
- cuestionario;
- certificaciones e histórico;
- documentos;
- beneficios;
- aislamiento exacto por shopper.

### Finanzas

- Dashboard Financiero;
- liquidaciones;
- movimientos;
- costos;
- CxP/CxC;
- lotes/pagos en estado real;
- multi-país/multi-moneda;
- revisión financiera separada de conciliación y pago;
- modelo delegado, localBilling false, regalía 0, Q60 GT/L200 HN.

### Portales/reportes

- Portal Cliente;
- Portal Shopper;
- Reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX donde corresponda;
- periodo, alcance, fuente, filas, branding y gráficas coherentes;
- cero métricas, NPS, porcentajes o hallazgos fabricados.

## 4. Aprobaciones históricas preservadas

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1 aprobado/frozen;
- Corte 2A/V174 aprobado/frozen;
- Corte 3/V182 frozen active baseline;
- C6 entrada/HR/roles/perfiles/Finanzas/Reservas técnicamente PASS.

Estas autoridades se validan por SHA y smoke antirretroceso. No se reinicia cada módulo desde cero.

## 5. CRM y módulos posteriores

CRM Ops Leads, Clientes comerciales, Comercial y Marketing:

- se preservan;
- continúan después del freeze Phase A;
- no sustituyen ni bloquean la reconstrucción de Operación/Finanzas/Reportes/perfiles;
- solo bloquean si demuestran un P0 transversal.

## 6. Gate visual correcto

`CHECKPOINT_VISUAL_PHASE_A_COMPLETA`

Orden:

1. entrada/contexto/navegación;
2. Dashboard/hoja de ruta/Histórico/refresh;
3. Visitas/Postulaciones/Reservas;
4. Shoppers/perfiles;
5. Finanzas completa;
6. portales;
7. Reportes/exportaciones;
8. smoke multirol y nueva pestaña.

## 7. Post-freeze urgente

Después de `FINAL_HUMAN_VISUAL_APPROVED`:

1. fuente exacta agosto;
2. rollover actual seguro;
3. disponibles;
4. postulaciones;
5. gate multirol;
6. autorización de cutover;
7. producción.

## 8. Prohibiciones

- no candidata, rama, PR, shell, Firebase o Hosting paralelos;
- no aprobación fragmentada centrada en CRM;
- no selección por número de versión;
- no nombre visual como llave;
- no parche UI desde backend;
- no writes Firestore/Auth/HR/Rules/Storage;
- no Make/Gemini/pagos;
- no merge/producción antes del PASS acumulativo y humano.

## 9. Estado vigente

- matriz Phase A completa iniciada;
- blobs vivos de módulos indispensables registrados;
- recuperación de SHA aprobado/source lock en curso;
- DEV actual clasificado como comparación técnica, no candidato final;
- deploy nuevo: 0;
- producción: intacta.

## 10. Siguiente bloque exacto

`RECUPERAR SHAS APROBADOS PHASE A → COMPARAR CON BLOBS VIVOS → PRESERVAR/RESTAURAR/RECONCILIAR → MANIFEST COMPLETO → GATES ACUMULATIVOS`.
