# AUTORIZACION-EMULADOR-REGLAS-FIRESTORE.md

## Objetivo

Definir autorización para pasar de revisión lógica a validación con motor local.

## Alcance permitido con autorización

```text
usar reglas del PR
usar datos ficticios
probar casos P0
registrar resultado
no publicar reglas
no tocar producción
no activar adapter
no usar datos reales
```

## Frase requerida

```text
Autorizo validar reglas Firestore con emulador local, sin publicar reglas, sin datos reales, sin activar adapter y sin tocar producción.
```

## Resultado esperado

```text
RESULTADO-EMULADOR-REGLAS-FIRESTORE.md
```

## Siguiente gate

Si el emulador pasa, se decidirá si se publican reglas en DEV o si se preparan usuarios DEV ficticios.
