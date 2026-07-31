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

La validación humana detectó un P0 de flujo: Administración/Coordinación volvía a pedir Usuario/Contraseña porque el runtime y browser-auth utilizaban persistencia `SESSION`.

## Corrección reusable aplicada
`backend-protected-dev-session-continuity.js`, protected-only, fuerza Firebase Auth `LOCAL` y permite restaurar silenciosamente una sesión ya validada. No contiene usuario/password/token/UID, no bypass claims/Rules y no cambia el logout explícito.

Authorization `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida PASS.

Resultado técnico:
- exactamente1 redeploy del Hosting DEV existente;
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_SESSION_CONTINUITY_REMOTE_VERIFIED`;
- version `1e8c37163e7451be`;
- release `1785515981786000`;
- persistencia LOCAL y continuity asset verificados remotamente;
- protected runtime/Auth bridge/Firestore adapter/profile bridge/history KPI PASS;
- provider writes/deploys adicionales0; producción=false; merge=false.

## Impacto en manuales/cursos/rutas
- Admin/operación: autenticarse una vez y mantener sesión entre refresh de validación, salvo logout explícito.
- Shopper: misma regla; identidad continúa determinada por custom claims + shopperId.
- Backend: protected auth → session continuity → Firestore/RBAC → visual.
- Seguridad: persistencia no significa exposición de credenciales; la autoridad sigue siendo Firebase Auth.
- QA: evitar que la mecánica del gate técnico se convierta en reproceso de cada validación visual.

## Clasificación
- **Reusable CXOrbia:** persistencia protected QA + execute marker one-shot.
- **Exclusivo cliente:** 31 identidades HOLD TyA.
- **Claude/prototipo:** sin rediseño; mantener UI aprobada.
- **Academia:** actualizar ruta de autenticación inicial vs continuidad de sesión.
- **Sin impacto Claude:** evidencia, workflow y Hosting DEV.

## Siguiente hito didáctico
Una autenticación real → refresh sin re-prompt → validación humana Admin+Shopper. Todavía no producción.
