# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Este bloque no cambia cursos, rutas, certificaciones ni UI de Academia antes de producción.

Principios preservados: identidad/rol/alcance separados; `TyA completo` no es wildcard; scope explícito/editable; proyectos desde inventario vivo; audit/readback; disable antes de delete; no exponer credenciales/claims/fingerprints.

Provider snapshot focal sigue PASS: Auth 228; A reusable solo por owner-binding independiente; B/C/D requieren canonical nuevo; R4 Cliente canónico exacto; budget Auth=14 / Firestore=16 / deletes=0; rollback dry-run PASS.

## Lección del exact write fail-closed

El request exact-write autorizado se detuvo antes del primer provider write porque el runtime no pudo resolver exactamente el `visibleLogin` de B desde las fuentes privadas permitidas, aunque el manejo criptográfico privado sí quedó PASS.

Esto demuestra una distinción reusable:

- un digest SHA-256 permite comparar identidad sin exponerla;
- un digest one-way no sustituye el dato vivo cuando una operación posterior necesita materializarlo;
- si el dato operativo debe usarse después, debe existir un canal privado recuperable y gobernado, separado de repo/docs/evidencia pública;
- cuando el dato exacto no puede recuperarse, el sistema debe detenerse antes de escribir en lugar de inferirlo.

Ejecución observada: Auth writes 0, Firestore writes 0, deletes 0, deploy/merge/producción 0.

Usuarios & Permisos sigue pendiente hasta bootstrap PASS. No crear fallback ni hardcodear identidades.

M6 HR permanece cerrado. **Impacto Academia:** conceptual/documental y no bloqueante para contenidos. **Avance certificado Phase A: 84%.**
