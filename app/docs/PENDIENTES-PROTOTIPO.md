# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_FINANCE_ROOT_FIX_SOURCE_ONLY_PASS__REMOTE_REVALIDATION_PENDING`

## 1. Cerrado

### Shopper nueva pestaña

Cerrado remotamente:

- autoridad protegida aplicada;
- identidad exacta;
- `ownVisits=1`;
- tres recargas y nueva pestaña estables.

### Causa raíz financiera en fuente

Cerrada en source-only:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

El contrato financiero ahora materializa projectConfig por llave técnica antes de `normalizeAll()`.

Gate:

`PASS_C6_FINANCE_ROOT_FIX_SOURCE_ONLY_GATE`.

## 2. Pendiente bloqueante actual

Validar remotamente el root fix financiero sobre un único deploy DEV nuevo:

- objetos canónicos delegado/regalía 0;
- `d.period()` y `d.project()` consistentes;
- Finanzas consistente;
- Portal Cliente;
- Portal Shopper;
- Reservas;
- validación humana acumulativa;
- freeze C6.

## 3. Contrato financiero que debe preservarse

Cinépolis, llave `tya::cinepolis`:

- modelo delegado;
- coordinación delegada;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- honorario Shopper no usado como ingreso;
- valores no inventados.

## 4. Pendientes Claude/prototipo no bloqueantes

### `app/modules/proyecto-wizard.js`

- agregar `Regional`;
- conservar directo/delegado;
- regalías solo para facturación local.

### `app/modules/finanzas.js`

- explicar comisión de coordinación y distribución configurable;
- mostrar revisión cuando falte fuente exacta.

### `app/app.js`

- preservar UI aprobada y entrada humana única;
- no mover Auth, reconciliación o precedencia financiera a UI.

## 5. Prohibiciones

- no nueva candidata, rama, PR, Firebase, Hosting o workflow paralelo;
- no clasificación por nombre visual;
- no parche UI para ocultar divergencias;
- no regalías globales;
- no honorario Shopper como ingreso;
- no deploy sin autorización fresca;
- no producción antes del PASS acumulativo y aprobación humana.

## 6. P1/P2 posteriores al freeze

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto;
- optimización de carga;
- review queue y certificaciones.

## 7. Agosto

Agosto debe aparecer únicamente cuando exista en HR y después del freeze de Corte 6.
