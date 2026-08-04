# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Corrección prevalente:** 2026-08-04  
**Estado:** `FINAL_COMPOSITION_MANIFEST_SOURCE_COMPLETE__STATIC_GATE_PENDING_EXECUTION__NO_PRODUCTION`

## 1. Objetivo

Cerrar y poner en producción Phase A sobre una sola baseline acumulativa, preservando todo lo ya aprobado y probado.

Baseline:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- DEV canónico `cxorbia-backend-dev`;
- producción `tya-plataforma`, intacta hasta cutover autorizado.

## 2. Secuencia obligatoria vigente

`FUENTES Y APROBACIONES → MATRIZ SHA COMPLETA → MANIFEST FINAL DE COMPOSICIÓN → GATE SOURCE/STATIC → RUNTIME MULTIROL → DELTA ÚNICO SOLO SI SE DEMUESTRA → DEV ÚNICO SI CAMBIA APP → VALIDACIÓN HUMANA COMPLETA → FREEZE → AGOSTO/DISPONIBLES/POSTULACIONES → CUTOVER`.

No se divide la aprobación en A+B/C+D/E+F/G.

## 3. Estado alcanzado

### Autoridades

Se cerraron:

`29_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED`.

Incluyen:

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1 aprobado/frozen;
- Corte 2A/V174 aprobado/frozen;
- Corte 3/V182 frozen active baseline;
- C6 entrada/HR/roles/perfiles/Finanzas/Reservas técnicamente PASS;
- Ficha;
- Revisión Admin;
- Documentos;
- Costos;
- `cliente-data.js`.

### Manifest final

Fuente activa:

`MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`.

Estado:

`FINAL_COMPOSITION_MANIFEST_SOURCE_COMPLETE`.

### Gate

Creado:

`tools/qa/tya-phase-a-complete-composition-source-gate.mjs`.

Estado:

`CREATED_NOT_EXECUTED`.

No se afirma PASS hasta ejecutarlo en un checkout autenticado del HEAD exacto.

## 4. Phase A indispensable

### Base transversal

- entrada directa por Administración/Coordinación, Portal Cliente y Shopper/Evaluador;
- Firebase Auth como autoridad;
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
- PDF/XLSX/PPTX;
- periodo, alcance, fuente, filas, branding y gráficas coherentes;
- cero métricas, NPS, porcentajes o hallazgos fabricados.

## 5. Report kit y deuda no bloqueante

`CX.reportKit` está inventariado como proveedor transversal para Admin, Cliente, Shopper y Finanzas.

P1/P2 preservados:

- algunas gráficas no aparecen en rutas de impresión PDF;
- Excel tiene presentación básica.

No bloquean mientras datos, filas, periodo, alcance y fuente sean correctos.

## 6. Overlay superseded

`app/adapters/tya-ab-cumulative-composition-v1.js`

Clasificación:

`P1_SUPERSEDED_LOADED_OVERLAY__NOT_P0_PROVEN`.

No retirar sin prueba de no pérdida.

## 7. CRM y módulos posteriores

CRM Ops Leads, Clientes comerciales, Comercial y Marketing:

- se preservan;
- continúan después del freeze Phase A;
- no bloquean Phase A salvo P0 transversal demostrado.

## 8. Gate visual correcto

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

## 9. Prohibiciones

- no candidata, rama, PR, shell, Firebase o Hosting paralelos;
- no aprobación fragmentada;
- no selección por número de versión;
- no nombre visual como llave;
- no parche UI desde backend;
- no JWT Emergent como reemplazo de Firebase Auth;
- no writes Firestore/Auth/HR/Rules/Storage;
- no Make/Gemini/pagos;
- no merge/producción antes del PASS acumulativo y humano.

## 10. Siguiente bloque exacto

`OBTENER CHECKOUT AUTENTICADO → EJECUTAR GATE SOURCE/STATIC SOBRE HEAD EXACTO → SI PASS, GATE RUNTIME MULTIROL; SI FAIL, APLICAR UN SOLO DELTA PROBADO`.

Después:

`DEV ÚNICO SI CAMBIA APP → CHECKPOINT VISUAL PHASE A COMPLETA → FREEZE → AGOSTO/DISPONIBLES/POSTULACIONES → CUTOVER`.

## 11. Estado seguro

- archivos funcionales modificados en el bloque: 0;
- deploy: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
