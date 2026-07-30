# RESULTADO-PUBLICACION-REGLAS-DEV.md

## Fecha

2026-06-28

## Gate autorizado

Paula autorizó publicar reglas Firestore únicamente en Firebase DEV, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.

## Alcance ejecutado

Se ejecutó únicamente:

```text
firebase.cmd deploy --only firestore:rules --project cxorbia-backend-dev
```

## Resultado observado por salida de PowerShell

```text
=== Deploy SOLO reglas Firestore a DEV ===
=== Deploying to 'cxorbia-backend-dev'...

i  deploying firestore
i  firestore: ensuring required API firestore.googleapis.com is enabled...
+  firestore: required API firestore.googleapis.com is enabled
i  firestore: ensuring required API firestore.googleapis.com is enabled...
+  firestore: required API firestore.googleapis.com is enabled
i  firestore: reading indexes from firestore.indexes.json...
i  cloud.firestore: checking firestore.rules for compilation errors...
!  [W] 51:14 - Unused function: canAccessProject.
+  cloud.firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
+  firestore: released rules firestore.rules to cloud.firestore

+  Deploy complete!
```

## Confirmaciones

- Firebase DEV activo: `cxorbia-backend-dev`.
- Reglas Firestore publicadas en DEV.
- `firestore.rules` compiló correctamente.
- No se publicó Hosting.
- No se creó ningún usuario Auth.
- No se asignaron claims.
- No se cargó seed ficticio.
- No se escribieron datos reales.
- No se activó `CX.BACKEND.enabled`.
- No se tocó producción T&A.
- No se modificó `/app/modules`.

## Advertencia detectada

Firebase reportó:

```text
[W] 51:14 - Unused function: canAccessProject.
```

La advertencia no bloqueó la publicación. Se debe revisar en una fase posterior de limpieza de reglas, sin cambiar permisos funcionales todavía.

## Estado del repo local reportado por PowerShell

Después del deploy, PowerShell mostró archivos locales no versionados:

```text
?? firebase/emulator-rules/node_modules/
?? firebase/emulator-rules/package-lock.json
```

Estos archivos son resultado del entorno local de validación/emulador y no forman parte del gate publicado. Deben limpiarse o excluirse localmente antes de nuevos commits desde PowerShell.

## Cierre del gate

Gate de publicación de reglas DEV: completado.

Siguiente gate posible, no autorizado todavía: preparar/crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin seed, sin adapter y sin producción.