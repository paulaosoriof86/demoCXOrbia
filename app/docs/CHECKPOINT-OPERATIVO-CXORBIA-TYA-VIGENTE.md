# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-18  
Estado: `HOSTING_DEV_REMOTE_SMOKE_PASS_PENDING_PAULA_VISUAL`

## Estado operativo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- V159 auditada GO y empalmada.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Estado de runtime: `hosting_dev_remote_smoke_pass_pending_visual`.
- Preflight, gates locales, Hosting DEV, prueba de build remoto y smoke remoto: PASS.
- P0 demostrado: no.
- V159 todavía no es `ACTIVE_BASELINE`; falta únicamente la validación visual de Paula.
- V131 permanece como rollback visual hasta el freeze de V159.

## URL exacta para validación visual

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`

Build probado:

- etiqueta: `v159-r18d-source-safe-20260717-dev`;
- workflow run: `29626385151`;
- commit exacto desplegado: `8cf166eea6a0ebd0b2c6221925671d04865999f0`;
- Firebase Hosting version: `projects/87461567267/sites/cxorbia-backend-dev/versions/c8add179fb326b6a`;
- artefacto sanitizado: `8430697082`;
- digest: `sha256:fbe071cf34561df95c6e4cffa393f3c6851d742eb8f00776c28a3354e4365692`.

## Evidencia cerrada del Corte 0

Todos los pasos del workflow exacto finalizaron PASS:

1. verificación de empalme y alcance Hosting-only;
2. lectura HR source-safe actual;
3. canonicalización R18A;
4. aplicación de resultados existentes R11D, R14C y certificaciones;
5. binding canónico R15G;
6. overlay visible R18D;
7. gates locales de fuente, roles, proyecto/periodo/KPI/histórico y overlays;
8. validación de credencial y acceso exclusivo a Firebase Hosting DEV;
9. deploy Hosting DEV;
10. prueba remota del build exacto;
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
- identidades shopper inventadas: `0`.

## Bloqueos solucionados de raíz

1. **Proyecto/periodo colapsados:** R18A quedó delegado al binding canónico R15G.
2. **Pérdida de estados en el adapter:** R15G conserva estados operativos, submitido, liquidación, pago y `financialControl`.
3. **Control de junio evaluado por heurística obsoleta:** R18D expone y el gate valida el sobre financiero source-safe aprobado, sin inferir pagos.
4. **Carril de deploy dependiente de dispatch y lógica duplicada:** workflow reducido a wrapper y ejecución centralizada en `tools/release/tya-r15g-dev-root-deploy.sh`.
5. **Carrera de propagación remota:** el ejecutor canónico incorpora polling con cache-busting antes del smoke remoto.
6. **Estado documental insuficiente:** registry y contrato incorporan el estado intermedio `hosting_dev_remote_smoke_pass_pending_visual`.

## Advertencias no bloqueantes

- La fuente actual contiene 215 shoppers frente a la referencia auditada 216. La diferencia queda en revisión R11D; no se inventan, borran ni completan identidades.
- DEV usa un snapshot HR fresco de build; no equivale todavía a sincronización HR runtime live.
- El conteo shopper no está impreso de forma visible en todos los módulos; esto es P1 de revisión, no P0.

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
- Dashboard, Proyectos, Periodos, Histórico y Visitas coherentes;
- rutas Admin, Shopper, Cliente y Academia operativas;
- textos honestos de fuentes, integraciones y pagos.

Solo después de `APROBADO` se congela V159 como `ACTIVE_BASELINE` y se continúa al Corte 1 sin reabrir auditoría, empalme ni Hosting DEV.

## Claude/prototipo

No existe tarea frontend nueva confirmada. Claude solo interviene si la revisión visual demuestra un P0 frontend reproducible y localizado por archivo/módulo. P1/P2 se documentan y no bloquean el freeze.

## Clasificación

- Reusable CXOrbia: binding canónico, sobre financiero por periodo, estado pre-freeze, ejecutor único y polling de propagación.
- Exclusivo TyA/Cinépolis: 14/616/44, GT/HN, junio y revisión R11D 215/216.
- Claude/prototipo: sin pendiente nuevo confirmado.
- Academia: pendiente validación visual por rol del build ya desplegado.
- Sin impacto Claude: gates, registry, contrato, CI y documentación técnica.

## Estado seguro

Hosting DEV ejecutado. Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos. Sin base vieja conectada ni datos sensibles crudos agregados.
