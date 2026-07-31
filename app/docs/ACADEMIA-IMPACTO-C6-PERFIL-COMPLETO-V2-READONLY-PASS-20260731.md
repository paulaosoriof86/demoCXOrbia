# Academia — impacto Corte 6 perfil Shopper + human visual sin credenciales técnicas

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- provider compare read-only → write-plan → autorización one-shot → drift gate → write → readback;
- separar human visual de provider Auth cuando el usuario de QA no dispone de credenciales técnicas;
- preservar el auto-entry del prototipo para validación humana;
- usar un proxy server-side read-only con token temporal opaco para exponer únicamente en DEV el perfil completo autorizado;
- mantener Firebase Auth/claims/Rules como gate técnico separado, no como obstáculo de cada visualización;
- mantener identidades no resolubles en HOLD;
- un PASS técnico no reemplaza validación visual humana.

## Caso Corte6
Perfil:151 registros;120 exactos;31 HOLD;329 valores. Write PASS:120 documentos,118 field-change +2 marker-only, readback120/329, mismatches0.

La visual humana confirmó que Paula no posee credenciales Firebase y que exigirlas contradecía el contrato de QA ya existente. La persistencia LOCAL del protected runtime puede ser válida técnicamente, pero no resuelve un requisito humano que nunca debió existir.

## Corrección reusable preparada
- `dev-visual.mjs`: lectura Firestore server-side read-only en el Cloud Run existente, token temporal, sin token=401;
- `tya-dev-full-visual-bridge.js`: perfil completo en memoria sin browser Firebase login;
- auto-entry Admin y picker DEV de shopper real preservados desde el prototipo;
- source-safe default permanece separado;
- no se tocan módulos UI.

## Impacto en manuales/cursos/rutas
- Admin/operación QA: entrar por rol sin credenciales técnicas y revisar perfil completo mediante sesión visual temporal.
- Shopper QA: elegir identidad real existente desde el picker DEV y validar módulos propios.
- Backend: human visual token → proxy server-side → Firestore read-only → bridge CX.data.
- Seguridad: token crudo no se commitea, expira y el endpoint falla cerrado sin él.
- Auth: Firebase Auth/claims/Rules siguen siendo autoridad del producto y se prueban en gate técnico separado.

## Clasificación
- **Reusable CXOrbia:** separación human QA/provider Auth + proxy read-only con sesión visual temporal.
- **Exclusivo cliente:** 31 identidades HOLD TyA.
- **Claude/prototipo:** sin rediseño; mantener UI aprobada.
- **Academia:** actualizar material sobre autenticación técnica vs acceso humano de QA.
- **Sin impacto Claude:** runtime/backend/adapters DEV, request/workflow y evidencia.

## Siguiente hito didáctico
Autorizar 1x Cloud Run DEV +1x Hosting DEV del fix → smoke remoto → human visual Admin+Shopper sin credenciales técnicas → freeze Corte6. Todavía no producción.
