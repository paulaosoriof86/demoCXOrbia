# Historical import clean contract - CXOrbia Phase A

Fecha: 2026-07-08

## Bloque completado

Se creo contrato preview-only para manifiesto de import historico limpio Phase A.

Archivo creado:

- `tools/contracts/cxorbia-historical-import-clean-contract.mjs`

## Objetivo Phase A

Phase A requiere import historico completo como base de control, shoppers historicos desde HR, certificaciones ya presentadas y liquidaciones/pagos pendientes, sin copiar base vieja ni subir datos sensibles.

Este contrato valida el manifiesto de import antes de cualquier import real.

## Fuentes permitidas

- `hr_export_clean`;
- `manual_clean_csv`;
- `controlled_fixture`;
- `redacted_reference`.

No se permite conectar ni copiar base vieja.

## Entidades soportadas

- `projects`;
- `visits`;
- `shoppers`;
- `assignments`;
- `certifications`;
- `settlements`;
- `questionnaire_routes`.

## Acciones soportadas

- `preview_import_manifest`;
- `validate_source_snapshot`;
- `validate_row_mapping`;
- `preview_dedupe_keys`;
- `preview_conflict_queue`;
- `request_import_batch_review`;
- `export_import_readiness_report`.

## Campos clave validados

- `tenantId`;
- `projectId`;
- `sourceType`;
- `entity`;
- `totalRows`;
- `cleanRows`;
- `rejectedRows`;
- `stableKeys`;
- `auditRef`;
- `actorRole`.

## Llaves estables obligatorias

Todo import debe incluir:

- `tenantId`;
- `projectId`.

Segun entidad:

- visitas: `visitId`;
- shoppers: `shopperId`;
- asignaciones: `visitId`, `shopperId`, `assignmentSource`.

## Reglas de seguridad

El contrato bloquea:

- `execute: true`;
- `writeToDatabase: true`;
- `writeToHr: true`;
- `importNow: true`;
- `oldDatabaseDump: true`;
- `connectOldDatabase: true`;
- DPI;
- banco;
- NDA;
- passwords/tokens/secrets;
- cualquier muestra sensible en `sampleRow`.

## Por que importa

Evita importar por coincidencia visual o por memoria.

Permite separar:

- datos limpios;
- datos rechazados;
- conflictos;
- cola de revision humana;
- import listo para gate;
- import real pendiente de autorizacion posterior.

## Pendientes Claude/prototipo

Claude debe reflejar este patron sin hacer import real:

- pantalla/estado de import historico en preview;
- contador de filas limpias, rechazadas y en conflicto;
- badges de sourceType;
- explicacion de por que no se copia base vieja;
- trazabilidad por llaves estables;
- cola de revision humana;
- copy honesto: `preview`, `validado`, `pendiente de gate`, no `importado` si no existe import real.

## Academia

Academia debe explicar:

- diferencia entre export limpio, import preview e import real;
- por que no se conecta base vieja;
- por que DPI/banco/NDA no van al repo;
- como se conservan certificaciones ya presentadas;
- como se evitan duplicados por llaves estables;
- que conflictos van a revision humana;
- errores frecuentes: import sin tenant/proyecto, duplicacion visual, datos sensibles, base vieja copiada.

## Clasificacion

### Reusable CXOrbia

Si. Import historico limpio por manifiesto y gates aplica a cualquier tenant/proyecto.

### Exclusivo cliente

No. TyA/HR es caso Phase A, pero el patron es generico.

### Claude/prototipo

Si. Requiere UI de preview, conteos, badges, cola de revision y copy honesto.

### Academia

Si. Afecta manuales, cursos, rutas por rol y glosario de migracion.

### Sin impacto Claude

No aplica.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin base real, sin HR writes, sin import real, sin conexion a base vieja y sin datos sensibles.
