# Resumen para Claude/backend — DEV Auth/Firestore readiness post-V96

Fecha: 2026-07-10

## Qué quedó preparado

Backend alineó el modelo de Auth/RBAC/Firestore protegido con el source lock post-V96, sin activar servicios reales.

- claims v2 con `tenantId`, `role`, `personaType`, `scope`, `permissionsVersion` y referencias opacas;
- `countryRepresentative` con `projectAdmin` y alcance país/proyecto, no tenant completo;
- `clientAdmin` y `clientViewer` para portal cliente/reportes aprobados;
- fail-closed para rol, persona, scope, ruta o módulo desconocidos;
- Cinépolis como seed configurable del tenant TyA;
- shoppers, certificaciones carryover, liquidaciones junio, reviewQueue y auditEvents cubiertos;
- reglas Firestore draft y writes siguen bloqueados.

## Qué no quedó conectado

No hay Firebase DEV configurado, Auth, usuarios, claims, Firestore, rules deploy, protected reads, writes, import, `CX.data` switch, HR writeback, Make, Gemini, Storage, pagos ni producción.

## Qué Claude no debe rehacer

- P0 de permisos administrativos post-V96;
- cliente multi-proyecto;
- role/persona/scope backend;
- protected candidates;
- certification carryover;
- liquidaciones/pagos como control;
- gates y copy honesto ya documentado.

## P1 que sigue correspondiendo a Claude

- categorizar `cli_*` o definir allowlist cliente explícita;
- módulo desconocido debe terminar en `false` salvo allowlist;
- copy menor de WhatsApp/HR Source;
- smoke visual de admin, coordinador/aliado/custom, cliente y shopper.

## Clasificación

- Reusable CXOrbia: RBAC v2, mínimo privilegio, fail-closed, portal cliente separado de datos protegidos y orquestador de readiness.
- Exclusivo cliente: seed TyA/Cinépolis, GT/HN, HR y junio pagos.
- Claude/prototipo: solo P1 residual y smoke visual.
- Academia: roles/personas/scopes, estado preparado vs activo, carryover, pagos y reviewQueue.
- Sin impacto Claude: validators, source-safe config y hard stops.

## Estado seguro

No frontend modificado, no deploy, no producción, no servicio real ni dato sensible.
