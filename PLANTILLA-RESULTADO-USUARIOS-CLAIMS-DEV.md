# PLANTILLA-RESULTADO-USUARIOS-CLAIMS-DEV.md

## Fecha

Pendiente de ejecución.

## Gate autorizado

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```

## Resultado PowerShell

Pegar salida desde:

```text
== Auth DEV usuarios y claims ==
```

hasta:

```text
== Usuarios DEV y claims finalizados ==
```

## Usuarios esperados

| Clave | Email ficticio | Estado | UID | Claims verificados |
|---|---|---|---|---|
| super | `super.dev@cxorbia-dev.example.com` | pendiente | pendiente | pendiente |
| admin | `admin.tya.dev@cxorbia-dev.example.com` | pendiente | pendiente | pendiente |
| ops | `ops.tya.dev@cxorbia-dev.example.com` | pendiente | pendiente | pendiente |
| shopper | `shopper.eval01.dev@cxorbia-dev.example.com` | pendiente | pendiente | pendiente |
| cliente | `cliente.tya.dev@cxorbia-dev.example.com` | pendiente | pendiente | pendiente |
| externo-denegacion | `externo.otro.dev@cxorbia-dev.example.com` | pendiente | pendiente | pendiente |

## Confirmaciones

- [ ] No se crearon usuarios reales.
- [ ] No se usaron correos personales.
- [ ] No se cargó seed.
- [ ] No se activó adapter.
- [ ] No se publicó Hosting.
- [ ] No se tocó producción.
- [ ] No se modificó `/app/modules`.
- [ ] El password DEV quedó solo en reporte local, no en GitHub.

## Siguiente gate posible

Seed ficticio en Firestore DEV, solo con autorización separada.
