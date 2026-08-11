# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Sin cambios a cursos/rutas/certificaciones/UI.

Provider snapshot sigue PASS: Auth228; A reusable por owner-binding independiente; B/C/D canonical nuevos; R4 Cliente exacto; budget Auth14/Firestore16/deletes0; rollback PASS.

Exact-write autorizado se detuvo antes del primer provider write: `PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B`; privacidad criptográfica PASS, resolución identidad FAIL, Auth/Firestore writes0, deletes0, deploy/merge/producción0.

Lección reusable: SHA-256 compara sin exponer, pero un digest one-way no reemplaza el dato vivo cuando debe materializarse. Debe existir canal privado recuperable; si no se recupera el dato exacto, detener antes de escribir en vez de inferirlo.

Usuarios & Permisos pendiente hasta bootstrap PASS; no fallback/hardcode. HR M6 cerrado.

**Impacto Academia:** conceptual/no bloqueante. **Phase A84%.**
