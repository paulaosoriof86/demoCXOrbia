# Resumen para Claude/backend — Empalme post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`

## Estado

La candidata post-V96 queda como source lock operativo actualizado para continuidad backend Phase A.

No es GO de producción real.

## Qué se preserva

- P0 de permisos `CX.MOD_CAT` cerrado para módulos administrativos actuales.
- `roleCanAccess()` ya no abre módulos desconocidos con `return true`.
- Cliente multi-proyecto con `clientProjects()` y selector en portal cliente.
- Copy honesto de WhatsApp/manual en varios módulos.
- Scope proyecto/cliente logrado en V95/V96.
- HR Source candidates con stable key/sourceRef/auditRef.

## Qué debe saber Claude

No debe rehacer lo anterior. Si tiene capacidad, solo debe atender P1 residuales:

- categorizar `cli_*` o crear allowlist cliente explícita;
- endurecer módulo desconocido a `false` salvo allowlist;
- barrer copy menor en Soporte, Mis Visitas y label HR Source.

## Qué sigue backend

Continuar DEV Auth/Firestore activation readiness desde esta candidata post-V96, sin activar producción, sin escribir datos reales y sin proveedores reales.

## Clasificación

- Reusable CXOrbia: permisos fail-closed, cliente multi-proyecto, copy honesto y gates.
- Exclusivo cliente: TyA/Cinépolis solo como seed/configuración, no hardcode.
- Claude/prototipo: P1 residuales de navegación cliente/copy.
- Academia: permisos, cliente multi-proyecto y estados honestos.
- Sin impacto Claude: validaciones estáticas y source lock documental.

## Estado seguro

No deploy, no producción, no backend real, no Auth real, no Firestore write, no import real, no pagos, no HR writeback, no Make/Gemini y no datos sensibles.