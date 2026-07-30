# RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-REGLAS-DEV-PUBLICADAS.md

## Contexto

Este addendum documenta el gate ejecutado después de las validaciones locales de reglas Firestore.

## Gate autorizado por Paula

```text
Autorizo publicar reglas Firestore únicamente en Firebase DEV, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.
```

## Qué quedó funcionando

- Firestore rules fueron publicadas correctamente en Firebase DEV `cxorbia-backend-dev`.
- El comando ejecutado fue exclusivamente:

```text
firebase.cmd deploy --only firestore:rules --project cxorbia-backend-dev
```

- Firebase confirmó:

```text
cloud.firestore: rules file firestore.rules compiled successfully
firestore: released rules firestore.rules to cloud.firestore
Deploy complete!
```

## Qué NO se hizo

- No se publicó Hosting.
- No se creó ningún usuario Auth.
- No se asignaron claims.
- No se cargó seed ficticio.
- No se cargaron datos reales.
- No se activó `CX.BACKEND.enabled`.
- No se tocó `/app/modules`.
- No se tocó producción T&A.
- No se hizo merge.

## Advertencia observada

Durante la publicación Firebase reportó:

```text
[W] 51:14 - Unused function: canAccessProject.
```

La advertencia no bloqueó la publicación. Claude puede revisar si conviene limpiar esa función en `firestore.rules`, pero no debe cambiar permisos ni comportamiento sin revisar la matriz de roles.

## Archivos locales no versionados observados

Después del deploy, PowerShell mostró:

```text
?? firebase/emulator-rules/node_modules/
?? firebase/emulator-rules/package-lock.json
```

Estos archivos no son parte del backend ni deben commitearse. Recomiendo limpiarlos o excluirlos antes de nuevos commits hechos desde PowerShell.

## Siguiente gate sugerido

Preparar usuarios DEV ficticios y claims, sin ejecutar hasta autorización separada.

Frase de autorización documentada:

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```

## Regla vigente

El prototipo manda. No tocar `/app/modules`, no rediseñar UI y mantener `CX.BACKEND.enabled=false` hasta gate explícito de adapter DEV.