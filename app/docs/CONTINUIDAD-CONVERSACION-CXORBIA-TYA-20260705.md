# Continuidad conversacion CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Preparar continuidad completa por si esta conversacion empieza a perder rendimiento, sin reiniciar metodologia ni perder el estado acumulado.

## Repo y rama

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama activa: `docs-tya-v6-v71-audit`
- PR: #7
- Estado PR: draft, abierto, sin merge
- Base: `release/cxorbia-tya-rc-20260630`

## Regla principal

El prototipo manda. No se deben reescribir modulos ni mezclar backend dentro de UI. Backend avanza en contratos, tools, adapters, docs y gates controlados. Si el frontend necesita cambios, se documenta para Claude.

## Estado de candidata frontend

- V87 fue auditada contra V86.
- V87 no tuvo delta real en `/app`.
- V87 no es source lock.
- V87 no es produccion lista.
- Siguen vivos P0 de honestidad operativa.

## P0 frontend vivo

Claude debe corregir primero:

- mensajes que prometen WhatsApp enviado;
- mensajes que prometen correo enviado;
- mensajes que prometen HR sincronizada;
- textos de sincronizacion automatica real;
- textos de sincronizacion HR externa;
- textos que indican movimiento automatico de liquidacion;
- `cuestionario enviado` cuando corresponde realizado/completado pendiente revision.

## Backend acumulado seguro

Se avanzaron bloques Phase A sin tocar frontend ni activar produccion:

1. Synthetic fixtures manifest.
2. Synthetic input pack runner.
3. Synthetic pack readiness map.
4. Readiness map to release snapshot bridge.
5. Release readiness snapshot validator.
6. Release readiness sanitized report generator.
7. Controlled production matrix.
8. Claude P0 package post V87.
9. Local readiness runbook Node.

## Ultimos bloques completados

### Claude P0 package post V87

Documentos clave:

- `app/docs/PAQUETE-CLAUDE-P0-POST-V87-CXORBIA-TYA-20260705.md`
- `app/docs/PROMPT-CORTO-CLAUDE-P0-POST-V87-20260705.md`
- `app/docs/AUDITORIA-PROXIMA-CANDIDATA-CLAUDE-CRITERIOS-20260705.md`
- `app/docs/HANDOFF-CLAUDE-CONTEXTO-BACKEND-POST-V87-20260705.md`

### Local readiness runbook

Documentos y scripts clave:

- `app/contracts/phase-a-local-readiness-runbook.tya.contract.json`
- `tools/migration/tya-phase-a-local-readiness-runbook.mjs`
- `app/docs/RUNBOOK-LOCAL-READINESS-PHASE-A-TYA-20260705.md`

El runbook produce salidas locales 00 a 06b bajo `_diagnosticos/tya-release-readiness`.

## Gates y estado seguro

Todo sigue apagado:

- sin produccion;
- sin deploy;
- sin merge;
- sin import real;
- sin Firestore writes;
- sin Storage writes;
- sin HR writes;
- sin Make real;
- sin Gemini real;
- sin correo real;
- sin WhatsApp real;
- sin pagos reales;
- sin datos sensibles.

## Pendientes inmediatos

1. Si Claude recupera capacidad: usar prompt corto P0 y pedir candidata correctiva con delta real.
2. Auditar la candidata nueva antes de empalmar.
3. Si hay repo local disponible: ejecutar `node tools/migration/tya-phase-a-local-readiness-runbook.mjs`.
4. Revisar salidas 00 a 06b antes de compartir o subir diagnosticos.
5. Mantener source lock bloqueado hasta P0 corregido y auditado.

## Errores que no se deben repetir

- No tratar un ZIP sin delta real como nueva baseline.
- No declarar produccion lista por backend preview.
- No empalmar candidato sin auditoria forense.
- No pedir a Claude Academia profunda antes de P0.
- No tocar frontend desde backend salvo autorizacion expresa.
- No activar providers ni gates por texto o demo.
- No subir datos sensibles ni diagnosticos locales sin revisar.

## Siguiente bloque exacto sugerido

Preparar un preflight local para el runbook que valide, antes de ejecutarlo:

- rama esperada;
- archivos requeridos;
- Node disponible;
- gates contractuales apagados;
- existencia del manifest;
- salida `_diagnosticos` disponible;
- aviso de P0 frontend pendiente;
- no produccion/no deploy/no merge.
