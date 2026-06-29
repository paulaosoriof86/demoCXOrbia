# PLAN-DRY-RUN-SEED-TYA-ACTUALIZADO.md

## Autorización recibida

```text
Autorizo validar en dry-run el seed ficticio actualizado en Firebase DEV, sin escribir datos, sin activar adapter, sin deploy de Hosting y sin tocar producción.
```

## Objetivo

Validar localmente el seed ficticio actualizado de T&A antes de escribir cualquier dato en Firestore DEV.

## Alcance permitido

- Leer `firebase/seed-tya-piloto.json`.
- Validar estructura tenant > cuenta > proyecto > visita.
- Validar referencias internas: cuentas, proyectos, shoppers, visitas, postulaciones y cuestionarios.
- Mostrar rutas Firestore simuladas.
- Confirmar Firebase CLI contra DEV solo como verificación de contexto.

## Alcance bloqueado

- No escribir datos en Firestore.
- No cargar seed.
- No activar adapter.
- No hacer deploy de Hosting.
- No tocar producción.
- No modificar `/app/modules`.

## Script preparado

```text
firebase/validate-seed-dry-run.cjs
```

Requiere variable local de autorización:

```text
CXORBIA_SEED_DRY_RUN_APPROVED=YES_PAULA_20260628_SEED_DRY_RUN
```

## Criterio de cierre

El dry-run se considera exitoso si PowerShell muestra:

```text
Validaciones: OK
== Dry-run seed TYA actualizado finalizado ==
```

Después debe registrarse el resultado en:

- `RESULTADO-DRY-RUN-SEED-TYA-ACTUALIZADO.md`
- `CAMBIOS-BACKEND.md`
- `ESTADO-GATES-PR1.md`
- `RESUMEN-PARA-CLAUDE.md` o addendum correspondiente

## Siguiente gate posterior

Si el dry-run queda correcto, el siguiente gate posible será escritura del seed ficticio en Firestore DEV, pero solo con autorización separada de Paula.
