# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `TECHNICAL_PASS_PENDING_DEV_VISUAL__DIRECT_GITHUB_RUNNERS_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
3. `AUDITORIA-RECONCILIACION-LOCK-CANONICO-V7-2-P0F1-20260805.md`;
4. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json` — alias activo compatible;
5. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-HISTORICAL-20260804.json` — snapshot V6 inmutable;
6. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
7. `AUDITORIA-V7-2-P0F1-RESPONSIVE-20260804.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-RECONCILIACION-DIRECTA-LOCK-V7-2-P0F1-20260805.md`;
9. `RESUMEN-PARA-CLAUDE-ADDENDUM-RECONCILIACION-DIRECTA-V7-2-P0F1-20260805.md`;
10. `PENDIENTES-PROTOTIPO-ADDENDUM-RECONCILIACION-DIRECTA-V7-2-P0F1-20260805.md`;
11. `ACADEMIA-IMPACTO-RECONCILIACION-DIRECTA-LOCK-V7-2-P0F1-20260805.md`;
12. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
13. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
14. `AGENTS.md`;
15. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint, el lock de empalme directo y la evidencia observable de los runners.

## 2. Carril operativo vigente

CXOrbia funciona directamente desde ChatGPT y GitHub mediante:

```text
CHATGPT AUDITA Y PREPARA DELTA
→ CXORBIA_ATOMIC_APPLY_RUNNER
→ COMMIT/PUSH DIRECTO
→ CXORBIA_READONLY_POST_GATES_RUNNER
→ EVIDENCIA Y ESTADO OBSERVABLE
```

Codex es opcional y no constituye dependencia operativa. Paula no debe usar terminal, PowerShell, paquetes o acciones manuales para estos bloques.

## 3. Estado verificado

- V7.2-P0F1 empalmada: sí;
- commit Login: `33d6f4f14272f82dca9d9c7c0cc119a9f89619bd`;
- reconciliación del lock aplicada: sí;
- commit reconciliación: `fb8d8897bb24f2f634bc5594dca4e8d610daf910`;
- run atómico válido: `31009497155`;
- gates read-only: PASS;
- run gates: `31009570981`;
- artifact: `8931809583`;
- composición critical blobs: `53/53`;
- adicionales: `4/4`;
- contrato Lab: PASS;
- deploy/producción: 0.

## 4. Hallazgo y causa raíz cerrados

La dependencia de Codex provenía de documentación desactualizada, no de una limitación real del entorno. `AGENTS.md` fue corregido y los runners controlados quedaron reconocidos como carril directo.

El primer request atómico se detuvo porque `.tmp/` no estaba ignorado. El correctivo fue agregar `.tmp/` a `.gitignore`, manteniendo el runner fail-closed. El segundo request obtuvo PASS y creó el commit funcional esperado.

## 5. Warnings no bloqueantes

- P1 overlay A+B superseded aún cargado;
- P1 gráficas en ciertas exportaciones PDF;
- P2 formato XLSX básico;
- rutas shopper del contrato Lab pendientes de confirmación por nombre de archivo.

No bloquean el siguiente bloque visual.

## 6. Secuencia única siguiente

```text
AUTORIZACIÓN EXPRESA
→ ÚNICO HOSTING DEV DEL HEAD VIGENTE
→ PARIDAD + LOGIN RESPONSIVE + RUTAS ADMIN/SHOPPER/CLIENTE
→ LABORATORIO REAL CONTROLADO
→ CLEANUP
→ VALIDACIÓN HUMANA
→ ACTIVE_CANONICAL_BASELINE
```

## 7. Prohibiciones

- nueva candidata, rama o PR;
- auditoría general;
- dependencia obligatoria de Codex;
- Contents API para cambios funcionales;
- relajación de gates;
- deploy, provider writes, merge o producción sin autorización expresa.
