# Phase A continuity prompt and PR summary TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Este documento contiene el prompt de continuidad para abrir una nueva conversacion sin perder contexto, metodologia ni plan de trabajo. Debe evitar los errores ya ocurridos: pedir pasos manuales innecesarios, repetir Level 0/1, reiniciar plan, pedir datos ya documentados, desviarse de Phase A real TyA o tratar infraestructura abstracta como avance operativo.

## Prompt de continuidad para nueva conversacion

```text
Continua CXOrbia TyA backend/migracion Phase A desde el estado documentado, sin reiniciar metodologia ni pedir datos ya entregados.

Antes de responder, planear o modificar, lee y usa como fuente principal estos documentos del repo y fuentes del proyecto:
- 00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md o su version actualizada/completa cargada en Fuentes.
- ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md.
- ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md.
- ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md.
- app/docs/PHASE-A-ACCUMULATED-CONTINUITY-CHECKPOINT-TYA-20260709.md.
- app/docs/PHASE-A-CONTINUITY-PROMPT-AND-PR-SUMMARY-TYA-20260709.md.
- CAMBIOS-BACKEND.md.

Repo y PR vigentes:
- Repo: paulaosoriof86/demoCXOrbia.
- Rama activa: docs-tya-v6-v71-audit.
- Base: release/cxorbia-tya-rc-20260630.
- PR: #7, draft, abierto, sin merge.
- No deploy.
- No produccion.
- No runtime conectado.
- No imports reales.
- No Firestore/Auth/Storage writes.
- No HR writes.
- No Make/Gemini live.
- No pagos reales.

Regla de oro:
- El prototipo manda.
- No tocar /app/modules ni /app/core desde backend.
- No parchar UI desde backend.
- Si frontend/Claude necesita cambios, documentarlos en docs para Claude/prototipo.
- Mantener la interfaz exacta de CX.data y un unico punto futuro de switch.
- No conectar ni copiar base vieja.
- No subir HR cruda ni datos sensibles al repo.
- No usar demo, fixture sintetico ni .tmp derivado como fuente real.
- No repetir Level 0/1 salvo causa real documentada.
- Si no esta documentado, no se hizo.

Foco obligatorio:
Seguir Phase A con datos reales/sanitizados de TyA, no infraestructura abstracta. Phase A significa:
- HR como fuente operacional.
- Import historico como control, no datos crudos en repo.
- Shoppers historicos completos desde HR/source-safe.
- Certificaciones ya presentadas preservadas; no pedirlas de nuevo sin revision.
- Visitas hasta junio ejecutadas; lo pendiente de junio son liquidaciones/pagos, no visitas.
- Liquidaciones/pagos como control administrativo, no pago real.
- Multi-proyecto desde el inicio.
- Cinépolis como proyecto configurable TyA, no logica unica hardcoded.
- Cuestionario configurable por proyecto/visita: CXOrbia, TyAOnline, externa, link general o link HR por visita.
- Sync HR/plataforma con stable keys, conflictos a revision, nunca deduplicar por nombre.

Errores que NO deben repetirse:
- No pedir a Paula comandos manuales si no son indispensables.
- No pedir HR/reglas/shoppers/certificaciones ya documentadas sin revisar fuentes.
- No repetir Level 0/1.
- No reiniciar plan de trabajo.
- No saltar a UI/Claude sin source lock.
- No empalmar backend sobre candidata sin decision/source lock.
- No confundir junio con visitas pendientes.
- No tratar fixtures o outputs .tmp como datos reales.
- No decir que algo quedo hecho si un tool/commit se bloqueo.
- No prometer integraciones reales si gates estan apagados.
- No entregar acciones de runtime/import/deploy sin GO explicito de Paula.

Bloques ya completados y documentados:
1. Checkpoint no-reversion Level 0/1.
2. Checkpoint real-data preview sin reproceso.
3. Gate continuidad operacional Phase A.
4. Maquina de estados operacional Phase A.
5. Acciones administrativas auditables.
6. Colas operativas.
7. Readiness acumulado.
8. Gate solicitud GO runtime DEV.
9. Plan runtime DEV switch.
10. Contrato CX.data DEV adapter.
11. Source-safe domain mapping.
12. Real-data domain readiness pack.
13. Source-safe input builder contract.
14. Local builder execution control.
15. Future single-command pack.
16. Accumulated continuity checkpoint.
17. Este prompt/resumen de continuidad.

Estado seguro mas reciente:
- Sin cambios en /app/modules.
- Sin cambios en /app/core.
- Runtime no conectado.
- Adapter no habilitado.
- Builder no ejecutado.
- Comando no enviado a Paula.
- Output local no commiteado.
- Sin Firestore writes.
- Sin HR writes.
- Sin imports.
- Sin deploy.
- Sin produccion.
- Sin Make/Gemini live.
- Sin pagos reales.
- Sin datos sensibles en repo.

Documentacion obligatoria en cada bloque:
- CAMBIOS-BACKEND.md o addendum correspondiente.
- Docs para Claude/prototipo cuando aplique.
- Pendientes prototipo cuando aplique.
- Impacto Academia cuando aplique.
- Clasificar: Reusable CXOrbia, Exclusivo TyA, Claude/prototipo, Academia, Sin impacto Claude.

Metodologia esperada:
- Avanzar en GitHub directamente si es posible.
- Reducir pasos manuales para Paula.
- Solo pedir computador cuando sea indispensable.
- Si se necesita PowerShell, dar un solo bloque claro, sin rutas alternativas y sin pedir datos privados en chat.
- Trabajar por bloques largos utiles, no relleno.
- Siempre reportar archivos, commits, estado seguro y siguiente bloque.
- Avisar si la conversacion se alarga o puede perder continuidad.

Siguiente bloque exacto recomendado:
Preparar un resumen PR acumulado operativo y/o revisar si falta algun doc puente para Claude/PENDIENTES-PROTOTIPO/Academia a partir del checkpoint. No pedir ejecucion local aun. No pedir HR. No activar runtime. No cambiar UI.
```

## Resumen acumulado del PR

### Identificacion

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- Base: `release/cxorbia-tya-rc-20260630`
- PR: #7 draft abierto

### Estado tecnico

- Sin merge.
- Sin deploy.
- Sin produccion.
- Sin runtime.
- Sin imports.
- Sin writes.
- Sin cambios UI/core.
- Sin datos sensibles.

### Linea de trabajo reciente

La linea reciente conservo Phase A real TyA y preparo contratos/gates/docs para:

- continuidad acumulada;
- no-reversion;
- state machine;
- acciones auditables;
- colas operativas;
- readiness acumulado;
- GO runtime DEV separado;
- runtime DEV switch plan separado;
- adapter `CX.data` DEV apagado;
- mapping source-safe;
- readiness pack de dominios reales/sanitizados;
- builder local source-safe;
- ejecucion local controlada;
- paquete de comando unico futuro marcado NO EJECUTAR TODAVIA.

## Que necesita Paula ahora

Nada inmediato.

No se debe pedir HR, export, PowerShell ni datos privados en este punto. Solo se pedira computador cuando realmente haga falta validar una fuente local source-safe o correr el bloque unico futuro.

## Siguiente bloque operativo sugerido

Revisar y completar, si hace falta, el paquete acumulado para Claude/PENDIENTES-PROTOTIPO/Academia usando los documentos recientes, sin tocar UI, para que Claude no reinicie pendientes ni asuma runtime activo.
