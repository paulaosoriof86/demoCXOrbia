# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `TECHNICAL_PASS_PENDING_DEV_VISUAL__DIRECT_GITHUB_RUNNERS_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Codex: opcional, no dependencia operativa.

El carril directo vigente usa:

- `CXORBIA_ATOMIC_APPLY_RUNNER` para commit/push atómico;
- `CXORBIA_READONLY_POST_GATES_RUNNER` para gates observables;
- solicitudes de una sola ejecución;
- cero terminal, PowerShell o trabajo manual de Paula.

`AGENTS.md` fue corregido en `39098a97aac2ee1c064026adda743b759bad5103` para eliminar la dependencia desactualizada de Codex.

## 2. V7.2-P0F1 empalmada

- ZIP: `09606d1cc133a1e1e138be76bd8c6aadeb1f70d7967d506aae3f81bf5e9c6fce`;
- decisión: `AUDITED_GO_READY_DIRECT_APPLY`;
- commit funcional de Login: `33d6f4f14272f82dca9d9c7c0cc119a9f89619bd`;
- `app/app.js`: credenciales visibles ausentes;
- `app/styles/layout.css`: responsive preservado;
- manifest, build-lock y verificador: creados;
- deploy o writes: cero.

## 3. Reconciliación del lock canónico

Causa raíz: el gate seguía comparando tres autoridades V6 sustituidas por P0F1:

- `app/app.js`;
- `app/styles/layout.css`;
- `app/core/build-lock.js`.

No era una regresión funcional. Era un lock desactualizado.

Se preservó una copia byte a byte del overlay V6 y se actualizó su ruta estable como alias activo compatible, con procedencia P0F1 explícita y gate fail-closed.

Primer intento runner:

- run `31009291341`;
- estado `HOLD_ATOMIC_APPLY`;
- causa exacta: evidencia transitoria `.tmp/` aparecía como delta no permitido;
- resultado: ningún commit funcional ni cambio parcial.

Correctivo de causa raíz:

- `.tmp/` quedó excluido en `.gitignore` mediante `ff55c4d1c2c4d1676d0e53a2ce1a73d762df1664`;
- no se relajó el runner ni su allowlist.

Aplicación válida:

- request commit: `48746fcdaf71872fbc0f42217c6f843194e5aa38`;
- commit funcional: `fb8d8897bb24f2f634bc5594dca4e8d610daf910`;
- mensaje: `chore(source-lock): reconcile canonical composition for V7.2-P0F1`;
- push directo: PASS;
- request eliminado por el commit funcional;
- archivos funcionales adicionales: cero.

## 4. Gates post-aplicación

Request read-only:

- commit `ef6c43e41db59508d7f0f631dcb52fa5a545cce5`;
- target técnico exacto `fb8d8897bb24f2f634bc5594dca4e8d610daf910`;
- run `31009570981`;
- artifact `8931809583`;
- digest `sha256:db3a8adb2e2c39f5825d359382b737fd97c9821d5828f6808c5d1c82b82b0c8f`.

Resultado:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Composición:

- critical blobs base: `53/53`;
- additional critical files: `4/4`;
- failures: `0`;
- assets faltantes: `0`;
- módulos, registro y navegación faltantes: `0`;
- report kit Admin/Cliente/Shopper/Finanzas: PASS;
- secretos: `0`;
- repositorio sin delta después de gates: PASS.

Warnings no bloqueantes preservados:

- P1 overlay A+B superseded aún cargado;
- P1 exportación PDF de gráficas;
- P2 presentación XLSX;
- cuatro rutas shopper del contrato Lab pendientes de confirmar por nombre de archivo, sin bloquear el contrato.

## 5. Avance Phase A

Preservado y cubierto por composición:

- HR e histórico;
- shoppers, postulaciones y certificaciones;
- liquidaciones/pagos;
- multi-proyecto y multi-tenant;
- Finanzas, Portal Cliente, Portal Shopper y Reservas;
- sincronización HR/plataforma;
- Academia y rutas por rol.

## 6. Siguiente bloque exacto

`AUTORIZACIÓN EXPRESA → ÚNICO HOSTING DEV DEL HEAD VIGENTE → PARIDAD Y RUTAS ACUMULATIVAS → LOGIN RESPONSIVE → LABORATORIO REAL READ-ONLY/CONTROLADO → CLEANUP → VALIDACIÓN HUMANA`.

No ejecutar deploy todavía.

## 7. Estado seguro

- Hosting/Cloud Run: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
