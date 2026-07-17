# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-17  
Estado: `TECHNICAL_PASS_PENDING_VISUAL` dentro de `EMPALMED_PENDING_POST_GATES`

## Repositorio y destino

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- Prohibido: `main`, rama nueva, PR nuevo

## Baseline candidata

- V159 empalmada
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`
- Manifest, build-lock y verificador: presentes
- Preflight estructural y semántico estático: PASS
- P0 demostrado: no
- `ACTIVE_BASELINE`: todavía no, pendiente browser smoke y validación visual

## Plan canónico

`app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`

Método obligatorio:

```text
FUENTE Y REGLA
→ MAPPING / ADAPTER
→ GATE DE DATOS
→ RUNTIME EXACTO
→ VALIDACIÓN VISUAL
→ FREEZE
```

No se avanza al siguiente corte sin evidencia visual del corte actual.

## Corte activo

`CORTE_0_V159_POST_EMPALME + CORTE_1_CONTEXTO_HR_HISTORICO`

## Evidencia técnica cerrada

Documento:

`app/docs/PHASE-A-V159-POST-EMPALME-SEMANTIC-PREFLIGHT-20260717.md`

Resultados:

- 67 JS/MJS, 0 errores de sintaxis;
- 64 scripts locales, 0 faltantes;
- 0 archivos BOM;
- 17 archivos de delta runtime V156→V159 identificados;
- Dashboard, Proyectos, Periodos, Histórico, Visitas, Shoppers, app.js e index.html sin delta;
- cambios relevantes de data-source/HR/Finanzas limitados a copy o fallback visual;
- source-safe preservada con proyecto y periodo separados;
- 14 periodos, 616 visitas y 44 por periodo esperados;
- MAY/JUN/JUL con claves distintas;
- gate browser existente para verificar cambio real de consultas/KPIs/filas.

## Pendiente técnico inmediato

`HOSTING_DEV_V159_EXACT_BUILD + BROWSER_RUNTIME_GATE`

Requiere autorización separada para publicar únicamente Hosting DEV V159 exacto.

Después:

1. desplegar solo Hosting DEV;
2. ejecutar gate browser proyecto/periodo/KPI/histórico;
3. ejecutar smoke remoto Admin, Shopper, Cliente y Academia;
4. entregar URL, commit, perfil, módulos, acciones y resultados esperados;
5. recibir `APROBADO`, `DIFERENCIA` o `ERROR`;
6. corregir por capa si aplica;
7. congelar V159 como `ACTIVE_BASELINE` si no existe P0.

La URL histórica V131/R18D no prueba V159.

## Siguiente secuencia después del freeze

1. ciclo shopper;
2. finanzas/certificaciones;
3. Firebase nuevo y limpio;
4. `CX.data` read-only;
5. materialización DEV;
6. Auth/RBAC;
7. sync HR/plataforma y evidencias;
8. GO/NO GO producción.

Cada paso incluye gate técnico, runtime exacto y validación visual antes de avanzar.

## No reabrir desde cero

Adapter portable `CX.data`, domain mapping, materialization plan, Auth readiness, importadores, reviewQueue, rollback, HR source-safe y contratos de sync.

## Bloqueo vivo

- Hosting DEV V159 requiere autorización expresa del bloque.
- La creación automática del Firebase nuevo y vacío continúa bloqueada por IAM.
- `cxorbia-backend-dev` puede servir como Hosting DEV, no como nueva base TyA.

## Estado seguro

Sin deploy ejecutado en este bloque, sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.