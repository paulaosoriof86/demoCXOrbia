# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Sin cambios a cursos/rutas/certificaciones/UI.

Provider snapshot sigue PASS: Auth 228; A reusable por owner-binding independiente; B/C/D canonical nuevos; R4 Cliente exacto; budget Auth14/Firestore16/deletes0; rollback dry-run PASS.

Exact-write autorizado se detuvo antes del primer provider write: `PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B`; privacidad criptográfica PASS, resolución de identidad FAIL, Auth/Firestore writes 0, deletes 0, deploy/merge/producción 0.

Lección reusable: SHA-256 permite comparar sin exponer, pero un digest one-way no reemplaza el dato vivo cuando una operación posterior debe materializarlo. Debe existir canal privado recuperable y gobernado; si no se recupera el dato exacto, el sistema se detiene antes de escribir en vez de inferirlo.

Usuarios & Permisos sigue pendiente hasta bootstrap PASS; no fallback/hardcode. M6 HR permanece cerrado.

**Impacto Academia:** conceptual/documental, no bloqueante. **Phase A 84%.**
