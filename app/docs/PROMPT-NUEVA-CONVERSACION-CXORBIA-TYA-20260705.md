# Prompt nueva conversacion CXOrbia TyA

Fecha: 2026-07-05

Copia este prompt si se abre una nueva conversacion:

```text
Continua CXOrbia TyA Phase A sin reiniciar metodologia.

Primero lee y usa como fuente principal:
- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md` o su version actualizada en fuentes.
- `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`.
- Documentos recientes en `app/docs`, especialmente:
  - `CONTINUIDAD-CONVERSACION-CXORBIA-TYA-20260705.md`
  - `PAQUETE-CLAUDE-P0-POST-V87-CXORBIA-TYA-20260705.md`
  - `MATRIZ-PRODUCCION-CONTROLADA-PHASE-A-TYA-20260705.md`
  - `RUNBOOK-LOCAL-READINESS-PHASE-A-TYA-20260705.md`
  - `AUDITORIA-PROXIMA-CANDIDATA-CLAUDE-CRITERIOS-20260705.md`

Repo: `paulaosoriof86/demoCXOrbia`.
Rama activa: `docs-tya-v6-v71-audit`.
PR: #7, draft, abierto, sin merge.
Base: `release/cxorbia-tya-rc-20260630`.

Reglas principales:
- El prototipo manda.
- No reescribir `/app/modules` ni `/app/core` desde backend.
- No mezclar backend en UI.
- No activar produccion, deploy, merge, imports, providers ni escrituras reales.
- No subir datos sensibles.
- Si frontend necesita cambios, documentar para Claude.
- Trabajar en bloques grandes y documentar todo.
- Si una candidata nueva llega, auditar forense antes de empalmar.

Estado frontend:
- V87 fue auditada contra V86.
- V87 no tuvo delta real en `/app`.
- V87 no es source lock ni production ready.
- Siguen vivos P0 de honestidad operativa.

P0 Claude pendiente:
Corregir textos que prometen acciones reales con gates apagados:
- WhatsApp enviado.
- Correo enviado.
- HR sincronizada.
- Sincronia automatica real.
- Sincroniza HR externa.
- Mueve liquidacion.
- Cuestionario enviado cuando corresponde realizado/completado pendiente revision.

Backend acumulado seguro:
- Synthetic fixtures manifest.
- Synthetic input pack runner.
- Readiness map.
- Bridge a release readiness snapshot.
- Release readiness snapshot validator.
- Release readiness sanitized report generator.
- Controlled production matrix.
- Paquete Claude P0 post V87.
- Local readiness runbook Node.

Estado de salida:
- No source lock.
- No produccion.
- No deploy.
- No merge.
- No import real.
- Todos los gates siguen apagados.

Siguiente bloque exacto:
Preparar preflight local del runbook Phase A para validar rama, archivos requeridos, Node, manifest, gates apagados y P0 pendiente antes de ejecutar `node tools/migration/tya-phase-a-local-readiness-runbook.mjs`.

Cuando Claude recupere capacidad:
- usar `app/docs/PROMPT-CORTO-CLAUDE-P0-POST-V87-20260705.md`;
- pedir candidata correctiva con delta real;
- auditar con `app/docs/AUDITORIA-PROXIMA-CANDIDATA-CLAUDE-CRITERIOS-20260705.md` antes de empalmar.
```
