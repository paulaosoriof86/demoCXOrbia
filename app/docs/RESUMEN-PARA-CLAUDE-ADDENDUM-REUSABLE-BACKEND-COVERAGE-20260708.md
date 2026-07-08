# Resumen para Claude - Addendum Reusable Backend Coverage

Fecha: 2026-07-08  
Bloque: cobertura de patrones backend reutilizables hacia Claude/prototipo y Academia  
Estado: pendiente para prototipo, sin tocar UI desde backend.

## Bloque backend agregado

ChatGPT/backend agrego:

- `tools/contracts/cxorbia-reusable-backend-to-claude-coverage-contract.mjs`
- `app/docs/REUSABLE-BACKEND-TO-CLAUDE-COVERAGE-CONTRACT-CXORBIA-20260708.md`
- `app/docs/CAMBIOS-REUSABLE-BACKEND-TO-CLAUDE-COVERAGE-CONTRACT-CXORBIA-20260708.md`

Y actualizo:

- `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
- `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`

## Regla nueva para Claude

Todo patron backend reusable debe convertirse en requisito operativo de prototipo, Academia y GO/NO GO.

Claude no debe recibir estos patrones como notas tecnicas sueltas. Debe reflejarlos como:

- UI/copy/estado cuando aplique;
- curso/manual/checklist en Academia;
- criterio GO/NO GO;
- requisito para nueva candidata;
- requisito para configurar otro cliente.

## Patrones que Claude debe conservar para otros clientes

- multi tenant project config;
- admin configurability;
- academy admin actions;
- conflict review/import readiness;
- readiness dashboard source-safe;
- synthetic input pack runner;
- questionnaire routing;
- visit lifecycle;
- settlement/payment eligibility;
- evidence storage gate;
- historical import clean;
- assignment sync HR/plataforma;
- notification outbox gates;
- rule versioning/changelog;
- sensitive data policy;
- provider agnostic integrations.

## Prohibido para Claude

- tratar TyA/Cinepolis como logica unica no reusable;
- perder patrones backend al crear prototipo para otro cliente;
- mostrar provider activo si solo esta preparado;
- mostrar produccion lista, import real, sync real, envio real, pago real o deploy realizado;
- omitir Academia cuando un patron requiere curso/manual/checklist;
- omitir GO/NO GO por patron.

## Academia

Academia debe explicar patrones reutilizables, no solo el caso TyA:

- multi-tenant;
- configuracion por proyecto;
- gates;
- preview vs real;
- sourceRefs opacas;
- revision humana;
- administrabilidad;
- readiness;
- conflictos;
- datos sensibles;
- provider-agnostic integrations.

## Nuevo cliente

Para configurar otro cliente, Claude debe poder reutilizar estos patrones cambiando tenant/proyecto, pais, moneda, reglas, fuentes, rutas de cuestionario, documentos/evidencias, notificaciones, planes/NDA, manteniendo gates, auditRef, roles, source-safe y revision humana.

## Estado seguro

No se tocaron modulos UI, no se activo backend real, no se hizo import real, no se hicieron pagos reales y no se agregaron datos sensibles.
