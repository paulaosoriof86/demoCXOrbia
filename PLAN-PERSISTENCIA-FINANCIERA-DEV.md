# PLAN-PERSISTENCIA-FINANCIERA-DEV.md

## Objetivo

Preparar la fase de persistencia financiera en DEV sin modificar UI ni activar backend real todavía.

## Alcance

Cubre movimientos vinculados a:

```text
pagos de visitas
lotes
liquidaciones
movimientos de egreso
auditoría de pagos
```

## Excluido por ahora

```text
datos bancarios reales
cuentas bancarias
NDA
documentos personales
comprobantes reales
evidencias reales
```

## Precondiciones

1. Confirmar base `main` aprobada o estabilizar PR #1.
2. Validar reglas Firestore en DEV.
3. Cargar seed ficticio con autorización.
4. Activar adapter básico en DEV controlado.
5. Confirmar que visitas, postulaciones y shoppers renderizan correctamente.
6. Definir si `CX.finStore` es interfaz estable.
7. Mantener `finance` restringido a `admin` y `super`.

## Fases

### Fase A — Documental

Estado actual. Solo documentación:

```text
MAPEO-FINSTORE-FIRESTORE.md
PLAN-PERSISTENCIA-FINANCIERA-DEV.md
```

### Fase B — Adapter financiero desactivado

Crear archivo nuevo cuando corresponda:

```text
app/core/backend-finance.js
```

Debe iniciar desactivado y no tocar módulos.

### Fase C — Lectura DEV

Leer, cuando se autorice, desde:

```text
/tenants/{tenantId}/projects/{projectId}/finance
/tenants/{tenantId}/projects/{projectId}/liquidations
/tenants/{tenantId}/projects/{projectId}/lots
```

### Fase D — Escritura controlada

Persistir movimientos de pago evitando duplicados mediante claves naturales de lote, país, fecha y visitas.

## Seguridad

```text
admin/super: leer y escribir finance
ops: no leer finance
cliente: no leer finance
shopper: no leer finance
```

Las reglas actuales ya restringen `finance` a administración.

## Validaciones mínimas

```text
[ ] pago de lote no duplica movimiento
[ ] monto conserva signo correcto
[ ] país y moneda quedan registrados
[ ] visitas liquidadas conservan fechaPago
[ ] movimiento financiero referencia lote o visitas
[ ] finance no es visible para ops, cliente ni shopper
```

## Pendiente para frontend

Si el módulo de finanzas espera datos desde `CX.finStore` y no desde `CX.data`, se debe documentar para Claude. No se debe modificar `/app/modules` dentro del PR backend.

## Estado

```text
Plan creado: sí
Código creado: no
Adapter financiero activo: no
Firestore escrito: no
Producción tocada: no
```
