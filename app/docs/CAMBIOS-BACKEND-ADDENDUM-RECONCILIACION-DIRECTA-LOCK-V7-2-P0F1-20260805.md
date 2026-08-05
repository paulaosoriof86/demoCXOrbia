# CAMBIOS BACKEND — reconciliación directa del lock V7.2-P0F1

**Fecha:** 2026-08-05  
**Estado:** `DIRECT_GITHUB_RUNNER_LANE_RESTORED__TECHNICAL_PASS_PENDING_DEV_VISUAL`

## 1. Causa raíz cerrada

La dependencia de Codex provenía de una lectura desactualizada de `AGENTS.md`. El repositorio ya tenía los runners controlados requeridos. `AGENTS.md` fue corregido para reconocerlos como carril directo.

El primer request atómico se detuvo correctamente porque los reportes transitorios `.tmp/` aparecían como delta no autorizado. No hubo commit funcional ni cambio parcial. Se agregó `.tmp/` a `.gitignore` y se repitió una sola vez con request nuevo y parent actualizado.

## 2. Archivos del delta de lock

- reemplazo controlado del alias activo `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
- copia histórica exacta `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-HISTORICAL-20260804.json`;
- auditoría, resumen Claude, pendientes y Academia.

Archivos funcionales nuevos: **0**.

## 3. Evidencia de aplicación

- request válido: `48746fcdaf71872fbc0f42217c6f843194e5aa38`;
- run atómico: `31009497155`;
- commit funcional: `fb8d8897bb24f2f634bc5594dca4e8d610daf910`;
- push directo: PASS;
- request eliminado en el commit funcional.

## 4. Gates

- request gate: `ef6c43e41db59508d7f0f631dcb52fa5a545cce5`;
- run: `31009570981`;
- artifact: `8931809583`;
- digest: `sha256:db3a8adb2e2c39f5825d359382b737fd97c9821d5828f6808c5d1c82b82b0c8f`;
- composición: `53/53` critical blobs y `4/4` adicionales;
- failures: `0`;
- Lab source contract: PASS;
- repositorio sin delta después de gates: PASS.

## 5. Clasificación

- **Reusable CXOrbia:** runner atómico, evidencia read-only y corrección de transitorios sin relajar allowlist.
- **Exclusivo cliente:** hashes, rama, PR y P0F1 TyA.
- **Claude/prototipo:** sin cambio funcional; no crear V7.3.
- **Academia:** patrón de reconciliación fail-closed y recuperación de control plane.
- **Sin impacto Claude:** requests, artifacts y telemetría.

## 6. Estado seguro y siguiente bloque

Cero Hosting, Cloud Run, Firestore/Auth/Rules/Storage/HR writes, Make/Gemini, pagos, merge o producción.

Siguiente bloque exacto: autorización expresa para un único Hosting DEV del HEAD vigente, seguido de validación acumulativa y Laboratorio real controlado.
