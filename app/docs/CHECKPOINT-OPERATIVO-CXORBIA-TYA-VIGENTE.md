# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `RECONSTRUCTION_ACTIVE_SOURCE_ONLY__NO_DEPLOY__NO_PRODUCTION`

## 1. Decisión prevalente

Se detiene el bucle de diagnósticos C6 aislados y se inicia la reconstrucción de una única candidata acumulativa con la mejor versión demostrable de cada módulo.

Fuente viva principal:

- `app/docs/RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`.

No se ejecutará otro deploy, nueva candidata, shell paralelo, corrección sintomática ni freeze hasta cerrar la matriz de proveniencia y composición.

## 2. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- HEAD de arranque de reconstrucción: `c646af04b8fba0ca8685fa4d6ce0a46e62221276`.
- Commit inicial de matriz: `cbf777bbbd9d3172323db18d5b6f854c3e5ab8ff`.
- Índice actualizado al lock de reconstrucción: `c7b563f4a69941204570b121926c77bbafcf4bec`.
- Producción `tya-plataforma` intacta.
- Agosto 2026 todavía no existe en HR.

## 3. Causa raíz que se corrige

No existía una autoridad ejecutable por módulo:

`módulo → última aprobación humana → candidata/commit → dependencias → SHA aprobado → SHA actual → decisión`.

Por ello, los source locks anteriores podían demostrar integridad del árbol presente, pero no que cada módulo fuera su mejor versión aprobada.

## 4. Reconstrucción iniciada

### Inventario físico

`app/index.html` blob `3855486bdddcfcdc2c702f08b2a640d99717d980` carga el shell, core y módulos actuales.

### Drift de identidad

`app/core/build-lock.js` blob `717dd4a40e3a24c380089cf22596e04fc8c25da1` todavía declara V174/R20 y referencia el manifest V174. No representa la composición posterior y deberá reemplazarse únicamente al ensamblar la candidata final.

### Ancla V182

El paquete `CANDIDATA_V182_CORTE3_20260725` es incremental de cinco archivos.

Coincidencia exacta actual:

- `app/app.js` = V182;
- `app/modules/beneficios.js` = V182;
- `app/styles/layout.css` = V182.

Cambios posteriores que requieren reconciliación:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`.

No se restaurarán ciegamente porque los fixes posteriores de precedencia financiera tienen PASS remoto.

## 5. Familia A abierta

Estado inicial:

- `index.html`: inventariado;
- `app.js`: base V182 exacta presente, overlays posteriores pendientes de proveniencia;
- `layout.css`: V182 exacta presente;
- `build-lock.js`: obsoleto, reemplazo final requerido;
- `config.js`, `router.js`, `data-source.js`, `permissions.js`: proveniencia en revisión;
- `data.js`: conservar solo como fallback/demo no autoritativo;
- pendientes de inventario: store, `CX.data`, HR, tenant/proyecto/periodo, adapters Auth y runtime, overlays de Hosting y dependencias de shell.

## 6. PASS técnicos preservados

No se pierden ni se reabren sin regresión nueva:

- HR: 14 periodos, 616 visitas, junio 2025–julio 2026;
- Staff, Shopper y Cliente remotos con recargas/nueva pestaña estables;
- identidad Shopper exacta y `ownVisits=1`;
- Cliente con scope `tya/cinepolis`;
- root fix financiero remoto:
  - modelo delegado;
  - `delegated_coordination`;
  - facturación local false;
  - regalía 0;
  - Q60 GT / L200 HN;
  - 14 delegados, 0 directos, 0 sin configurar y 0 violaciones.

## 7. Orden obligatorio

1. Familia A — shell/login/tenant/navegación/CX.data/HR/Auth/proyecto-periodo.
2. Familia B — CRM Ops Leads, Dashboard y hoja de ruta.
3. Familia C — proyectos, periodos, HR, histórico, visitas, postulaciones, reservas y shoppers.
4. Familia D — experiencia Shopper y certificaciones.
5. Familia E — Finanzas, liquidaciones, movimientos, beneficios y pagos.
6. Familia F — portales y reportes.
7. Familia G — configuración, administrabilidad, integraciones y Academia.

## 8. Criterio de salida

No se considera candidata acumulativa hasta tener:

- cero módulos `UNKNOWN`;
- matriz módulo/archivo/SHA/aprobación cerrada;
- dependencias reconciliadas;
- delta completo contra HEAD vivo;
- un único commit funcional;
- manifest, build-lock y verificador nuevos;
- gates acumulativos sobre el mismo build;
- un único Hosting DEV;
- aprobación visual de Paula sobre ese build;
- freeze.

## 9. Próximo bloque exacto

`INVENTARIAR Y TRAZAR STORE/CX.DATA/HR/ADAPTERS/AUTH/TENANT/PROYECTO-PERIODO → CERRAR FAMILIA A → DOCUMENTAR MATRIZ Y DIFERENCIAS`.

Después se inicia Familia B con prioridad CRM Ops Leads.

## 10. Estado seguro

- cambios funcionales: 0;
- deploys durante reconstrucción: 0;
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0;
- password changes/resets: 0;
- credenciales/tokens expuestos: 0;
- merge: false;
- producción: false.
