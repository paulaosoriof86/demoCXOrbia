# Cambios backend — R16E comparación read-only

Fecha: 2026-07-13

## Bloque ejecutado

Se ejecutó una comparación manual read-only contra Firestore DEV para el plan canónico R16D.

### Primer intento

El precheck pasó, pero la ejecución se detuvo antes de llamar al proveedor porque el plan R16D almacenaba los flags de seguridad dentro de `safeState` y el comparador R16 esperaba equivalentes top-level.

Resultado seguro:

- stage: `validate_contract_plan`;
- provider reads: no;
- writes/imports/deploy/production: no.

Corrección aplicada:

- nuevo normalizador `tools/reconciliation/tya-r16d-provider-compare-plan-normalize-r16e.mjs`;
- copia únicamente flags verificados como `false` desde `safeState` al contrato top-level;
- recalcula `planSha256`;
- no llama proveedores y no modifica datos.

### Segundo intento

- precheck R16E: PASS;
- plan normalizado: PASS;
- 1,415 operaciones;
- 196 overlays exactos;
- cola financiera: 92;
- gap shopper: 3;
- certificaciones pendientes de fuente: 213;
- pagos confirmados: 0.

La comparación llegó a Firestore y se detuvo en:

- stage: `provider_query_tenant`;
- error: `RESOURCE_EXHAUSTED: Quota exceeded`.

No se persistieron valores de proveedor, respuestas crudas, credenciales ni PII. No hubo writes, deletes, imports, deploy, producción ni pagos.

Evidencia:

- run: `29282169628`;
- artifact: `canonical-materialization-provider-compare-r16e-report`;
- digest: `sha256:5c36a7f22d84c8ccc0326606dd52e2932f0203a595d448bf3a932636e39dea46`;
- normalized plan SHA-256: `9c2b7932c6d0643c9dc701375a013de2439f24a7c2d0f658ba63d22d4c6161b3`.

## Estado

R16E queda `WAIT_FIRESTORE_READ_QUOTA`.

No se repetirán lecturas hasta disponibilidad de cuota. El workflow volvió a quedar manual-only y el marcador temporal fue eliminado.

## Avance Phase A

- desbloqueado el defecto contractual entre R16D y R16E;
- confirmado que la cadena llega al proveedor con seguridad cerrada;
- pendiente únicamente la cuota para obtener `create/update/noop/review`;
- Hosting DEV y smoke remoto siguen aprobados.

## Siguiente bloque seguro mientras espera cuota

Preparar y mantener la matriz de validación humana en plataforma para:

1. source-safe DEV;
2. materialización Firestore DEV;
3. Auth/roles;
4. operación integral;
5. preproducción.

No autoriza materialización ni writes.

## Clasificación

- **Reusable CXOrbia:** normalización contractual de planes y separación entre precheck, provider compare y materialización.
- **Exclusivo cliente:** plan TyA/Cinépolis 1,415 operaciones y sus colas.
- **Claude/prototipo:** sin P0 nuevo; no modificar frontend.
- **Academia:** explicar qué verifica cada checkpoint y por qué una cuota bloquea backend, no la build.
- **Sin impacto Claude:** cuota, service account, workflow y artifacts.
