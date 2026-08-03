# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-03  
**Estado vivo:** `PHASE_A_COMPLETE_CUMULATIVE_RECONSTRUCTION_ACTIVE__APPROVED_SHA_RECOVERY_PENDING__NO_PRODUCTION`

## 1. Bloqueante actual único

No corresponde revisar visualmente CRM/Clientes comerciales/Comercial/Marketing antes de recuperar la Phase A completa.

El bloqueo real es:

`NO_COMPLETE_PHASE_A_APPROVED_SHA_AND_DEPENDENCY_MANIFEST`.

La matriz viva ya contiene los archivos actuales. Falta vincular cada uno con su última aprobación/freeze/source lock y demostrar si debe preservarse, restaurarse o reconciliarse.

## 2. Pendiente inmediato

1. recuperar SHAs/source locks aprobados de M1/Corte 1, Corte 2A, Corte 3 y C6;
2. compararlos con los blobs vivos registrados en `MATRIZ-CANDIDATA-ACUMULATIVA-PHASE-A-COMPLETA-20260803.md`;
3. clasificar cada fila como `PRESERVAR`, `RESTAURAR SHA APROBADO` o `RECONCILIAR RESULTADO APROBADO`;
4. incorporar dependencias y navegación transversal por rol;
5. construir manifest Phase A completa;
6. crear gates acumulativos de cobertura, multirol, Finanzas, Reservas, Reportes y sourceRevision;
7. aplicar solo el delta probado;
8. publicar un único DEV de reemplazo únicamente si cambia `app/`;
9. ejecutar `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`;
10. freeze y preparar agosto/disponibles/postulaciones/cutover.

## 3. Módulos que no pueden quedar fuera

### Admin/operación

- Dashboard Operativo y drilldowns;
- Mi Día/hoja de ruta;
- Proyectos, Periodos, HR e Histórico;
- Visitas, ficha y Revisión Admin;
- Postulaciones;
- Reservas;
- Shoppers;
- notificaciones operativas.

### Shopper/perfiles

- entrada directa;
- Disponibles;
- Mis Visitas;
- Reservas;
- Mi Día;
- Mi Perfil;
- cuestionario;
- certificaciones presentadas/históricas;
- documentos;
- beneficios;
- reportes Shopper.

### Finanzas

- Dashboard Financiero;
- Liquidaciones;
- Movimientos;
- Costos;
- CxP/CxC;
- Lotes y pagos en estado real;
- multi-país/multi-moneda;
- revisión, conciliación y pago separados.

### Portales/reportes

- Portal Cliente;
- Portal Shopper;
- Reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- branding, periodo, alcance, fuente y filas coherentes;
- cero métricas/NPS/hallazgos fabricados.

## 4. Autoridades protegidas

No reabrir desde cero:

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1 FROZEN/APROBADO;
- Corte 2A/V174 FROZEN/APROBADO;
- Corte 3/V182 `FROZEN_ACTIVE_BASELINE`;
- C6 entrada por perfiles, HR, Staff, Shopper, Cliente, Finanzas, Portal Shopper y Reservas técnicamente PASS.

Cada autoridad requiere comparación de linaje y smoke antirretroceso, no reauditoría general.

## 5. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No solicitar capturas ni aprobación fragmentada sobre este build. Puede reutilizarse sin redeploy solo si la comparación completa demuestra que ya contiene exactamente la mejor composición aprobada.

## 6. Módulos posteriores

CRM Ops Leads, Clientes comerciales, Comercial y Marketing:

- se preservan;
- quedan `PRESENT_POST_PHASE_A_WORKSTREAM_PENDING_VISUAL`;
- no bloquean el freeze Phase A salvo P0 transversal probado.

## 7. P1/P2 documentados que no se convierten en P0

- PDF sin algunas gráficas;
- Excel con formato/diseño incompleto;
- mejoras visuales transversales de exportación.

Deben preservarse como pendientes reales, pero no justifican volver a fragmentar Phase A.

## 8. Criterio de salida

- cero módulos Phase A `UNKNOWN`;
- cero dependencias huérfanas;
- manifest completo reproducible;
- gates source/static/runtime multirol PASS;
- una sola URL DEV;
- aprobación visual completa de Paula;
- build-lock/freeze posterior;
- producción solo con cutover autorizado.

## 9. Estado seguro

- cambios funcionales de este bloque: 0;
- deploy nuevo: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
