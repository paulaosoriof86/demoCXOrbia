# P0 HR viva multihoja source-safe desplegada TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
URL DEV: `https://cxorbia-backend-dev.web.app`

## Objetivo

Cerrar el bloqueo P0 reportado por Paula: el preview no podia quedarse en datos demo, snapshot fijo, ni solo dos periodos. La fuente operativa debe ser la HR viva multihoja de TyA, con tenant/proyecto/periodo separados.

## Correccion aplicada

Se ajusto el builder DEV para leer la HR viva multihoja desde el Google Sheet trabajado, con dos rutas seguras:

1. Sheets API con service account cuando esta disponible.
2. Fallback por export XLSX publico cuando la HR esta compartida por link o la API no esta disponible para el service project.

El fallback no sube workbook crudo al repo ni expone PII. Solo genera payload source-safe para preview DEV.

## Separacion correcta

- Tenant: `TyA`.
- Proyecto: `Cinépolis`.
- Periodo: derivado de cada tab HR valido, por ejemplo `JUNIO 25`, `JUNIO 25 HN`, `JULIO 25`, `JULIO 25 HN`, hasta los tabs vigentes.
- Proyecto interno no debe llamarse `Cinépolis JUN` o `Cinépolis JUL`.
- Los periodos son seleccionables aparte del proyecto.

## Archivos tocados

- `tools/hr-source/tya-hr-source-xlsx-lite.mjs`
- `tools/hr-source/tya-build-live-hr-source-safe-static.mjs`
- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`
- `tools/release/tya-rc-phase-a-drift-gate.mjs`

## Validacion automatizada

El workflow `CXOrbia RC Phase A DEV Root Deploy` quedo en success en el run `29065928143`:

- Predeploy gate: success.
- Drift gate: success.
- Secret availability and JSON sanity check: success.
- Build live HR source-safe payload: success.
- Firebase CLI access check: success.
- Deploy Hosting DEV root: success.
- Verify DEV root URL: success.

## Estado source-safe

El payload DEV excluye PII y datos sensibles:

- telefono;
- mail;
- DPI;
- banco;
- direccion shopper;
- HR URL privada;
- workbook crudo.

## Limite consciente

La URL DEV es publica. Por eso no debe mostrar datos personales completos de shoppers. La ficha completa de shopper debe pasar a backend protegido con Auth/roles.

## Impacto Phase A

Este bloque ya no es documentacion abstracta: habilita revision visible del preview DEV con HR viva multihoja source-safe.

Permite verificar:

- multi-tenant inicial con TyA como tenant;
- proyecto Cinépolis configurable;
- periodo separado de proyecto;
- lectura historica multihoja desde HR viva;
- datos source-safe sin PII;
- preparacion reusable para nuevos proyectos TyA y futuros tenants.

## Impacto Claude/prototipo

Claude debe mantener la separacion Tenant/Proyecto/Periodo:

- selector de tenant cuando haya mas de uno;
- selector de proyecto: `Cinépolis`;
- selector de periodo derivado de HR o configuracion;
- no crear proyectos separados por mes;
- no hardcodear Cinépolis como logica global.

## Academia

Academia debe explicar:

- por que TyA es tenant;
- por que Cinépolis es proyecto;
- por que los periodos salen de tabs HR;
- por que la vista publica es source-safe;
- por que datos completos de shoppers requieren Auth/roles;
- como se agregaria otro proyecto TyA sin cambiar codigo de modulo.

## Estado seguro

No produccion. No merge final. No Firestore writes. No Storage. No HR writeback. No Make. No Gemini. No pagos. No datos sensibles en repo.
