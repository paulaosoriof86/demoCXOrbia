# ACADEMIA — ADDENDUM C6 AUTH V4 ACTIVATION PASS + SMOKE STOP

**Fecha:** 2026-08-10

## Impacto pedagógico

Este bloque aporta un caso reutilizable para Academia sobre migración segura de identidad y diagnóstico por capas.

### Lección 1 — Gate antes de escribir

Antes de Auth writes deben comprobarse:

- sintaxis;
- contrato/freeze;
- circuit breaker;
- permisos efectivos mínimos;
- disponibilidad del material de rollback;
- snapshot cifrado y roundtrip.

En este bloque esos gates permitieron llegar a PREWRITE PASS con ocho entradas exactas de password antes del write boundary.

### Lección 2 — Readback no equivale a smoke multirol

La activación Auth DEV obtuvo readback PASS de 228 usuarios y rollback dry-run PASS. El smoke posterior falló por un archivo temporal de credencial inexistente antes de leer Auth.

La enseñanza debe distinguir:

1. fallo de Auth/proveedor;
2. fallo de claims o scopes;
3. fallo de aplicación/UI;
4. fallo de herramienta/harness de validación.

No se debe corregir UI ni reconstruir identidades cuando la evidencia apunta al harness.

### Lección 3 — Rollback verificable

El material de rollback debe quedar cifrado, con digest y roundtrip verificable. Para este bloque existen ocho restauraciones de password, con cinco casos dependientes de hashConfig del proveedor y tres casos legacy saltless exactos.

### Lección 4 — Estados honestos

Estado correcto:

```text
Auth DEV = PASS
readback = PASS
rollback dry-run = PASS
smoke multirol = PENDIENTE / STOP_RETRY POR HARNESS
producción = NO
```

No enseñar ni mostrar el bloque como producción cerrada hasta completar smoke y validación correspondiente.

## Rutas por rol a validar en el próximo smoke

- Admin/Operaciones: acceso y aislamiento de privilegios.
- Shopper: claim shopper, tenant/proyecto y acceso permitido.
- Cliente: membresía tenant/proyecto y exclusión de datos personales Shopper.

## Manuales/checklists a actualizar al cierre del smoke

- checklist de Auth migration;
- troubleshooting de credenciales de service account efímeras;
- claims/scopes y aislamiento multi-tenant;
- readback vs smoke vs validación visual;
- rollback dry-run;
- regla STOP_RETRY y no segundo intento automático.

## Seguridad académica

No incluir secretos, emails, UIDs, hashes, salts ni claims crudos en materiales. Usar fingerprints, conteos y ejemplos simulados.
