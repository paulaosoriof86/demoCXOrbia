# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Sin cambios a cursos/rutas/certificaciones/UI.

Provider snapshot PASS: Auth228; A reusable owner-bound; B/C/D canonical targets definidos; R4 exacto; budget Auth14/Firestore16/deletes0; rollback PASS.

D technical login rebase source-only PASS: el visible-login histórico se declaró no recuperable y se sustituyó por una derivación determinística source-safe, regenerable sin persistir el valor crudo. Owner/rol/scope/projectIds/claims permanecen iguales y la validación de colisión source-safe quedó en cero.

Lección reusable: cuando un identificador visible histórico no puede recuperarse, puede sustituirse por una derivación técnica determinística basada solo en anchors source-safe, siempre que la decisión de negocio permanezca intacta, la colisión sea cero y el dato crudo no se persista.

Boundary adicional: A/B/C exact visible-login siguen transient y el runtime necesita un handoff privado sin repo/artifact/log antes del write. Esto es transporte seguro, no nueva decisión de identidad.

Efectos: provider/Auth/Firestore/HR/Rules/Storage writes0; deletes0; deploy/merge/production0. Usuarios & Permisos sigue pendiente hasta bootstrap PASS; HR M6 cerrado.

**Impacto Academia conceptual/no bloqueante; Phase A84%.**
