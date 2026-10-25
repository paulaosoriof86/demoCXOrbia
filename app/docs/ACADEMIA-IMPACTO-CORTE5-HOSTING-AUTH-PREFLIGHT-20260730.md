# Academia — impacto Corte 5 Hosting DEV / Auth preflight

Fecha: 2026-07-30

## Conceptos que deben incorporarse
- Hosting es la superficie de publicación; Firestore/Auth son proveedores distintos aunque pertenezcan al mismo proyecto Firebase.
- Un selector visual de rol no autentica a una persona.
- Para mostrar PII real se requiere identidad autenticada, claims/scopes válidos y Rules/RBAC fail-closed.
- Un smoke server-side con Admin SDK demuestra integridad del backend, pero no sustituye el acceso browser autenticado.
- Un gate correcto puede detener un deploy antes de consumirlo si la única alternativa sería publicar credenciales o PII.
- Reutilizar el Hosting DEV existente evita reproceso; seguridad no implica crear otro entorno.

## Estado a enseñar
- backend canónico materializado y CX.data técnico: PASS;
- Hosting DEV existente: verificado;
- redeploy: 0/1, reservado y no consumido;
- dependencia siguiente: Auth/RBAC seguro;
- producción: no.
