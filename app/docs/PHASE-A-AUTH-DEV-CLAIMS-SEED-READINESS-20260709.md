# Phase A Auth DEV claims seed readiness

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Avanzar backend de forma funcional mientras Claude trabaja, preparando un plan validable de usuarios/claims DEV para Auth/RBAC sin activar Auth real, sin escribir claims, sin importar usuarios, sin exponer correos/passwords y sin tocar producción.

Este bloque convierte el contrato Auth/RBAC y el esquema protegido en un artefacto ejecutable: un validador que revisa templates source-safe de claims antes de cualquier GO real.

## Archivos agregados

- `backend/contracts/phase-a-auth-dev-claims-seed-readiness-v1.json`
- `backend/config/phase-a-auth-dev-claims-seed.source-safe.json`
- `tools/release/tya-auth-dev-claims-seed-plan-validate.mjs`

## Qué problema resuelve

Para que Paula pueda ver datos completos protegidos, no basta decir “Auth pendiente”. Se necesita preparar el borde exacto:

- qué roles existen;
- qué claims deberían tener;
- qué usuario de prueba representa cada rol;
- qué campos están prohibidos;
- qué gates bloquean escritura;
- cómo validar que el plan no trae PII ni secretos.

## Qué valida el script

El validador revisa:

- que el contrato esté en estado `draft_safe_not_connected`;
- que Auth provider, claims, frontend, writes, imports y producción sigan en `false`;
- que existan templates para `tenantAdmin`, `projectAdmin`, `financeAdmin`, `certificationAdmin` y `shopper`;
- que no haya correos reales, passwords ni strings de secretos;
- que los roles existan en `auth-rbac-phase-a-v1`;
- que `projectAdmin`, `financeAdmin` y `certificationAdmin` tengan scope de proyecto;
- que `shopper` tenga `shopperId` opaco;
- que `setCustomClaims`, `importUsers`, `deployRules` y `productionCutover` sigan bloqueados.

## Comando futuro seguro

Cuando se quiera validar localmente o en CI sin hacer writes:

```bash
node tools/release/tya-auth-dev-claims-seed-plan-validate.mjs --out .tmp/auth-dev-claims-seed
```

El comando genera reporte JSON/MD y no llama Firebase, no escribe Auth, no escribe Firestore y no despliega reglas.

## Estado de roles

- `tenantAdmin`: configuración tenant/proyecto, reviewQueue y auditoría.
- `projectAdmin`: visitas, asignaciones, postulaciones, certificaciones y operación de proyecto.
- `financeAdmin`: liquidaciones y estado de pago sin banco crudo.
- `certificationAdmin`: bancos de preguntas, intentos y carryover.
- `shopper`: solo perfil propio, visitas, certificaciones y beneficios.

## Gates

- `devAuthProjectConfigured`: pendiente.
- `devTestUsersPrepared`: pendiente.
- `devClaimsDryRun`: permitido solo como validador.
- `devClaimsWrite`: bloqueado hasta GO explícito, auditoría y rollback.
- `productionClaims`: bloqueado.

## Impacto Phase A

Este bloque sí adelanta producción controlada porque deja listo el paso previo a Auth DEV real: antes de tocar usuarios o claims ya existe una matriz validable y segura.

## Impacto Claude/prototipo

Claude debe representar esto de forma genérica:

- roles y usuarios como configuración, no como hardcode;
- perfil completo bloqueado hasta Auth/roles;
- mensajes honestos: `pendiente Auth`, `requiere acceso`, `gate apagado`;
- ningún email/password real en fixtures;
- claims como contrato/gate, no como Auth activo si backend sigue bloqueado.

## Impacto Academia

Academia debe explicar:

- qué son roles y claims;
- por qué no se guardan passwords ni correos reales en fixtures;
- por qué los datos completos requieren Auth;
- qué permisos tiene cada rol;
- cómo se valida el plan antes de activar claims;
- qué significa `devClaimsDryRun` vs `devClaimsWrite`.

## Clasificación

- Reusable CXOrbia: sí.
- Exclusivo cliente: no, patrón reusable por tenant/proyecto.
- Claude/prototipo: sí.
- Academia: sí.
- Sin impacto Claude: no.

## Estado seguro

Contrato/config/script validador solamente. No activa Auth, no crea usuarios, no escribe claims, no conecta frontend, no escribe Firestore, no importa datos, no deploy, no producción, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.
