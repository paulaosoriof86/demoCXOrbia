# CAMBIOS-BACKEND-20260630-V55

## Revisión prototipo V55 + carga shopperBenefits DEV

### Archivos creados

- `firebase/client-write-tools/apply-finance-benefits-write-plan-dev.mjs`
  - Tipo: nuevo.
  - Qué cambió: script controlado para cargar `shopperBenefits` calculados desde `firebase/private-output/finance-benefits-write-plan-dry-run.json` hacia Firestore DEV.
  - Por qué: Paula autorizó cargar beneficios calculados HR V4 en Firestore DEV, sin pagos reales.
  - Impacto frontend: ninguno directo; habilita lectura futura de Mis Beneficios por `shopperId`.
  - Pendiente/riesgo: requiere credencial DEV local y validación OK. Si falla Rules/Auth, detener y no publicar reglas sin nueva autorización.

- `RUNBOOK-APLICAR-BENEFICIOS-FINANCE-DEV-20260629.md`
  - Tipo: nuevo.
  - Qué cambió: instrucciones PowerShell completas para ejecutar la carga DEV y copiar reporte.
  - Por qué: Paula no es programadora y requiere un solo bloque claro.
  - Impacto frontend: ninguno.
  - Pendiente/riesgo: no ejecutar si faltan `finance-benefits-write-plan-dry-run.json` o `finance-benefits-write-plan-validation.json`.

- `RESUMEN-PARA-CLAUDE-CXORBIA-PROTOTIPO-V55-PENDIENTES-20260630.md`
  - Tipo: nuevo.
  - Qué cambió: resumen para Claude/frontend con mejoras V55, pendientes P0/P1 y notas backend.
  - Por qué: el ZIP V55 trae avances amplios del prototipo y se debe evitar que backend los pierda o los sobreescriba.
  - Impacto frontend: documento guía; no modifica UI.
  - Pendiente/riesgo: Claude debe actualizar `CAMBIOS-PROTOTIPO.md`, `PENDIENTES-PROTOTIPO.md`, `CHECKLIST-VALIDACION-PROTOTIPO.md` y `RESUMEN-PARA-CHATGPT-BACKEND.md` en próximos ZIP.

- `RESUMEN-BACKEND-IMPACTO-PROTOTIPO-V55-20260630.md`
  - Tipo: nuevo.
  - Qué cambió: impacto backend de V55: contratos `CX.data`, IA, roles, scopeCountry, Storage, CxC/CxP, CRM, Academia y recursos.
  - Por qué: mantener sincronía entre backend Firebase DEV y evolución del prototipo.
  - Impacto frontend: ninguno directo.
  - Pendiente/riesgo: no aplicar ZIP V55 completo en rama backend; contiene cambios de módulos/UI.

### Archivos modificados

- `app/index-backend-dev.html`
  - Tipo: modificado.
  - Qué cambió: se removió BOM inicial y se agregaron scripts backend existentes al preview DEV:
    - `core/backend-finance-benefits.js`
    - `core/backend-operational-actions.js`
    - `core/backend-cxdata-finance-read.js`
  - Por qué: el preview DEV debe cargar los bridges backend nuevos sin tocar `app/index.html` principal ni módulos UI.
  - Impacto frontend: solo preview DEV. No activa adapter global.
  - Pendiente/riesgo: cuando Claude entregue nuevo ZIP, reconstruir `index-backend-dev.html` a partir del nuevo `app/index.html` conservando estos scripts backend.

- `PENDIENTES-PROTOTIPO.md`
  - Tipo: modificado.
  - Qué cambió: se agregó sección `2026-06-30 — Revisión prototipo V55` con pendientes P0/P1 detectados desde el ZIP V55.
  - Por qué: mantener lista viva de mejoras para Claude/frontend y backend.
  - Impacto frontend: ninguno directo.
  - Pendiente/riesgo: seguir actualizando con cada ZIP nuevo del prototipo.

## Validación local previa

El script `apply-finance-benefits-write-plan-dev.mjs` fue validado localmente con:

```text
node --check apply-finance-benefits-write-plan-dev.mjs
```

Resultado: OK.

## Restricciones conservadas

- No se publicó Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se modificó `/app/modules`.
- No se marcaron pagos reales.
- No se escribieron datos desde ChatGPT; la carga real queda para PowerShell local con credencial DEV.
