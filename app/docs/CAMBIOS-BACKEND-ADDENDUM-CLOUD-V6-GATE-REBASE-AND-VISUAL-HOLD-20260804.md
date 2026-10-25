# CAMBIOS BACKEND — Cloud V6 empalmada, gate rebasado y visual HOLD

**Fecha:** 2026-08-04  
**Estado:** `V6_EMPALMED__SOURCE_GATE_ROOT_FIX_MATERIALIZED__VISUAL_HOLD__NO_DEPLOY`

## 1. Empalme confirmado

- HEAD antes: `a2ccfb0c3709cad6f5e6a9c16dcb7f9293532d6e`;
- commit funcional Codex: `f961253f18c388ae04619bb5175269015c8349c3`;
- rama: `docs-tya-v6-v71-audit`;
- PR #7 abierto/draft/no merge;
- candidata Cloud V6 SHA-256: `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Codex se limita al empalme mecánico. Auditoría, gates, deploy, runtime y laboratorio permanecen en ChatGPT.

## 2. Visual HOLD

La V6 empalmada no quedó aprobada en escritorio.

Causa visual:

- Cloud trató Emergent como inspiración y no como fuente de verdad;
- el login integrado reutilizó portada/demo, marca grande, accesos de validación y pie técnico;
- el panel derecho perdió la jerarquía exacta de `INGRESO → Iniciá sesión → países → perfiles → credenciales`;
- la órbita quedó más rígida y pesada que la referencia;
- el prompt V6 mezcló demasiados objetivos y no fijó un criterio visual binario antes del empalme.

Correctivo emitido:

`PROMPT-CLOUD-V7-CORRECCION-VISUAL-LOGIN-ORBIT-20260804.md`.

Cloud V7 debe ser únicamente un delta visual sobre V6, limitado principalmente a `app/app.js` y `app/styles/layout.css`.

## 3. Gate bloqueante recibido

`tya-phase-a-complete-composition-source-gate.mjs` reportó:

- blobs históricos para cinco archivos modificados por V6;
- asset local ausente `app/core/backend-dev-auth.local.js`;
- falso positivo de secreto sobre un archivo cuyo contenido define patrones de escaneo.

## 4. Correctivos source-only aplicados

### Manifest overlay

Creado:

`app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`.

El gate ya no reemplaza la historia del manifest base. Usa un overlay explícito para los blobs V6 y conserva el resto de autoridades.

### Asset local

Creado:

`app/core/backend-dev-auth.local.js`.

Es un placeholder fail-closed, sin credenciales, tokens, UID, emails internos ni configuración de proveedor. No reemplaza el login canónico.

### Secret scan

El gate fue actualizado para que los archivos que contienen definiciones de patrones de seguridad no se autoclasifiquen como secretos. Esos archivos reciben un chequeo separado de payload real; todos los demás archivos mantienen el escaneo estricto.

### Laboratorio

El shell V6 afirmaba `SCENARIO_EXECUTED` y `CLEANUP_VERIFIED` aunque solo observaba la aplicación y no ejecutaba operaciones.

`app/core/dev-scenario-lab.js` quedó corregido para:

- no inventar PASS;
- mostrar `BLOCKED_AWAITING_CONTROLLED_RUNNER`;
- solicitar ejecución al runner controlado;
- aceptar únicamente evidencia sanitizada mediante `CX.devScenarioLab.ingest(report)`;
- exigir fingerprint inicial/final y `baselineRestoredAfterCleanup` real.

## 5. Archivos tocados en este correctivo

- `app/core/backend-dev-auth.local.js`;
- `app/core/dev-scenario-lab.js`;
- `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
- `tools/qa/tya-phase-a-complete-composition-source-gate.mjs`;
- `app/docs/PROMPT-CLOUD-V7-CORRECCION-VISUAL-LOGIN-ORBIT-20260804.md`;
- documentación de continuidad.

## 6. Verificación pendiente

No se afirma PASS del gate rebasado todavía porque el entorno de ChatGPT no puede resolver `github.com` para ejecutar el repo local y no existe telemetría remota comprobada en este cierre.

La siguiente ejecución debe comprobar:

- sintaxis;
- blobs base + overlay;
- asset local presente;
- secret scan sin falso positivo;
- laboratorio sin PASS inventado.

## 7. Deploy

Hosting DEV permanece en cero.

Incluso con PASS source/static, no debe desplegarse la apariencia V6 como visual aprobada. Primero debe recibirse y aprobarse el delta Cloud V7; luego se actualiza el overlay y se ejecuta el único deploy DEV acumulativo.

## 8. Estado seguro

- producción: intacta;
- deploy: 0;
- merge: 0;
- Cloud Run: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0.

## 9. Clasificación

- **Reusable CXOrbia:** manifest overlay, escaneo sin self-match y laboratorio honesto.
- **Exclusivo TyA:** corte Admin/Operaciones + Shopper.
- **Cloud/prototipo:** V7 visual pendiente.
- **Academia:** diferencia entre observación y escenario ejecutado.
- **Sin impacto producción:** todo permanece fuera de producción.
