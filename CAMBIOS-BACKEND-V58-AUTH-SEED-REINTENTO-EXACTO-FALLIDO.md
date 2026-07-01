# CXOrbia - Reintento Auth exacta seed V58 fallido

Fecha: 2026-07-01 03:23 local
Rama: `release/cxorbia-tya-rc-20260630`

## Resultado

El reintento de carga del seed piloto ficticio V58 no escribió datos en Firestore.

Validaciones completadas OK:

- Schema validator.
- Seed validator.
- Loader validator.
- Repositorio correcto `paulaosoriof86/demoCXOrbia`.
- Rama correcta `release/cxorbia-tya-rc-20260630`.
- Helper local `app/core/backend-dev-auth.local.js` existe, está ignorado y no está versionado.
- Carpeta local ignorada `firebase/auth-dev-tools/output` existe.

Fallo:

- El runner local no pudo recuperar password DEV por método exacto.
- Archivos locales revisados: 4.
- No se imprimieron secretos.
- No se hizo deploy.
- No se tocó producción.
- No se tocó Orbit.
- No se cargaron datos reales.

## Causa probable

Los archivos locales ignorados disponibles no tienen la estructura histórica esperada:

- `sharedPassword` en JSON con lista `users` que contenga `admin.tya.dev@cxorbia-dev.example.com`, o
- bloque MD explícito de password compartido para ese usuario.

El intento anterior con `near-string` encontró una cadena cercana, pero Auth DEV devolvió HTTP 400, por lo que no debe reutilizarse ese método como si fuera confiable.

## Siguiente estrategia segura

Usar un runner local que:

1. Extraiga candidatos de password únicamente desde archivos locales ignorados.
2. No imprima ningún candidato.
3. Pruebe login de forma controlada contra Firebase Auth DEV con `admin.tya.dev@cxorbia-dev.example.com`.
4. Seleccione solo el candidato que autentique correctamente.
5. Ejecute el loader como proceso hijo.
6. Si ningún candidato autentica, reporte estructura de archivos revisados sin secretos.

## Impacto frontend

Ninguno.

No se tocaron:

- `/app/modules`.
- `app/index.html`.
- `app/index-backend-dev.html`.
- UI/prototipo.
