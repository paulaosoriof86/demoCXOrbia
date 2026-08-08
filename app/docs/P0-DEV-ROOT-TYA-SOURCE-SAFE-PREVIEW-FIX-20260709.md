# P0 DEV root TyA source-safe preview fix

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Problema detectado por Paula

La URL DEV verificada cargaba correctamente, pero mostraba datos demo/comerciales (`Proyecto Retail`, `Demo comercial`, `Datos: Demo · localStorage`) y no una vista TyA/Cinepolis.

Esto hace que el smoke humano no sea valido para Phase A TyA porque no permite revisar la operacion real esperada.

## Decision

No se debe aceptar ese smoke como GO.

Resultado operativo del smoke: `NO_GO_DATA_SOURCE`.

## Cambio aplicado

Se agrego `app/core/tya-phase-a-source-safe-preview.js`.

El archivo se carga desde `app/index.html` justo despues de `core/data.js` y antes de los modulos.

Solo se activa si:

- el host es `cxorbia-backend-dev.web.app`; o
- la URL contiene `?cxTyaPhaseA=1`.

## Alcance del cambio

El cambio reemplaza la capa visible `CX.data` en DEV por una vista TyA/Cinepolis source-safe:

- tenant visible: `TyA`;
- proyecto visible: `Cinépolis Junio 2026`;
- periodo: `JUN 2026`;
- total visitas: 44;
- distribucion source-safe: GT 34 / HN 10;
- shoppers opacos por referencia (`Shopper GT 01`, `Shopper HN 01`, etc.);
- sin DPI, banco, telefono, correo, URL HR privada, workbook crudo ni evidencia cruda;
- sin import real;
- sin Firestore/Auth/Storage reales;
- sin HR writes;
- sin Make/Gemini/pagos.

## Por que esto no copia datos sensibles

La vista usa referencias operativas opacas y conteos documentados para Phase A. No contiene nombres reales, telefonos, correos, DPI, banco, HR URL, service account ni workbook.

## Proteccion de produccion

El script queda inactivo fuera del host DEV salvo query manual `cxTyaPhaseA=1`.

Produccion sigue sin tocarse.

## Archivos tocados

- `app/core/tya-phase-a-source-safe-preview.js`
- `app/index.html`
- `app/sw.js`
- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`

## Motivo de cada archivo

- `tya-phase-a-source-safe-preview.js`: overlay source-safe de `CX.data` para DEV.
- `index.html`: carga el overlay despues de `core/data.js`.
- `sw.js`: invalida cache para evitar que el navegador conserve la version demo.
- workflow deploy DEV: fuerza redeploy del root DEV con build label nuevo.

## Siguiente verificacion esperada

Al recargar `https://cxorbia-backend-dev.web.app`, la vista ya no debe mostrarse como Demo comercial / Proyecto Retail.

Debe mostrar TyA/Cinepolis y datos source-safe de Phase A.

## Estado seguro

No se tocaron modulos UI. No se conecto base vieja. No se hicieron imports, writes, pagos, Make/Gemini ni produccion.
