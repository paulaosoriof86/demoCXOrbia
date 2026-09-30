# CODEX EXECUTION TASK — V7.2

**Fecha:** 2026-08-04  
**Estado inicial requerido:** `EXECUTION_LANE_READY`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR existente:** #7, draft/open/no merge

## 1. Objetivo único

Cerrar en una misma tarea de Codex la auditoría final focalizada de V7.2 y, únicamente con GO sin P0, aplicar inmediatamente el delta mediante `APPLY_DELTA_DIRECTLY` sobre la rama viva.

No realizar auditoría general, no abrir nueva candidata, rama, PR o método.

## 2. Entrada obligatoria

Adjuntar y extraer en el workspace Codex:

`Prototype development request V7.2.zip`

Identidad verificada del paquete:

- SHA-256: `d3b7551b3b0b30e1b071dfc74beb20009c9c523c2955cce760148da6b8727686`;
- tamaño: 23,243 bytes;
- entradas: 4;
- contenido declarado: `MANIFEST.json`, reporte, `app/app.js`, `app/styles/layout.css`.

Antes de auditar:

1. leer `AGENTS.md` y todas las fuentes prevalentes;
2. verificar checkout autenticado y rama viva;
3. registrar HEAD actual, no reutilizar un SHA histórico como supuesto;
4. confirmar worktree limpio;
5. confirmar capacidad de commit/push directo;
6. emitir `EXECUTION_LANE_READY`.

Si no se cumple, detenerse antes de auditar.

## 3. Alcance de auditoría

Comparar exclusivamente:

- V7.2 vs V7.1;
- V7.2 vs `app/app.js` y `app/styles/layout.css` del HEAD vivo;
- preservación del manifiesto canónico y todos los bloques protegidos.

Comprobar:

- hash, manifest, rutas y alcance;
- delta agregado/eliminado/modificado;
- sintaxis con `node --check`;
- UTF-8 sin BOM y ausencia de mojibake;
- secretos, PII y datos sensibles;
- indexación/scripts/rutas esenciales;
- ausencia de regresión fuera del Login responsive.

## 4. Evidencia visual obligatoria

Levantar la app localmente, sin datos reales ni escrituras, y probar el Login en:

- 1920×1080;
- 1440×900;
- 768×1024;
- 412×915;
- 390×844.

Ejecutar escenarios con 1, 2, 8 y 12 países.

Registrar capturas y medidas reproducibles:

- `strip.top >= 0`;
- `aside.left >= 0`;
- `main.left >= 0`;
- `main.width <= viewportWidth`;
- `scrollWidth == viewportWidth`;
- `scrollHeight >= goReg.bottom`;
- todo el formulario y CTA accesibles mediante scroll;
- sin recorte lateral, superposición ni coordenadas negativas.

La ausencia de PNG en el ZIP no bloquea por sí sola: generar la evidencia en esta auditoría.

## 5. Decisión obligatoria

### Si existe P0 reproducible

Emitir:

`P0_PROVEN`

Documentar exactamente:

- pasos de reproducción;
- viewport/escenario;
- medida o error observable;
- archivo/línea causante;
- impacto Phase A;
- correctivo mínimo propuesto.

No aplicar ni crear V7.3 sin autorización expresa de Paula en la conversación vigente.

### Si no existe P0

Emitir:

`AUDITED_GO_READY_DIRECT_APPLY`

Aplicar inmediatamente, en la misma tarea y sobre la rama viva:

- únicamente el delta final confirmado;
- alcance esperado: `app/app.js` y `app/styles/layout.css`;
- preservar todos los demás archivos y autoridades canónicas;
- un solo commit atómico;
- push directo fast-forward;
- registrar `HEAD_BEFORE`, diff, commit y `HEAD_AFTER`;
- dejar worktree limpio.

No usar Contents API archivo por archivo, blobs/trees vía conectores, workflows transportadores, ramas o PR nuevos.

## 6. Post-apply obligatorio

Sobre el mismo `HEAD_AFTER`:

- generar manifest/build-lock/verificador;
- ejecutar source/static completo;
- gate de composición canónica;
- gate del contrato del Laboratorio;
- validar rutas por rol y dependencias ReportKit;
- documentar warnings P1/P2 sin bloquear;
- verificar cero archivos faltantes/duplicados y cero secretos.

Salida esperada:

`EMPALMED_PENDING_POST_GATES` o `TECHNICAL_PASS_PENDING_DEV_VISUAL`.

## 7. Prohibiciones del bloque

Cero:

- Hosting o Cloud Run;
- Firestore/Auth/Storage/HR writes;
- Make/Gemini;
- pagos;
- merge;
- producción;
- segundo método;
- reauditoría general;
- nueva candidata.

## 8. Documentación obligatoria

Actualizar con evidencia real:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-RECUPERACION-PLAN-CANONICO-V7-2-20260804.md` o addendum sucesor;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- impacto Academia;
- PR #7.

Clasificar: Reusable CXOrbia, Exclusivo TyA, Claude/prototipo, Academia y Sin impacto Claude.

## 9. Cierre requerido

Reportar:

- qué se hizo;
- decisión auditada;
- archivos modificados;
- `HEAD_BEFORE` y `HEAD_AFTER`;
- gates y evidencia;
- qué se preservó;
- impacto Phase A;
- pendiente real;
- siguiente acción exacta;
- estado seguro y cualquier bloqueo comprobado.

Nunca afirmar éxito sin evidencia de terminal, commit, push, diff y HEAD verificables.
