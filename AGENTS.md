# CXOrbia — ejecución obligatoria

Este archivo se lee antes de cualquier acción de Codex o agente en el repositorio.

## Fuentes prevalentes

Leer primero, en este orden:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
2. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
5. `app/docs/CAMBIOS-BACKEND-ADDENDUM-RECUPERACION-PLAN-CANONICO-V7-2-20260804.md`

Después leer el documento maestro de continuidad, addenda vigentes, manifiesto canónico, contratos, `CAMBIOS-BACKEND`, `RESUMEN-PARA-CLAUDE`, `PENDIENTES-PROTOTIPO`, source lock, tracker Phase A y PR #7.

Ante cualquier conflicto documental, prevalecen el índice, el checkpoint y el lock de empalme directo vigente.

## Destino fijo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR existente: `#7`
- Prohibido `main`
- No nueva rama
- No nuevo PR

## Gate previo obligatorio

Antes de auditar o modificar, la misma tarea de Codex debe tener:

1. ZIP de la candidata vigente extraído;
2. checkout Git autenticado del repositorio;
3. rama viva seleccionada;
4. HEAD vivo verificado;
5. worktree limpio;
6. capacidad real de commit y push directo sobre la rama viva.

Emitir `EXECUTION_LANE_READY` con evidencia. Si falta cualquiera, detenerse antes de auditar y registrar causa raíz, owner exacto y solución. No iniciar una auditoría que deba repetirse en otro entorno.

## Método único vigente

`EXECUTION_LANE_READY → AUDITORÍA FINAL FOCALIZADA → AUDITED_GO_READY_DIRECT_APPLY → APPLY_DELTA_DIRECTLY → EMPALMED_PENDING_POST_GATES`

Con GO y sin P0, aplicar inmediatamente el delta directamente sobre la rama viva, preservar backend/overlays/documentación, crear un único commit atómico verificable, hacer push y ejecutar gates después.

## Prohibiciones prevalentes

- `incoming/`, plan JSON, `.cmd` o PowerShell para Paula;
- Contents API archivo por archivo como transporte;
- blobs, trees o commits Git construidos mediante conectores como sustituto del checkout;
- workflows/Actions, Drive o Base64 como transportador;
- rama o PR nuevos;
- `main`;
- force update;
- copias manuales;
- reauditoría general;
- nueva candidata cuando la actual está GO;
- afirmar éxito sin commit, diff, HEAD y gates verificables.

La operación permitida es `APPLY_DELTA_DIRECTLY` desde el checkout file-aware autenticado. Solo un `P0_PROVEN` reproducible y autorización expresa de Paula en la conversación vigente permiten detener o proponer un cambio de método.

## Tarea vigente V7.2

Leer `app/docs/CODEX-EXECUTION-TASK-V7-2-20260804.md`.

V7.2 solo puede aportar el correctivo responsive del Login. El alcance esperado, sujeto a comparación real, es:

- `app/app.js`
- `app/styles/layout.css`

Preservar íntegramente backend, contratos, adapters, tools, overlays TyA, `CX.data`, multi-tenant, multi-proyecto, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, sincronización, Academia, manuales, rutas por rol, notificaciones, UTF-8 y ausencia de secretos.

Cinépolis es proyecto configurable, nunca default ni lógica global.

## Gates mínimos

- hash, manifest y alcance;
- comparación V7.2 vs V7.1 y vs HEAD vivo;
- `node --check`;
- UTF-8 sin BOM;
- secretos/PII;
- Login en 1920×1080, 1440×900, 768×1024, 412×915 y 390×844;
- escenarios 1/2/8/12 países;
- geometría y scroll contractuales;
- source/static, composición canónica y contrato del Laboratorio después del empalme.

La ausencia de capturas en el ZIP se resuelve generando evidencia durante la auditoría; no origina V7.3 por sí sola.

## Estado seguro permanente

Sin Hosting/Cloud Run, merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos salvo gate y autorización expresa.

## Cierre obligatorio

Dejar el worktree limpio y documentar evidencia real en CAMBIOS, checkpoint, índice, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` e impacto Academia. Nunca afirmar PASS, commit, push o ejecución sin evidencia reproducible.

El estado específico de candidata, HEAD y siguiente bloque se toma únicamente del checkpoint vigente. No hardcodear versiones aquí.
