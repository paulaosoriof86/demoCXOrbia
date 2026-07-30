# PLANTILLA-RESULTADO-VALIDACION-REGLAS-DEV.md

## Objetivo

Plantilla para registrar resultados cuando se validen reglas en DEV o Rules Playground.

Este archivo no ejecuta pruebas.

## Estado de ejecución

```text
Fecha:
Responsable:
Ambiente:
Reglas publicadas: no/sí
Seed usado: no/sí
Usuarios reales usados: no/sí
Producción tocada: no/sí
```

## Resultado general

```text
P0 aprobados:
P1 aprobados:
Fallos:
Bloquea avance: sí/no
```

## Tabla de casos

| Caso | Rol | Ruta | Acción | Esperado | Resultado | Nota |
|---|---|---|---|---|---|---|
| 1 | sin sesión | `/tenants/tya` | read | deny | pendiente |  |
| 2 | admin | `/tenants/tya` | read | allow | pendiente |  |
| 3 | otro tenant | `/tenants/tya` | read | deny | pendiente |  |
| 4 | ops | `/finance/m01` | read | deny | pendiente |  |
| 5 | shopper | shopper ajeno | read | deny | pendiente |  |
| 6 | shopper | visita disponible asignada al proyecto | read | allow | pendiente |  |
| 7 | shopper sin proyecto | visita disponible | read | deny | pendiente |  |
| 8 | cliente | finance | read | deny | pendiente |  |
| 9 | cliente | postulations | read | deny | pendiente |  |
| 10 | auditLogs | update/delete | write | deny | pendiente |  |

## Hallazgos

```text
- 
```

## Decisión posterior

```text
[ ] mantener bloqueado
[ ] ajustar reglas
[ ] repetir validación
[ ] avanzar a usuarios DEV ficticios
[ ] avanzar a seed ficticio con autorización
```

## Confirmación de seguridad

```text
No se tocó producción.
No se cargaron datos reales.
No se activó adapter.
No se modificó UI.
```
