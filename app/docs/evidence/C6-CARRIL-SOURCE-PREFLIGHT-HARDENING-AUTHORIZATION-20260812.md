# C6 — autorización hardening source-only del carril

**Fecha:** 2026-08-12 16:56 -06:00

Paula autorizó avanzar de inmediato con el hardening source-only integral del carril C6 antes de consumir otro Hosting DEV, con el objetivo de eliminar la causa raíz sistémica de los one-shot fallidos: resolución frágil de action, caída accidental a rama genérica Shopper y smoke Staff dependiente de sustituciones textuales sin preflight completo.

Alcance autorizado en este bloque:
- cambios source-only en request/workflow/tooling QA;
- cero Hosting, Cloud Run, Auth, Firestore, HR, Rules, Storage, Make, Gemini o pagos;
- cero merge y cero producción;
- no modificar `/app/modules` ni UI de producto;
- construir preflight determinista y fail-closed antes de cualquier futuro selector/provider;
- documentar evidencia y siguiente gate.

La autorización NO habilita todavía un nuevo one-shot Hosting DEV. Ese gate se solicitará únicamente después de PASS source-only completo.
