# Phase A protected shopper profile DEV readiness

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Avanzar backend mientras Claude trabaja, preparando el borde correcto para que la informacion completa de shoppers pueda verse solo en vista protegida con Auth/RBAC.

Este bloque no mete datos reales de shopper en JS publico ni en el repo. Define contrato, acceso por rol, gates, reviewQueue y auditEvents.

## Archivos agregados

- `backend/contracts/phase-a-protected-shopper-profile-dev-readiness-v1.json`
- `backend/config/phase-a-protected-shopper-profile-access.source-safe.json`

## Por que este bloque era necesario

La URL DEV publica debe seguir mostrando solo datos source-safe. Sin embargo, Phase A operativa necesita que Paula y usuarios autorizados puedan ver perfiles completos, historial, certificaciones, liquidaciones y estado de pago.

La forma segura no es exponer esos datos en `app/core/tya-phase-a-source-safe-preview.js`, sino preparar backend DEV protegido con Auth/RBAC, permisos por tenant/proyecto y auditoria.

## Base existente que se reutiliza

Este bloque se apoya en el contrato Auth/RBAC ya creado:

- roles Phase A: `tenantAdmin`, `projectAdmin`, `financeAdmin`, `certificationAdmin`, `shopper`;
- rutas cubiertas: dashboard, postulaciones, reservas, automatizaciones, cuestionarioShopper, finanzas, academia, diagnostico y administrabilidad;
- gates de Auth todavia pendientes/bloqueados;
- datos prohibidos en repo: password, documento crudo, banco crudo, NDA crudo, tokens y webhooks privados.

## Modelo de identidad

Toda lectura protegida debe tener como minimo:

- `tenantId`;
- `projectId`;
- `shopperId`;
- `userId`.

Campos recomendados:

- pais;
- estado;
- referencia de fuente;
- ultima verificacion.

No se permite deduplicar por:

- nombre visual;
- telefono solamente;
- correo solamente;
- parecido visual.

## Preview publico permitido

En URL publica DEV solo se permite:

- referencia shopper opaca;
- pais;
- conteos source-safe por periodo/proyecto;
- estado de certificacion en bucket;
- estado de elegibilidad de pago en bucket.

## Vista protegida con Auth/RBAC

Cuando el gate de Auth DEV este listo, la vista protegida puede mostrar segun rol:

- nombre completo;
- contacto;
- historial de proyectos;
- historial de visitas;
- certificaciones;
- asignaciones;
- liquidaciones;
- lotes/estado de pago;
- historial de comunicaciones.

## Datos restringidos o cifrables

Deben quedar restringidos o cifrados, no visibles por defecto:

- documento de identidad crudo;
- cuenta bancaria cruda;
- NDA firmado crudo;
- evidencias crudas;
- URL privada de fuente;
- workbook crudo.

## Acceso por rol

- `tenantAdmin`: lectura de perfil protegido, conflictos, roles y auditoria.
- `projectAdmin`: perfil acotado al proyecto, visitas, asignaciones y certificaciones.
- `financeAdmin`: liquidaciones, lotes y estados de pago con auditoria; sin cuenta bancaria cruda.
- `certificationAdmin`: intentos, estados y revision de certificacion.
- `shopper`: solo su propio perfil, visitas, certificaciones y beneficios.

## ReviewQueue obligatoria

Enviar a revision si ocurre:

- multiples referencias parecen la misma persona;
- mismo correo con shopperIds distintos;
- mismo nombre con pais/proyecto distinto;
- shopper en fuente sin usuario;
- usuario sin shopper confirmado;
- certificacion historica ambigua;
- mismatch de identidad para pago.

## AuditEvents obligatorios

Registrar como minimo:

- lectura de perfil protegido;
- rol otorgado;
- rol revocado;
- identidad vinculada;
- conflicto enviado a reviewQueue;
- estado de pago visto;
- certificacion historica aplicada.

## Impacto Phase A

Este bloque prepara el camino para que Paula vea la informacion completa de shoppers sin contaminar el preview publico ni el prototipo.

Tambien deja reusable el patron para nuevos tenants y proyectos: cada tenant/proyecto tendra el mismo borde de acceso, roles, auditoria y reviewQueue.

## Impacto Claude/prototipo

Claude debe mostrar este comportamiento de forma generica:

- preview publico source-safe;
- perfil completo bloqueado hasta Auth/roles;
- mensajes honestos: `requiere acceso`, `gate apagado`, `vista protegida`, `pendiente Auth`;
- nada de PII en preview;
- roles y permisos configurables por tenant/proyecto.

## Impacto Academia

Academia debe explicar:

- por que el preview publico no muestra perfil completo;
- que roles pueden ver que datos;
- que campos son restringidos o cifrables;
- que es reviewQueue;
- que es auditEvent;
- por que no se deduplica por nombre visual;
- como se protege shopper full profile por tenant/proyecto.

## Estado seguro

Documento/config/contrato solamente. No activa Auth real, no escribe claims, no conecta frontend a perfil protegido, no escribe Firestore, no despliega produccion, no hace pagos, no HR writeback, no Make/Gemini y no datos sensibles en repo.
