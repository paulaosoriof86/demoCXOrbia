# CAMBIOS BACKEND — Preparación de carril Codex V7.2

**Fecha:** 2026-08-04  
**Estado:** `CODEX_EXECUTION_HANDOFF_READY__CODEX_TASK_NOT_STARTED__NO_AUDIT__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## 1. Propósito

Preparar el repositorio para que la siguiente ejecución ocurra en un workspace Codex con checkout Git autenticado, ZIP V7.2 extraído y capacidad real de commit/push directo sobre la rama viva, sin volver al bucle de auditoría separada de la aplicación.

## 2. Hallazgo corregido

El `AGENTS.md` existente incluía una autorización documental para construir commits mediante blobs/trees por conectores. Esa cláusula entraba en conflicto con el lock prevalente de empalme directo, que prohíbe usar blobs, trees, Contents API o workflows como sustituto del checkout file-aware.

Se reconciliaron las instrucciones para que Codex y cualquier agente respeten exclusivamente:

`CHECKOUT AUTENTICADO + ZIP EXTRAÍDO + RAMA VIVA → EXECUTION_LANE_READY → AUDITAR → GO → APPLY_DELTA_DIRECTLY`.

## 3. Archivos del bloque

### Modificado

- `AGENTS.md`
  - obliga a leer índice/checkpoint/plan vigentes;
  - fija repo, rama viva y PR #7;
  - elimina el carril contradictorio de blobs/trees;
  - exige `EXECUTION_LANE_READY` antes de auditar;
  - bloquea nuevas ramas, PR, workflows, PowerShell y métodos alternos;
  - delimita V7.2 al Login responsive y preserva todos los módulos protegidos.

Commit: `7a9cfc9ef955c4866476de1f81f791648c245557`.

### Creado

- `app/docs/CODEX-EXECUTION-TASK-V7-2-20260804.md`
  - contiene la tarea ejecutable completa para Codex;
  - identifica el ZIP V7.2 por SHA-256;
  - exige auditoría y aplicación en una sola tarea;
  - define viewports, escenarios, geometría, decisión P0/GO, post-gates y documentación;
  - prohíbe deploy, writes, merge y producción.

Commit: `0173773fb109123ec91be860337e3fc7f84fbaea`.

## 4. Estado de ejecución

- Codex task preparada en repo: sí;
- workspace Codex iniciado desde esta conversación: no disponible como herramienta invocable;
- ZIP V7.2 dentro de un workspace Codex: pendiente;
- auditoría final V7.2: no iniciada;
- V7.2 aplicada: no;
- empalme: 0;
- deploy/producción: 0.

## 5. Siguiente acción exacta

Iniciar una tarea Codex sobre el repositorio y rama existentes, adjuntar el mismo `Prototype development request V7.2.zip` y ordenar:

`Lee AGENTS.md y ejecuta íntegramente app/docs/CODEX-EXECUTION-TASK-V7-2-20260804.md. No crees rama ni PR. Detente antes de cualquier deploy.`

No se requiere nueva candidata, PowerShell, copia manual de código, nueva rama o nueva metodología.

## 6. Clasificación

- **Reusable CXOrbia:** `AGENTS.md` y patrón audit→apply en una misma tarea Codex.
- **Exclusivo TyA:** V7.2, perfiles y gates Phase A.
- **Claude/prototipo:** correctivo responsive del Login.
- **Academia:** sin cambio de contenido; deberá registrar evidencia al freeze.
- **Sin impacto Claude:** preparación del entorno agente y reconciliación documental.

## 7. Estado seguro

Producción intacta. Cero Hosting/Cloud Run, Firestore/Auth/Storage/HR writes, Make, Gemini, pagos, merge o producción.
