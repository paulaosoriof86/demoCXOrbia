# Academia — impacto C6 predeploy y membresía Cliente

## Patrón reusable

Un gate de despliegue debe detenerse antes del deploy cuando una identidad tiene Auth válido pero carece de la membresía de autorización requerida por el dominio.

La secuencia correcta es:

`Auth identity → claims → tenant membership → project scope → login/runtime → deploy`.

No debe confundirse autenticación con autorización: que el usuario exista y pueda iniciar sesión no demuestra que tenga la membresía exacta del tenant/proyecto.

## Lecciones del bloque

- no congelar conteos vivos como invariantes históricas;
- separar decisiones canónicas de aliases heredados;
- capturar etapas sanitizadas sin exponer credenciales;
- preservar STOP_RETRY antes de un deploy;
- exigir autorización específica para cualquier write de membresía;
- comprobar idempotencia y rollback antes de continuar.

## Impacto en cursos y manuales

Agregar al manual técnico de Auth multi-tenant:

- diferencia entre usuario Auth, claims y membership document;
- ruta canónica `tenants/{tenantId}/users/{uid}`;
- repair acotado con snapshot, máximo de writes, readback e idempotencia;
- evidencia de cero deploy cuando falla el preflight.

No cambian rutas de aprendizaje por rol, notificaciones, contenido operativo ni UI.
