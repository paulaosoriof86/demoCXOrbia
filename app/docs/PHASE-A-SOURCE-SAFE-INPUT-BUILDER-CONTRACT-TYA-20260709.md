# Phase A source-safe input builder contract TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Definir como construir localmente el JSON source-safe que alimenta el real-data domain readiness pack desde HR/export original sanitizado TyA, sin subir datos privados al repo y sin activar runtime, imports ni writes.

Este bloque no ejecuta builder. Solo deja contratado el proceso para cuando exista una fuente local segura que deba evaluarse sin compartir datos crudos.

## Archivos agregados

- `backend/contracts/phase-a-source-safe-input-builder-contract-v1.json`
- `tools/contracts/tya-phase-a-source-safe-input-builder-contract-validate.mjs`

## Inputs permitidos

### `hr_source_safe_full_flow_report`

Reporte local HR source-safe/full-flow, sin raw URL ni filas crudas.

### `original_sanitized_tya_export`

Export original TyA sanitizado localmente, sin DPI, banco, email, telefono ni nombre crudo.

### `project_config_source_safe`

Configuracion de proyecto/periodos/paises/monedas/cuestionario/pagos/certificacion, desde contrato repo o fuente local segura.

## Output esperado futuro

Nombre recomendado:

`tya-phase-a-domains.source-safe.local.json`

Debe quedarse local. No se sube al repo.

Top-level esperado:

- `tenantId`
- `projectId`
- `sourceType`
- `sourceRef`
- `sourceSafety`
- `domains`
- `generatedAt`

Flags obligatorios:

- `rawSensitiveData=false`
- `rawHrRows=false`
- `syntheticFixture=false`
- `derivedTmpOutput=false`
- `oldDatabaseSource=false`
- `canImport=false`
- `canWrite=false`

## Dominios que debe construir

- `tenant_project_config`
- `hr_source_status`
- `visits`
- `shoppers`
- `applications_assignments`
- `certifications`
- `liquidations_payments_june`
- `questionnaire_routes`
- `operational_queues`
- `audit_preview`

## Pasos futuros preparados, no ejecutados

1. Leer HR source-safe status.
2. Mapear configuracion de proyecto.
3. Mapear visitas sanitizadas.
4. Mapear shoppers historicos source-safe.
5. Mapear certificaciones preservadas.
6. Mapear liquidaciones/pagos junio como control.
7. Mapear rutas de cuestionario.
8. Derivar colas operativas preview.
9. Derivar auditoria preview vacia o segura.
10. Validar con `tya-phase-a-realdata-domain-readiness-pack-validate.mjs`.

## Reglas de derivacion

- `visitId`: id estable opaco desde `tenant/project/hrRowId` o id source-safe existente.
- `shopperId`: id estable opaco desde mapping source-safe, no desde nombre crudo.
- `assignmentSource`: plataforma, HR, reconciliado o conflicto; no inferir silenciosamente.
- `paymentControlOnly`: true para junio/pagos/liquidaciones; CXOrbia no ejecuta pagos.
- `preservedAlreadyPresented`: true si existe evidencia historica/source-safe.
- `routeStatus`: configurado o bloqueado honestamente; no inventar links.

## Transformaciones prohibidas

- Copiar filas HR crudas.
- Copiar datos sensibles.
- Usar fixture como real.
- Usar `.tmp` derivado como fuente original.
- Conectar base vieja.
- Deduplicar solo por nombre/coincidencia visual.
- Marcar junio como visita pendiente si lo pendiente es pago.
- Pedir certificacion preservada sin revision.
- Marcar pago como ejecutado por CXOrbia.
- Inventar link de cuestionario.
- Commitear output local al repo.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-source-safe-input-builder-contract-validate.mjs --out .tmp/tya-phase-a-source-safe-input-builder-contract
```

El validador solo revisa el contrato. No construye datos.

## Relacion con readiness pack

El output local futuro debe validarse con:

```bash
node tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs --input .tmp/source-safe/tya-phase-a-domains.source-safe.local.json --out .tmp/tya-phase-a-realdata-domain-readiness-pack
```

No pegar datos privados en chat.

## Impacto Claude/prototipo

Claude debe entender que el builder no significa runtime activo. Debe mostrar estados honestos si una fuente todavia no paso dry-run.

## Impacto Academia

Academia debe explicar:

- builder local source-safe;
- por que el output no va al repo;
- como se deriva `visitId`/`shopperId` sin datos sensibles;
- por que no se deduplica por nombre;
- por que junio es pago/liquidacion;
- por que el builder no importa ni escribe.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Builder no ejecutado.
- Output local no commiteado.
- Adapter no habilitado.
- Sin runtime conectado.
- Sin import de dominios.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
