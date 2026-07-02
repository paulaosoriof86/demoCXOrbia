# CXOrbia - Diagnóstico Auth seed V58 DEV

Fecha: 2026-07-01
Rama: `release/cxorbia-tya-rc-20260630`

## Contexto

Durante el intento de carga del seed piloto ficticio V58 en Firestore DEV/LAB:

- Los validadores de schema, seed y loader pasaron OK.
- El helper local ignorado `app/core/backend-dev-auth.local.js` existe, está ignorado y no está versionado.
- La credencial DEV fue localizada sin imprimirse.
- La autenticación contra Firebase Identity Toolkit devolvió HTTP 400.
- No se escribió en Firestore.
- No se hizo deploy.
- No se tocó producción.
- No se tocó Orbit.
- No se imprimieron secretos.

## Cambio aplicado en backend

Archivo modificado:

- `firebase/client-write-tools/load-cxorbia-v58-pilot-seed-dev.mjs`

Cambio:

- Se agregó diagnóstico seguro de error Auth Firebase (`firebaseAuthError`) cuando falla `accounts:signInWithPassword`.
- El diagnóstico muestra código/mensaje seguro de Firebase Auth sin imprimir password ni token.
- Se mantiene `secretPrinted: false`.

## Por qué

El reporte anterior solo mostraba `status: 400`, lo cual no permite distinguir entre:

- Password incorrecto o extraído de forma imprecisa.
- Usuario no existente o deshabilitado.
- API key/config incorrecta.
- Flujo de login no habilitado.
- Otro error de Auth DEV.

El siguiente intento debe devolver el detalle seguro de Firebase Auth y permitir corregir sin pedir ni pegar contraseñas.

## Impacto en frontend

Ninguno.

No se tocaron:

- `/app/modules`.
- `app/index.html`.
- `app/index-backend-dev.html`.
- UI/prototipo.

## Pendiente

Ejecutar nuevo bloque local robusto que:

1. Haga pull del commit nuevo.
2. Valide schema, seed y loader.
3. Ejecute un runner local fuera del repo.
4. No importe el loader dentro del mismo proceso; debe llamarlo como proceso hijo para evitar crash de Node por `process.exit`.
5. Recupere credencial local sin imprimirla.
6. Si Auth falla, reporte `firebaseAuthError` seguro.
7. Si Auth pasa, escriba únicamente el seed ficticio DEV.
8. Documente el resultado final en `CAMBIOS-BACKEND.md` solo si la carga queda OK.
