# AUTORIZACION-PUBLICACION-REGLAS-DEV.md

## Objetivo

Definir la autorización requerida para publicar reglas Firestore solo en Firebase DEV.

## Frase requerida

```text
Autorizo publicar reglas Firestore únicamente en Firebase DEV, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.
```

## Alcance permitido con esa frase

```text
publicar firestore.rules en cxorbia-backend-dev
registrar resultado
no publicar hosting
no publicar storage
no crear usuarios
no asignar claims
no cargar seed
no activar adapter
no tocar producción
```

## Resultado esperado

```text
RESULTADO-PUBLICACION-REGLAS-DEV.md
```

## Siguiente gate

Después de publicar reglas DEV, se podrá preparar creación de usuarios DEV ficticios y claims con autorización separada.
