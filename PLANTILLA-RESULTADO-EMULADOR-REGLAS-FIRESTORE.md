# PLANTILLA-RESULTADO-EMULADOR-REGLAS-FIRESTORE.md

## Objetivo

Plantilla para registrar una futura validación de reglas con motor local.

## Estado de ejecución

```text
Fecha:
Responsable:
Motor local usado: sí/no
Reglas publicadas: no
Datos reales usados: no/sí
Producción tocada: no/sí
```

## Resultado general

```text
P0 aprobados:
Fallos:
Bloquea avance: sí/no
```

## Casos

| Caso | Esperado | Resultado | Nota |
|---|---|---|---|
| sin sesión no lee tenant | deny | pendiente |  |
| otro tenant no lee tya | deny | pendiente |  |
| shopper no lee otro shopper | deny | pendiente |  |
| shopper con proyecto lee visita disponible | allow | pendiente |  |
| shopper sin proyecto no lee visita disponible | deny | pendiente |  |
| cliente no lee finance | deny | pendiente |  |
| cliente no lee postulations | deny | pendiente |  |
| ops no lee finance | deny | pendiente |  |
| auditLogs no permite update/delete | deny | pendiente |  |

## Decisión

```text
[ ] mantener bloqueado
[ ] ajustar reglas
[ ] repetir validación
[ ] avanzar a publicación DEV
[ ] avanzar a usuarios DEV ficticios
```

## Seguridad

```text
No se tocó producción.
No se publicaron reglas.
No se cargaron datos reales.
No se activó adapter.
```
