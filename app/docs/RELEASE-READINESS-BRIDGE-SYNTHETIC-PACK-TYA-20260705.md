# Release readiness bridge desde synthetic pack TyA

Fecha: 2026-07-05

## Objetivo

Construir el puente entre el readiness map del synthetic input pack y el release readiness snapshot preview, sin activar produccion ni depender de Claude.

Este bloque convierte la cadena backend en cuatro pasos locales:

1. Synthetic input pack runner.
2. Synthetic pack readiness map.
3. Bridge hacia release readiness snapshot input.
4. Release readiness snapshot validator.

## Archivos creados

1. `app/contracts/readiness-map-to-release-snapshot-bridge-phase-a.tya.contract.json`
   - Contrato del puente.
   - Define origen permitido: `tya-synthetic-input-pack-readiness-map-preview`.
   - Define destino permitido: `tya-release-readiness-snapshot-preview-validator`.
   - Mantiene gates apagados.
   - Fuerza que el P0 frontend quede como blocker mientras no haya candidata correctiva auditada.

2. `tools/migration/tya-readiness-map-to-release-snapshot-preview-bridge.mjs`
   - Script que lee el readiness map y genera un input compatible con `release-readiness-snapshot-preview`.
   - Crea readiness items para release governance, sensitive data policy, HR source preview, CX.data adapter y prototype audit.
   - Deja `prototype_audit` bloqueado por P0 si no se pasa `--prototypeP0Status resolved`.

3. `tools/migration/tya-synthetic-pack-release-readiness-local-chain.ps1`
   - Orquestador local completo.
   - Corre runner, map, bridge y validator.
   - Guarda reportes en `_diagnosticos/tya-release-readiness`.
   - Tolera estados bloqueados/revision del mapper para poder documentarlos en el snapshot preview.

## Archivos actualizados

1. `tools/migration/tya-release-readiness-snapshot-preview-validator.mjs`
   - Se agregaron dependencias del readiness map y del bridge.
   - Se agrego allowlist de metadata segura para evitar falsos positivos por llaves de control como `containsRawSensitiveData` o flags `emailSendAllowed`/`whatsappSendAllowed`.

2. `tools/migration/tya-synthetic-input-pack-preview-runner.mjs`
   - Se agrego allowlist de metadata segura para evitar falsos positivos por campos que son controles obligatorios, no payload sensible.

## Ejecucion local recomendada

Desde la raiz del repo:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-synthetic-pack-release-readiness-local-chain.ps1
```

Esto corre la cadena en modo estructura preview.

Cuando el reporte este revisado:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-synthetic-pack-release-readiness-local-chain.ps1 -ExecuteValidators
```

Ese modo ejecuta validadores locales preview. No debe escribir ni llamar proveedores.

## Politica P0 frontend

Por defecto el bridge genera `prototype_audit` como `blocked_prototype_pending`, porque la auditoria V87 confirmo que siguen vivos P0 de honestidad operativa. Esto impide que un synthetic pack correcto se confunda con source lock o produccion lista.

Solo en una candidata futura auditada y corregida se podra usar:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-synthetic-pack-release-readiness-local-chain.ps1 -PrototypeP0Status resolved
```

Ese uso futuro no activa produccion; solo remueve el blocker de prototipo si ya existe auditoria correctiva.

## Salidas locales esperadas

El script genera cuatro archivos locales:

1. `01-synthetic-pack-runner-*.json`
2. `02-synthetic-pack-readiness-map-*.json`
3. `03-release-readiness-snapshot-input-*.json`
4. `04-release-readiness-snapshot-report-*.json`

Estos reportes quedan bajo `_diagnosticos/tya-release-readiness` y no deben subirse al repo si contienen trazas largas o informacion no revisada.

## Estado seguro

- Sin frontend modificado.
- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin import real.
- Sin escrituras Firestore.
- Sin escrituras Storage.
- Sin escrituras HR.
- Sin Make real.
- Sin Gemini real.
- Sin correo real.
- Sin WhatsApp real.
- Sin pagos reales.
- Sin datos sensibles.

## Resultado esperado del bloque

El backend queda preparado para demostrar readiness preview de Phase A por estados, sin ocultar que el prototipo sigue bloqueado por P0 hasta que Claude entregue candidata correctiva con delta real.
