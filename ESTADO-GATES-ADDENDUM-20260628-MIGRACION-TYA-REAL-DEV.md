# ESTADO-GATES-ADDENDUM-20260628-MIGRACION-TYA-REAL-DEV.md

## Gate nuevo

Migración real T&A a Firestore DEV por piloto controlado.

## Estado

```text
Preparación pipeline: completada
Export real recibido: pendiente
Validación local export: pendiente
Transformación local: pendiente
Carga piloto DEV: pendiente de autorización expresa
Carga total: bloqueada
Producción: bloqueada
Hosting: bloqueado
Merge: bloqueado
```

## Archivos de soporte

- `PLAN-MIGRACION-TYA-REAL-DEV.md`
- `firebase/client-write-tools/validate-tya-real-export.mjs`
- `firebase/client-write-tools/transform-tya-real-export.mjs`
- `firebase/client-write-tools/load-tya-real-pilot-firestore-dev-sdk.mjs`
- `CAMBIOS-BACKEND-ADDENDUM-20260628-MIGRACION-TYA-REAL.md`
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-MIGRACION-TYA-REAL-DEV.md`

## Rutas locales privadas

```text
firebase/private-input/tya-export-real.json
firebase/private-output/
```

Estas rutas están en `.gitignore`.

## Condiciones para avanzar

1. Paula debe colocar o adjuntar el export limpio T&A en JSON UTF-8 sin BOM.
2. Primero se valida localmente, sin escribir Firestore.
3. Si la validación es aceptable, se transforma localmente.
4. La carga piloto DEV requiere autorización expresa separada.
5. La carga total sigue bloqueada hasta validar piloto.

## Bloqueos vigentes

- No producción.
- No Hosting.
- No merge.
- No adapter global.
- No Storage/evidencias.
- No modificación de `/app/modules`.
