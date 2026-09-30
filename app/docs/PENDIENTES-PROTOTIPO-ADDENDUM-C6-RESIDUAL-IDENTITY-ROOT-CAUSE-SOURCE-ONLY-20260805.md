# PENDIENTES PROTOTIPO — C6 residual identity root-cause source-only

## Pendientes reales

1. Corregir el contrato diagnóstico para separar:
   - `preConsensusIncompleteActiveProfiles`;
   - `completedByConsensus`;
   - `remainingIncompleteActiveProfiles`.
2. Desagregar los 12 HOLD sin PII en:
   - primer nombre disponible;
   - apellido disponible;
   - semilla de contraseña disponible;
   - cantidad de candidatos explícitos, técnicos y por consenso;
   - cantidad de bases y conflicto.
3. Para el multi-Auth, exportar vector de señales y margen por candidato sin UID, correo ni datos crudos.
4. Sustituir el gate rígido `collisionGroups === 64` por reconciliación de conjuntos con fingerprint estable entre versiones.
5. Recalcular únicamente después de source/static PASS y nueva autorización provider read-only.

## Bloqueos

- Los 12 fingerprints continúan HOLD por insuficiencia de evidencia, no por C6 demostrado.
- El multi-Auth continúa HOLD por C6 confirmado.
- El plan 340 continúa no ejecutable y no admite aplicación parcial.

## No pendientes de frontend

No existe ajuste autorizado para módulos, Login, diseño o `CX.data`.
