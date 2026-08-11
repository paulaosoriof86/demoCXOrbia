# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Este bloque no cambia cursos, rutas, certificaciones ni UI de Academia antes de producción.

Principios reutilizables: identidad/rol/alcance separados; `TyA completo` no es wildcard; scope explícito y editable; proyectos desde inventario vivo; no expansión silenciosa; audit/readback; disable-before-delete; no exponer credenciales/claims/fingerprints.

Provider snapshot focal PASS con población Auth 228. A solo se adopta como canonical por binding independiente + claims exactos, nunca por unicidad de rol; B/C/D requieren canonical nuevo; R4 Cliente permanece exacto.

Presupuesto final recalculado: Auth writes 14, Firestore writes 16, deletes 0, rollback dry-run PASS. Principio reusable: snapshot real -> adjudicación -> budget exacto -> rollback -> autorización de write.

El primer request abortó pre-provider por un error shell y no consumió provider reads; se corrigió la causa raíz y la única observación efectiva posterior terminó PASS. Diferenciar telemetría del harness de evidencia real de datos.

Usuarios & Permisos debe explicar `TyA completo`, `Proyectos específicos`, revisión ante cambio de proyectos y diferencia entre deshabilitar/eliminar, sin detalles técnicos de Auth.

M6 HR permanece cerrado. **Impacto Academia:** conceptual/documental, no bloqueante. **Avance certificado: 84%.**