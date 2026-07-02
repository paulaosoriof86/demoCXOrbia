# CHECKLIST-EJECUCION-RAPIDA-DEV.md

## Objetivo

Checklist resumido para próximos gates.

## Antes de cualquier gate

```text
[ ] PR #1 sigue draft
[ ] no merge
[ ] no deploy producción
[ ] no datos reales
[ ] no Storage real
[ ] no app/modules tocados
```

## Secuencia recomendada

```text
1. emulador reglas
2. publicar reglas DEV
3. usuarios DEV ficticios + claims
4. seed ficticio DEV
5. adapter DEV controlado
6. validación visual con datos ficticios
7. decisión sobre sync con main
```

## Evidencia por gate

```text
RESULTADO-EMULADOR-REGLAS-FIRESTORE.md
RESULTADO-PUBLICACION-REGLAS-DEV.md
RESULTADO-USUARIOS-CLAIMS-DEV.md
RESULTADO-SEED-FICTICIO-DEV.md
RESULTADO-ADAPTER-DEV.md
RESULTADO-SYNC-MAIN-PR1.md
```

## Bloqueos vigentes

```text
producción bloqueada
base buena real bloqueada
Storage real bloqueado
datos sensibles bloqueados
merge bloqueado
```
