# RESULTADO-EMULADOR-REGLAS-FIRESTORE.md

## Objetivo

Registrar el avance autorizado para validar reglas Firestore con emulador local.

## Resultado de esta ejecución

```text
Emulador ejecutado desde ChatGPT: no
Motivo: el entorno de ChatGPT no tiene Firebase CLI instalado ni dependencias @firebase/rules-unit-testing disponibles localmente.
Reglas publicadas: no
Datos reales usados: no
Usuarios creados: no
Claims asignados: no
Seed cargado: no
Adapter activo: no
Producción tocada: no
```

## Trabajo realizado en este gate

Se creó el paquete de pruebas para ejecutar el emulador localmente:

```text
firebase/emulator-rules/package.json
firebase/emulator-rules/firestore.rules.test.js
firebase/emulator-rules/README.md
```

## Casos P0 cubiertos por el test

```text
1. sin sesión no lee tenant
2. otro tenant no lee tya
3. shopper no lee otro shopper
4. shopper con proyecto lee visita disponible
5. shopper sin proyecto no lee visita disponible
6. cliente no lee finance
7. cliente no lee postulations
8. ops no lee finance
9. auditLogs no permite update/delete
```

## Comando previsto para ejecución local

```powershell
cd firebase\emulator-rules
npm install
npm run test:rules
```

## Decisión

```text
[ ] publicar reglas
[ ] crear usuarios DEV
[ ] cargar seed ficticio
[ ] activar adapter
[x] mantener bloqueado hasta corrida real del emulador
```

## Confirmación de seguridad

```text
No se publicaron reglas.
No se crearon usuarios.
No se asignaron claims.
No se cargó seed.
No se activó adapter.
No se tocó producción.
```
