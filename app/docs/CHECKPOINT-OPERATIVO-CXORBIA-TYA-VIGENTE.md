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
- P0 demostrado: no
- `ACTIVE_BASELINE`: todavía no, pendiente validación visual

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

### Trabajo técnico pendiente

1. verificar HEAD/source lock/build V159;
2. ejecutar gates semánticos;
3. smoke local/static Admin, Shopper, Cliente y Academia;
4. confirmar proyecto/periodo/histórico, 14 periodos, 616 visitas, 44 activas, junio, GT/HN, shoppers, certificaciones y finanzas.

### Validación visual pendiente

1. publicar solo Hosting DEV V159 con autorización separada;
2. smoke remoto del mismo commit;
3. entregar a Paula URL, build, perfil, módulo, acción y resultado esperado;
4. recibir `APROBADO`, `DIFERENCIA` o `ERROR`;
5. congelar V159 como `ACTIVE_BASELINE` si no existe P0.

La URL histórica V131/R18D no prueba V159.

## Siguiente secuencia después del freeze

1. contexto/HR/histórico;
2. ciclo shopper;
3. finanzas/certificaciones;
4. Firebase nuevo y limpio;
5. `CX.data` read-only;
6. materialización DEV;
7. Auth/RBAC;
8. sync HR/plataforma y evidencias;
9. GO/NO GO producción.

Cada paso incluye gate técnico, runtime exacto y validación visual antes de avanzar.

## No reabrir desde cero

Adapter portable `CX.data`, domain mapping, materialization plan, Auth readiness, importadores, reviewQueue, rollback, HR source-safe y contratos de sync.

## Bloqueo vivo

La creación automática del Firebase nuevo y vacío continúa bloqueada por IAM. `cxorbia-backend-dev` puede servir como Hosting DEV, no como nueva base TyA.

## Estado seguro

Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos. Hosting DEV V159 requiere autorización separada.
