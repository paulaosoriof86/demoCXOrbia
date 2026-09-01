# RESUMEN PARA CLAUDE — C6 diagnostic v2 provider HOLD

## Sin cambios frontend

No modificar `/app/modules`, `/app/core`, Login ni `CX.data`.

## Estado backend relevante

```text
crosswalk 101/8 PASS
83 = 71 + 12 PASS
12 perfiles: first/passwordSeed completos, surname sin candidatos ni bases
1 multi-Auth: 2 candidatos, score 5016/5016, margin 0
fingerprint sets: reference 64, current 65, delta +1/-0
plan 340: HOLD 13, no ejecutable
```

No mostrar nombres, apellidos, logins, correos, UID ni señales internas en UI. No construir excepciones frontend para los HOLD.

## Pendiente para documentación funcional

La operación de Phase A sigue preservada. La próxima explicación técnica debe distinguir:

- apellido realmente no demostrado para 12 perfiles;
- empate Auth confirmado;
- un grupo añadido cuya procedencia aún no está exportada source-safe.
