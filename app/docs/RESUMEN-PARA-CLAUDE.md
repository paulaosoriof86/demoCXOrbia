# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `RECONSTRUCTION_ACTIVE_SOURCE_ONLY__NO_DEPLOY__NO_PRODUCTION`

## 1. Baseline única y lock nuevo

Continuar exclusivamente sobre `docs-tya-v6-v71-audit`.

La prioridad vigente ya no es ejecutar otro gate C6 aislado. Se está reconstruyendo una única candidata acumulativa con la mejor versión demostrable de cada módulo.

Fuente principal:

- `app/docs/RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`.

No crear candidata, shell reducido, nueva rama, PR, Firebase, Hosting o workflow paralelo.

## 2. Regla para Claude/prototipo

No solicitar ni producir una nueva candidata por rutina. Primero se recupera del historial, repo y paquetes existentes la mejor versión aprobada de cada módulo.

Cada módulo terminará como:

- `APPROVED_AND_PRESENT`;
- `BEST_APPROVED_RESTORE`;
- `RECONCILIATION_REQUIRED`;
- `BEST_TECHNICAL_PENDING_VISUAL`;
- `RETIRED_BY_EXPLICIT_DECISION`.

Una versión técnica sin aprobación humana no se presenta como aprobada.

## 3. Hallazgo inicial

`app/core/build-lock.js` todavía declara V174/R20 y no representa la composición posterior. No debe editarse todavía; se sustituirá al ensamblar la candidata acumulativa final.

El paquete V182 es incremental de cinco archivos:

- `app/app.js`, `app/modules/beneficios.js` y `app/styles/layout.css` coinciden exactamente con la rama viva;
- `app/core/finanzas-core.js` y `app/modules/finanzas.js` contienen fixes posteriores y deben reconciliarse, no restaurarse ciegamente.

## 4. Orden de reconstrucción

1. shell, login, tenant, navegación, `CX.data`, HR, Auth y proyecto/periodo;
2. CRM Ops Leads, Dashboard y hoja de ruta;
3. operación e histórico;
4. experiencia Shopper y certificaciones;
5. Finanzas;
6. Portal Cliente, Portal Shopper y reportes;
7. configuración, administrabilidad, integraciones y Academia.

Academia debe quedar acumulada y documentada, pero no bloquear CRM Ops Leads/Phase A salvo P0 demostrado.

## 5. PASS que deben preservarse

No reabrir sin regresión reproducible:

- 14 periodos y 616 visitas;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- entrada humana única;
- configuración financiera `tya::cinepolis` delegada;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

## 6. Pendientes frontend ya conocidos

No se pierden durante la reconstrucción:

- CRM Ops Leads y hoja de ruta deben conservar el mejor estado aceptado;
- Dashboard no puede recuperar indicadores fabricados;
- Reportes deben recuperar la mejor versión por rol;
- PDF/XLSX/PPTX y branding permanecen en la matriz de portales/reportes;
- `proyecto-wizard.js` conserva pendiente de Regional y regalías solo con facturación local;
- Finanzas debe explicar comisión/reparto configurable sin alterar el contrato remoto PASS;
- entrada humana única no puede volver a convertirse en formulario técnico paralelo.

## 7. Próximo bloque

Cerrar Familia A:

`STORE/CX.DATA/HR/ADAPTERS/AUTH/TENANT/PROYECTO-PERIODO → APROBACIONES/COMMITS → PRESERVAR/RESTAURAR/RECONCILIAR`.

Después iniciar Familia B con prioridad CRM Ops Leads.

## 8. Prohibiciones

- no parchear UI para ocultar inconsistencias;
- no seleccionar por número de versión solamente;
- no asumir que un delta incremental contiene todo lo anterior;
- no deploy durante inventario/proveniencia;
- no merge ni producción antes de candidata única, gates y aprobación humana.
