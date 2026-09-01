# Phase A real-data domain readiness pack TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Preparar el paquete de readiness dry-run para evaluar si una fuente TyA real/sanitizada original cumple el mapping source-safe de dominios antes de habilitar cualquier lectura DEV por `CX.data` adapter.

Este bloque sigue enfocado en Phase A real TyA: no es runtime, no es import, no es demo y no es fixture. Sirve para comprobar que los dominios reales/sanitizados minimos estan listos.

## Archivos agregados

- `backend/contracts/phase-a-realdata-domain-readiness-pack-v1.json`
- `tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs`

## Que valida el pack

El contrato/validador permite revisar:

- contrato source-safe domain mapping presente;
- contrato `CX.data` adapter presente;
- readiness acumulado presente;
- colas/acciones/auditoria presentes;
- input local source-safe si se entrega por `--input`;
- dominios minimos y campos minimos;
- ausencia de datos sensibles;
- ausencia de fixture sintetico como fuente real;
- ausencia de `.tmp` derivado como fuente original;
- `canImport=false` y `canWrite=false`;
- pagos junio como control, no pago real;
- certificaciones preservadas;
- asignaciones sin duplicar;
- cuestionario configurable o bloqueado honestamente.

## Input esperado futuro

Cuando exista fuente local segura, debe ser JSON source-safe con:

- `tenantId`;
- `projectId`;
- `sourceType`;
- `sourceRef`;
- `sourceSafety`;
- `domains`;
- `generatedAt`.

Tipos permitidos:

- `hr_source_safe_full_flow`;
- `original_sanitized_tya_export`;
- `validated_hr_dry_run`.

Flags de seguridad requeridos:

- `rawSensitiveData=false`;
- `rawHrRows=false`;
- `syntheticFixture=false`;
- `derivedTmpOutput=false`;
- `oldDatabaseSource=false`;
- `canImport=false`;
- `canWrite=false`.

## Dominios revisados

- tenant/project config;
- HR source status;
- visits;
- shoppers;
- applications/assignments;
- certifications;
- liquidations/payments june;
- questionnaire routes;
- operational queues;
- audit preview.

## Reglas de negocio Phase A

- Junio pendiente es liquidacion/pago cuando la visita ya fue ejecutada/submitted.
- Certificaciones preservadas se revisan antes de pedir repetir.
- Asignaciones HR/plataforma no duplican ni sobrescriben conflictos.
- Cuestionario se resuelve por proyecto/visita o se bloquea honestamente.
- Cinépolis se configura como proyecto TyA, no logica global unica.

## Uso tecnico futuro

Solo validacion de contrato:

```bash
node tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs --out .tmp/tya-phase-a-realdata-domain-readiness-pack
```

Validacion con input local source-safe:

```bash
node tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs --input .tmp/source-safe/tya-phase-a-domains.json --out .tmp/tya-phase-a-realdata-domain-readiness-pack
```

No pegar datos privados en chat. El input local, si existe, se mantiene local.

## Interpretacion

### GO_READINESS_PACK_CONTRACT_ONLY_NO_INPUT

El contrato esta listo, pero no se evaluo fuente local.

### GO_REALDATA_DOMAIN_READINESS_DRY_RUN_ONLY

La fuente local source-safe cumple el dry-run. No activa adapter ni runtime.

### NO_GO_REALDATA_DOMAIN_READINESS_BLOCKED

Corregir causa raiz. No importar, no activar adapter, no cambiar runtime, no escribir, no desplegar.

## Impacto Claude/prototipo

Claude debe usar esto como criterio para pantallas futuras: si falta dominio/campo/ruta/fuente, mostrar bloqueo honesto y no inventar datos.

## Impacto Academia

Academia debe explicar como un dry-run valida dominios sin importar, por que se bloquean datos sensibles, como se diferencia fuente real/sanitizada de fixture y como se interpreta GO dry-run vs runtime.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Adapter no habilitado.
- Sin runtime conectado.
- Sin import de dominios.
- Dry-run only.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
