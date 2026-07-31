# Academia — impacto Corte 6 perfil Shopper + continuidad de sesión protegida

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- provider compare read-only → write-plan → autorización one-shot → drift gate → write → readback;
- separar carril source-safe del carril autenticado/protegido;
- diferenciar autenticación inicial real de persistencia de sesión de QA;
- una sesión autenticada ya validada puede persistirse en el navegador sin embebir credenciales ni omitir claims/Rules;
- usar persistencia adecuada para evitar repetir el gate de credenciales en cada ciclo de validación humana;
- mantener identidades no resolubles en HOLD;
- un PASS técnico no reemplaza validación visual humana.

## Caso Corte6
Perfil:151 registros;120 exactos;31 HOLD;329 valores. Write PASS:120 documentos,118 field-change +2 marker-only, readback120/329, mismatches0.

Protected Hosting DEV anterior: deploy técnico PASS. Sin embargo, la validación humana reveló un nuevo P0 de flujo: Administración/Coordinación volvió a pedir Usuario/Contraseña porque el runtime y browser-auth utilizaban persistencia `SESSION`.

## Corrección reusable
Se preparó `backend-protected-dev-session-continuity.js`, protected-only, que fuerza Firebase Auth `LOCAL` y permite restaurar silenciosamente una sesión ya validada. No contiene usuario/password/token/UID, no bypass claims/Rules y no cambia el logout explícito.

## Impacto en manuales/cursos/rutas
- Admin/operación: autenticarse una vez y mantener sesión entre refresh de validación, salvo logout explícito.
- Shopper: misma regla; identidad continúa determinada por custom claims + shopperId.
- Backend: protected auth → session continuity → Firestore/RBAC → visual.
- Seguridad: persistencia no significa exposición de credenciales; la autoridad sigue siendo Firebase Auth.
- QA: evitar que la mecánica del gate técnico se convierta en reproceso de cada validación visual.

## Siguiente hito didáctico
Redeploy DEV one-shot del fix de continuidad → remote smoke → autenticación una vez → refresh sin re-prompt → validación humana Admin+Shopper. Todavía no producción.
