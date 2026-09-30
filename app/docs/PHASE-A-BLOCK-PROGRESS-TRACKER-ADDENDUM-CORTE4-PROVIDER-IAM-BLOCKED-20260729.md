# PHASE A TRACKER — Corte 4 provider IAM — 2026-07-29

## Cerrado

- M1: FROZEN/APROBADO.
- Corte 1: FROZEN/APROBADO.
- Corte 2A: FROZEN/APROBADO.
- Corte 3: FROZEN/ACTIVE_BASELINE.

## Corte 4

Estado: `READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED`.

### Completado

- contrato y guard `CX.data` read-only;
- backend vacío fail-closed;
- cero fallback demo;
- Rules candidate no desplegado;
- gate estático PASS;
- exclusión de `cxorbia-backend-dev` por no ser nuevo/vacío;
- preflight de credenciales;
- OAuth nativo y timeouts;
- probe read-only;
- intento de creación atómica no-reuse.

### Bloqueo probado

La única service account válida disponible no tiene permiso para crear/verificar `cxorbia-tya-dev-260729-c4`.

- probe: `TARGET_PROJECT_PERMISSION_DENIED_C4`;
- atomic create: `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`;
- projectCreated=false;
- firebaseAdded=false;
- existingDatabaseReused=false.

### Pendiente vivo

1. resolver IAM project creator;
2. crear/verificar proyecto nuevo y vacío;
3. config web DEV;
4. Rules read-only DEV;
5. activar lectura;
6. smoke `CX.data`.

## Siguientes cortes

- Corte 5: materialización dry-run/idempotencia.
- Corte 6: Auth/RBAC.
- Corte 7: sync/evidencias/Make/Gemini gates.
- Corte 8: preproducción/producción.

## Estado seguro

PR #7 draft/open/no merge; sin producción, activación, Rules deploy, imports ni writes de datos.
