# AUTORIZACIONES-SIGUIENTES-GATES.md

## Objetivo

Centralizar frases de autorización para avanzar sin ambigüedad.

## Gates

### 1. Emulador local reglas

```text
Autorizo validar reglas Firestore con emulador local, sin publicar reglas, sin datos reales, sin activar adapter y sin tocar producción.
```

### 2. Publicar reglas en DEV

```text
Autorizo publicar reglas Firestore únicamente en Firebase DEV, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.
```

### 3. Usuarios DEV ficticios y claims

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```

### 4. Seed ficticio en DEV

```text
Autorizo escribir el seed ficticio T&A en Firestore DEV, sin datos reales, sin activar adapter y sin tocar producción.
```

### 5. Adapter DEV controlado

```text
Autorizo activar el adapter Firestore solo en DEV controlado, sin tocar producción y sin datos reales.
```

### 6. Sync controlado con main

```text
Confirmo que main es la base visual y funcional aprobada del prototipo. Autorizo preparar la sincronización controlada de PR #1, sin mergear ni desplegar.
```

## Nota

Cada frase autoriza solo el gate indicado. No autoriza producción, merge, base buena real ni datos sensibles.
