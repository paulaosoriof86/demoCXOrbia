# RESULTADO-VALIDACION-REGLAS-DEV.md

## Objetivo

Registrar la validación autorizada de reglas Firestore sin publicar reglas, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.

## Alcance ejecutado

Validación lógica sobre `firestore.rules` usando claims y rutas ficticias documentadas.

No se usó Firebase Console ni se publicó nada. Esta validación no sustituye una corrida posterior en Rules Playground o emulador, pero sí verifica la coherencia de accesos esperados contra el archivo de reglas del PR.

## Estado de ejecución

```text
Fecha: 2026-06-27
Ambiente: revisión lógica sobre rama feat/firebase-backend-dev-config-20260627
Reglas publicadas: no
Seed usado: no
Usuarios reales usados: no
Claims reales usados: no
Adapter activo: no
Producción tocada: no
```

## Resultado general

```text
P0 evaluados: 9
P0 aprobados por revisión lógica: 9
Fallos P0 detectados: 0
Bloquea avance documental: no
Bloquea publicación directa: sí, falta Rules Playground o emulador antes de publicar
```

## Tabla de casos P0

| Caso | Rol / claims | Ruta | Acción | Esperado | Resultado lógico | Nota |
|---|---|---|---|---|---|---|
| 1 | sin sesión | `/tenants/tya` | read | deny | pass | `signedIn()` falla y deny by default cubre accesos no autorizados |
| 2 | admin otro tenant | `/tenants/tya` | read | deny | pass | `tenantAllowed(tya)` falla si `tenantId` no coincide |
| 3 | shopper eval-01 | `/tenants/tya/shoppers/eval-02` | read | deny | pass | `isOwnShopper(eval-02)` falla |
| 4 | shopper eval-01 con proyecto | visita disponible `tya-piloto-v01` | read | allow | pass | `isAvailableVisitForShopper(projectId)` permite solo si proyecto asignado y estado disponible |
| 5 | shopper eval-01 sin proyecto | visita disponible `tya-piloto-v01` | read | deny | pass | `projectAssigned(projectId)` falla |
| 6 | cliente tya | `/finance/m01` | read | deny | pass | finance requiere `isAdmin()` |
| 7 | cliente tya | `/postulations/post-01` | read | deny | pass | postulations solo operator u ownResource |
| 8 | ops tya | `/finance/m01` | read | deny | pass | finance requiere `isAdmin()` y ops no cumple |
| 9 | auth tya | `/auditLogs/log-01` | update/delete | deny | pass | update/delete está en false |

## Observaciones técnicas

1. La regla de visitas disponibles para shopper está alineada con el flujo de postulación.
2. Finance queda restringido a admin/super, consistente con la matriz de roles.
3. Cliente no tiene lectura de finance ni postulations.
4. Ops no tiene lectura de finance.
5. Audit logs permiten create para usuarios del tenant, pero no update/delete.

## Riesgos pendientes

```text
validar sintaxis exacta en Rules Playground o emulador
validar precedencia de expresiones en motor Firebase
validar datos resource.data reales cuando exista seed
validar list queries con filtros compatibles con reglas
validar índices si aparecen consultas compuestas
```

## Decisión posterior

```text
[ ] publicar reglas
[ ] crear usuarios DEV
[ ] asignar claims DEV
[ ] cargar seed ficticio
[x] mantener bloqueado para acciones reales
[x] repetir en Rules Playground o emulador antes de publicación
```

## Confirmación de seguridad

```text
No se publicaron reglas.
No se crearon usuarios.
No se asignaron claims.
No se cargó seed.
No se activó adapter.
No se tocó producción.
```
