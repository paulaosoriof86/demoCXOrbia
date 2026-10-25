# Phase A Claude candidate forensic audit readiness

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Preparar la auditoria forense de la nueva candidata de Claude contra la candidata actual, los paquetes enviados, los hallazgos acumulados y los requisitos Phase A TyA.

Este bloque no audita todavia una candidata nueva porque aun no fue entregada. Deja listo el contrato, checklist y script para que, cuando llegue, se pueda revisar rapido y sin reproceso.

## Archivos agregados

- `backend/contracts/phase-a-claude-candidate-forensic-audit-readiness-v1.json`
- `backend/config/phase-a-claude-candidate-forensic-audit-checklist.source-safe.json`
- `tools/release/tya-claude-candidate-forensic-audit-prepare.mjs`

## Que resuelve

Cuando Claude entregue candidata, no se debe revisar solo visualmente. Debe compararse contra:

- candidata actual o baseline viva;
- paquetes e instrucciones ya enviados;
- separacion proyecto/periodo;
- configuracion tenant/proyecto;
- HR/source enmascarado;
- roles/personas/scopes;
- Auth/gates/datos protegidos;
- Academia/cursos/manuales;
- certificaciones carryover;
- shoppers protegidos;
- liquidaciones/pagos;
- reviewQueue/auditEvents;
- PWA/branding;
- Make/Gemini/pagos gate-off;
- TyA especifico vs reusable CXOrbia.

## Comando seguro

```bash
node tools/release/tya-claude-candidate-forensic-audit-prepare.mjs --current <ruta-candidata-actual-extraida> --candidate <ruta-candidata-nueva-extraida> --out .tmp/claude-candidate-audit
```

El comando no despliega, no escribe datos, no llama Firebase, no llama proveedores y no toca produccion.

## Salidas esperadas

- `claude-candidate-forensic-audit-prep.json`
- `claude-candidate-forensic-audit-prep.md`

El reporte enumera agregados, eliminados y modificados, y prepara los ejes de auditoria para decidir que pedirle a Claude mientras tenga capacidad.

## Buckets de respuesta para Claude

- `P0BlockerAskClaudeNow`
- `P1ShouldFixWhileCapacityExists`
- `BackendAlreadyPreparedNoClaudeChange`
- `PrototypeOnlyClaudeRequired`
- `TyASpecificConfig`
- `ReusableCxorbiaPattern`

## Impacto Phase A TyA

Permite detectar rapido si la candidata de Claude deja listo lo necesario para conectar TyA real sin volver a romper proyecto, periodo, HR, usuarios, cursos, certificaciones, shoppers, liquidaciones o permisos.

## Impacto reusable CXOrbia

El mismo criterio sirve para nuevos tenants/proyectos. La auditoria debe separar configuracion especifica del cliente de patrones reutilizables del producto.

## Impacto Claude/prototipo

La auditoria debe responder:

- que hizo Claude;
- que le falto;
- que empeoro;
- que sigue hardcodeado;
- que queda generico;
- que hay que pedirle ahora mientras tenga capacidad.

## Estado seguro

Contrato/config/script solamente. No auditoria real aun, no deploy, no produccion, no datos sensibles, no Firestore, no Auth, no Make/Gemini, no pagos.
