# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `C6_FINANCE_REMOTE_PASS__SEMANTIC_GATE_EXACT_ASSERTION_PENDING__STOP_RETRY`

## 1. Cerrado remotamente

### Shopper nueva pestaña

- autoridad protegida aplicada;
- identidad exacta;
- `ownVisits=1`;
- tres recargas y nueva pestaña estables.

### Precedencia financiera canónica

Causa cerrada:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

Remote PASS:

- `period`, `project` y `currentById` delegados;
- `delegated_coordination`;
- facturación local false;
- regalía 0;
- 14 periodos delegados;
- 0 directos;
- 0 sin configurar;
- 0 violaciones de regalías;
- Q60 GT / L200 HN;
- valores no inventados.

## 2. Bloqueante actual

El gate combinado terminó en:

`remote_domain_finance_portals_reservations`

con:

`FAIL_C6_REMOTE_GATES_AFTER_SINGLE_DEV_HOSTING_DEPLOY_STOP_RETRY`.

La evidencia muestra `semantic=null`; no se persistió la aserción exacta ni el stdout/stderr del script. Por eso el pendiente actual no es volver a corregir Finanzas, sino identificar con evidencia cuál validación posterior falló.

## 3. Pendiente inmediato read-only

Sin deploy:

1. persistir etapa antes de cada aserción del gate semántico;
2. conservar stdout/stderr sanitizado aun cuando falle;
3. ejecutar contra el Hosting DEV ya publicado;
4. identificar la aserción exacta;
5. capturar snapshots parciales de Staff, salida financiera, Reservas, Cliente y Shopper;
6. documentar;
7. detenerse.

## 4. No cerrado todavía

- dominio semántico final;
- filas financieras por país;
- Portal Cliente;
- Portal Shopper;
- Reservas;
- validación humana acumulativa;
- freeze C6.

## 5. Contrato financiero que debe preservarse

Llave `tya::cinepolis`:

- modelo delegado;
- coordinación delegada;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- honorario Shopper no usado como ingreso;
- valores no inventados.

## 6. Pendientes Claude/prototipo no bloqueantes

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

## 7. Prohibiciones

- no nuevo deploy para diagnosticar;
- no segunda candidata, rama, PR, Firebase, Hosting o workflow paralelo;
- no reabrir login/Shopper o precedencia financiera sin regresión demostrada;
- no parche UI;
- no clasificación por nombre visual;
- no regalías globales;
- no honorario Shopper como ingreso;
- no producción antes del PASS acumulativo y aprobación humana.

## 8. P1/P2 posteriores al freeze

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto;
- optimización de carga;
- review queue y certificaciones.

## 9. Agosto

Agosto debe aparecer únicamente cuando exista en HR y después del freeze de Corte 6.
