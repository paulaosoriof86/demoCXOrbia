# Academia — impacto Corte 6 perfil Shopper + human visual sin credenciales técnicas

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- provider compare read-only → write-plan → autorización one-shot → drift gate → write → readback;
- separar human visual de provider Auth cuando el usuario de QA no dispone de credenciales técnicas;
- preservar el auto-entry del prototipo para validación humana;
- usar proxy server-side read-only con sesión visual temporal opaca para exponer únicamente en DEV el perfil completo autorizado;
- mantener Firebase Auth/claims/Rules como gate técnico separado;
- mantener identidades no resolubles en HOLD;
- un PASS técnico no reemplaza validación visual humana.

## Caso Corte6
Perfil:151 registros;120 exactos;31 HOLD;329 valores. Write PASS:120 documentos,118 field-change +2 marker-only, readback120/329, mismatches0.

## Human full visual no-credential — ejecutado PASS
Authorization `chat-20260731-corte6-human-full-visual-no-credential-01` consumida.
-1 Cloud Run DEV redeploy existente, revisión `cxorbia-live-hr-dev-00009-xs8`.
-1 Hosting DEV redeploy existente.
-Decisión `PASS_EXISTING_DEV_CLOUD_RUN_HOSTING_NO_CREDENTIAL_FULL_VISUAL_REMOTE_READY`.
-Full-profile falla cerrado401 sin sesión visual.
-Auto-entry Admin, picker Shopper DEV y source-safe default preservados.
-Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0 durante el gate.

## Impacto en manuales/cursos/rutas
- Admin/operación QA: entrar por rol sin credenciales técnicas y revisar perfil completo mediante sesión visual temporal.
- Shopper QA: elegir identidad real existente desde el picker DEV y validar módulos propios.
- Backend: human visual token → proxy server-side → Firestore read-only → bridge CX.data.
- Seguridad: token crudo no se commitea, expira y el endpoint falla cerrado sin él.
- Auth: Firebase Auth/claims/Rules siguen siendo autoridad del producto y se prueban en gate técnico separado.

## Clasificación
- **Reusable CXOrbia:** separación human QA/provider Auth + proxy read-only con sesión temporal.
- **Exclusivo cliente:** 31 identidades HOLD TyA.
- **Claude/prototipo:** sin rediseño; mantener UI aprobada.
- **Academia:** actualizar material sobre autenticación técnica vs acceso humano QA.
- **Sin impacto Claude:** runtime/backend/adapters DEV, deploy y evidencia.

## Siguiente hito didáctico
Human visual Admin+Shopper sin credenciales → PASS/FAIL → resolver/decidir31 HOLD → freeze Corte6. Todavía no producción.
