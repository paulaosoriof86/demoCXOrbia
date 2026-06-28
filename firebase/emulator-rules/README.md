# Firestore rules emulator tests

## Objetivo

Ejecutar localmente los P0 de reglas Firestore sin publicar reglas ni tocar Firebase real.

## Comando previsto

```powershell
cd firebase\emulator-rules
npm install
npm run test:rules
```

## Qué prueba

```text
sin sesión no lee tenant
otro tenant no lee tya
shopper no lee otro shopper
shopper con proyecto lee visita disponible
shopper sin proyecto no lee visita disponible
cliente no lee finance
cliente no lee postulations
ops no lee finance
auditLogs no permite update/delete
```

## Seguridad

```text
no publica reglas
no crea usuarios
no asigna claims reales
no carga seed real
no activa adapter
no toca producción
```
