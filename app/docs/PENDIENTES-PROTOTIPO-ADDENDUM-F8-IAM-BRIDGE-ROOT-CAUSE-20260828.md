# PENDIENTES PROTOTIPO — ADDENDUM F8 IAM BRIDGE ROOT CAUSE — 2026-08-28

## No existe pendiente frontend nuevo en este bloque

F8 no produjo un defecto funcional demostrado en módulos del prototipo. No modificar `/app/modules` ni `/app/core` ahora.

## Pendientes reales

### P0 de mecanismo / proveedor

`F8_HUMAN_OWNER_TEMP_CONDITIONAL_DATASTORE_OWNER` — pendiente de aplicar desde una identidad Owner humana el binding excepcional ya autorizado de `roles/datastore.owner` a la identidad DEV existente. Debe ser condicionado, máximo 120 minutos, sin otras funciones y con revocación inmediata tras F8 pass/failure.

Después del grant, el capability recheck read-only debe demostrar:
- `datastore.databases.export`;
- `datastore.databases.import`;
- `datastore.databases.create`;
- `datastore.databases.delete`;
- `datastore.databases.getMetadata`;
- `datastore.operations.get`;
- bucket GCS existente/verificado y permisos de objeto adecuados.

Solo entonces puede existir successor marker F8 y ejecución real.

### Gate obligatorio antes de visualización

`F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION` — pendiente y bloqueado hasta F8 PASS + revocación IAM verificada.

Debe resolver por evidencia la última versión aprobada de cada módulo y comprobar que la canónica/Hosting vivo sirven exactamente esas versiones. Debe revisar `app/modules/**`, `app/core/**` relevante, entrypoints/index, scripts, adapters, rutas, módulos huérfanos, referencias/versionados residuales y posibles regresiones. Cualquier mismatch es bloqueante para pedir visualización humana.

## Hallazgos ya cerrados que no deben reabrirse

- Transporte GCP: identidad existente autenticable; deadlock de bridge corregido.
- Adapter Hosting investigado: asset vivo no está obsoleto; el fingerprint F6 era metadata incorrecta y tiene errata canónica.
- Bucket: existe bucket GCS real same-project; no crear otro bucket.
- Credenciales: no crear otra identidad/service account/key.
- Release F6: no redeploy/rebuild/reimport mientras tuple exacto permanezca.

## Control-plane

La rama accidental `__invalid_should_not_create__` es inerte/no autoritativa, no contiene trabajo único y no debe utilizarse. La única rama viva continúa `docs-tya-v6-v71-audit`.