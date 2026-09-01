# RESUMEN PARA CLAUDE — C6 residual identity root-cause source-only

## Sin cambios frontend

No tocar `/app/modules`, `/app/core`, Login, diseño ni `CX.data` por este bloque.

## Diagnóstico que debe respetarse

```text
12 technical_surname_unresolved = evidencia insuficiente; no probaron colisión ni alias
1 multi_auth_tie_residual = C6 confirmado y STOP_RETRY
83 = 71 completados por consenso + 12 restantes
65/142 vs 64/141 = cambio de regla + gate agregado rígido defectuoso
```

Los 12 HOLD no autorizan inventar apellidos, alterar nombres visibles ni añadir campos técnicos en UI. El origen exacto de incompletitud no está exportado en el artifact actual.

## Pendiente backend, no Claude

- separar primer nombre, apellido y semilla de contraseña en diagnóstico source-safe;
- exponer conteos/bases sin PII;
- exponer vector de señales multi-Auth sin UID/correo;
- reconciliar grupos por fingerprint estable, no por igualdad agregada `64`.

## Academia y manuales

No publicar `64/141` ni `65/142` como baseline definitivo. Solo registrar que existe una reclasificación metodológica pendiente de contrato diagnóstico.
