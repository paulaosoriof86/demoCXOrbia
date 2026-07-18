# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-18  
Estado: `REFRESHED_HOSTING_DEV_REMOTE_SMOKE_PASS_PENDING_PAULA_VISUAL`

## Estado operativo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- V159 auditada GO y empalmada.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Runtime: `hosting_dev_remote_smoke_pass_pending_visual`.
- Preflight, gates locales, Hosting DEV, prueba remota del build exacto y smoke remoto: PASS.
- La corrección raíz de clasificación shopper también está desplegada y validada remotamente.
- P0 demostrado: no.
- V159 todavía no es `ACTIVE_BASELINE`; falta únicamente la validación visual de Paula.
- V131 permanece como rollback visual hasta el freeze de V159.

## URL exacta para validación visual

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`

Build actualizado probado:

- etiqueta: `v159-r18d-source-safe-20260717-dev`;
- workflow run: `29649918631`;
- commit exacto desplegado: `91aed5f9bdd54a396bd8758479888516dd1c3013`;
- Firebase Hosting version: `projects/87461567267/sites/cxorbia-backend-dev/versions/dbb0c50992aba5e2`;
- artefacto sanitizado: `8431164287`;
- digest: `sha256:693d05ecfc4621c02321e13a0caf6f40ac2683356ee0893c02a04f027aa3539a`;
- estado observable GitHub: `cxorbia/v159-hosting-dev = success`.

## Evidencia cerrada del Corte 0

Todos los pasos del carril exacto finalizaron PASS:

1. verificación de empalme, registry, build-lock y alcance Hosting-only;
2. lectura HR source-safe actual;
3. canonicalización R18A;
4. aplicación de resultados existentes R11D, R14C y certificaciones;
5. binding canónico R15G con precedencia explícita de `dataLevel`;
6. overlay visible R18D;
7. gates locales de fuente, roles, proyecto/periodo/KPI/histórico y overlays;
8. validación de credencial y acceso exclusivo a Firebase Hosting DEV;
9. deploy Hosting DEV;
10. polling de propagación y prueba remota del build/commit exactos;
11. gates remotos del mismo build;
12. limpieza de credencial y evidencia sanitizada.

Resultados remotos:

- fuente: `PASS_WITH_WARNING_R15G_TYA_SOURCE_SEMANTICS`;
- Admin/Shopper/Cliente: `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`;
- proyecto/periodo/KPI/histórico: `PASS_TYA_PROJECT_PERIOD_KPI_HISTORY`;
- overlays financieros/certificación: `PASS_WITH_REVIEW_R18D_VISIBLE_OVERLAYS`;
- blockers: `0`;
- 14 periodos, 616 visitas y 44 visitas en el periodo activo;
- proyecto `cinepolis` separado del periodo;
- junio ejecutado con control de liquidación/pago pendiente y cero pagos confirmados o inferidos;
- 215 shoppers en la fuente actual frente a referencia 216, bajo revisión R11D;
- módulo Shoppers: 215 referencias protegidas, 0 activos, 0 inactivos, 0 perfiles completos y 0 incompletos;
- ratings inventados: `0`;
- estados shopper inventados: `0`;
- identidades shopper inventadas: `0`.

## Bloqueos solucionados de raíz

1. **Proyecto/periodo colapsados:** R18A delega al binding canónico R15G.
2. **Pérdida de estados en el adapter:** R15G conserva estados operativos, submitido, liquidación, pago y `financialControl`.
3. **Control de junio evaluado por heurística obsoleta:** R18D expone y el gate valida el sobre financiero source-safe aprobado, sin inferir pagos.
4. **Shopper protegido contado como activo/completo:** el adapter respeta primero `dataLevel`; una referencia protegida nunca se convierte en perfil operativo por tener valores nulos o conteos históricos.
5. **Carril de deploy dependiente de dispatch y lógica duplicada:** workflow reducido a wrapper y ejecución centralizada en `tools/release/tya-r15g-dev-root-deploy.sh`.
6. **Carrera de propagación remota:** polling con cache-busting antes del smoke remoto.
7. **Falta de observabilidad:** el carril publica estado de commit `cxorbia/v159-hosting-dev`.
8. **Gates V110 obsoletos:** retirados del carril automático vigente.
9. **Firestore drift disparado por cambios frontend/gates:** limitado a evidencia backend/Firestore real.
10. **Estado documental insuficiente:** registry y contrato registran el estado pre-freeze y la evidencia actualizada.

## Advertencias no bloqueantes

- La fuente actual contiene 215 shoppers frente a la referencia auditada 216. La diferencia queda en revisión R11D; no se inventan, borran ni completan identidades.
- DEV usa un snapshot HR fresco de build; no equivale todavía a sincronización HR runtime live.

## Siguiente acción exacta

Paula realiza la revisión visual del enlace DEV y responde:

- `APROBADO`, o
- un hallazgo concreto con rol, ruta, acción, resultado esperado y resultado observado.

Checklist mínimo:

- login y tenant TyA correctos;
- proyecto Cinépolis separado del periodo;
- cambiar mayo, junio y julio modifica filas y KPIs;
- 44 visitas por periodo, GT 34 y HN 10;
- junio aparece ejecutado, con liquidaciones/pagos pendientes y no como visitas pendientes o pagadas;
- módulo Shoppers muestra referencias protegidas, no activos/perfiles completos inventados;
- Dashboard, Proyectos, Periodos, Histórico y Visitas coherentes;
- rutas Admin, Shopper, Cliente y Academia operativas;
- textos honestos de fuentes, integraciones y pagos.

Solo después de `APROBADO` se congela V159 como `ACTIVE_BASELINE` y se continúa al Corte 1 sin reabrir auditoría, empalme, Hosting DEV o smoke remoto.

## Claude/prototipo

No existe tarea frontend nueva confirmada. La causa shopper se corrigió en el adapter/backend de conexión, sin modificar `app/modules`. Claude solo interviene si la revisión visual demuestra un P0 frontend reproducible y localizado. P1/P2 se documentan sin bloquear el freeze.

## Clasificación

- Reusable CXOrbia: binding canónico, precedencia de nivel de datos, sobre financiero por periodo, ejecutor único, polling y estado pre-freeze.
- Exclusivo TyA/Cinépolis: 14/616/44, GT/HN, junio y revisión R11D 215/216.
- Claude/prototipo: sin pendiente nuevo confirmado.
- Academia: pendiente validación visual por rol del build actualizado.
- Sin impacto Claude: gates, registry, contrato, CI y documentación técnica.

## Estado seguro

Hosting DEV actualizado. Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos. Sin base vieja conectada ni datos sensibles crudos agregados.
