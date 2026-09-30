# PENDIENTES PROTOTIPO — C6 Deterministic Suffix Read-only HOLD

**Fecha:** 2026-08-05

## Bloqueantes vigentes

### P0 operacional — identidad Shopper no materializable

- 12 perfiles activos continúan sin apellido técnico source-safe suficiente;
- un perfil continúa con dos candidatos Auth empatados;
- el plan de 340 filas mantiene 13 `HOLD` y no puede ejecutarse parcialmente;
- Auth repair y Hosting DEV permanecen bloqueados.

### Baseline corregido

El completado de 71 apellidos reveló que el universo real de colisiones es:

```text
65 grupos
142 identidades activas
```

Este baseline reemplaza el conteo provisional de 64/141.

## Hallazgos no bloqueantes

- la regla determinística distribuye 90 sufijos de 4 caracteres;
- 52 grupos conservan un titular técnico inequívoco sin sufijo;
- 13 grupos reciben sufijo en todas sus identidades;
- no hubo colisiones que exigieran 6 u 8 caracteres;
- no hubo target logins duplicados.

## Prohibiciones

- no inferir los 12 apellidos solo por posición visual;
- no elegir el candidato multi-Auth por antigüedad, orden o nombre;
- no ejecutar solo las 327 filas sin HOLD;
- no crear usuarios, modificar emails/claims/contraseñas o desplegar;
- no abrir una segunda ejecución provider con la autorización consumida.

## Siguiente acción

Construir source-only una matriz de evidencia adicional para:

1. los 12 perfiles con apellido pendiente;
2. los dos candidatos del perfil multi-Auth;
3. la comprobación estática de que cualquier futura resolución conserva el plan de 340 filas sin solapamiento.

Después se requiere nueva autorización expresa para una única revalidación provider read-only.
