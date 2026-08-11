# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Sin cambios a cursos/rutas/certificaciones/UI.

Provider snapshot PASS: Auth228; A reusable owner-bound; B/C/D canonical targets definidos; R4 exacto; budget Auth14/Firestore16/deletes0; rollback PASS.

Recovery source-only posterior al exact-write STOP permitió validar A/B/C exactamente contra los bindings/digests congelados sin provider reads ni PII persistida. D conserva owner/rol/scope/projectIds, pero no se recuperó su visible-login exacto desde las referencias privadas disponibles.

Lección reusable: el modelo correcto separa dato visible privado de digest source-safe. Una referencia privada puede recuperarse y validarse transient sin persistirla; si no existe match exacto, el sistema debe declarar el único dato faltante y detenerse, no generar variantes ni aproximaciones.

Efectos: provider/Auth/Firestore/HR/Rules/Storage writes0; deletes0; deploy/merge/production0. Usuarios & Permisos sigue pendiente hasta bootstrap PASS; HR M6 cerrado.

**Impacto Academia conceptual/no bloqueante; Phase A84%.**
