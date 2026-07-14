# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA

Fecha de actualización: 2026-07-14  
Rama de integración: `phase-a/integration-live-20260714`  
PR histórico: `#7` draft/open/no merge

## 1. Regla de precedencia

Una regla escrita no basta. Desde ahora, ninguna candidata se acepta, empalma o convierte en source lock por memoria, checklist o afirmación de Claude/ChatGPT.

En cada candidata se revisa únicamente:

1. este checkpoint;
2. delta contra la baseline inmediata;
3. `tools/qa/verify-prototype-fastlane-gate.mjs`;
4. un solo batch de sintaxis y manifest.

## 2. Objetivo único vigente

Cerrar Phase A TyA con V113 aprobada por gate ejecutable, HR TyA como fuente operacional, Firebase DEV nuevo y vacío, conexión por `CX.data`, Auth/Storage/sync controlados y producción solo después del GO.

## 3. Baseline y candidatas

- Source lock: **V110**.
- Baseline auditada de continuidad: **V111**.
- V112: auditada y rechazada por gate; no se empalma.
- V113: solicitada a Claude con solo dos tareas agrupadas.
- R18A y R18B: PASS.
- R24: GitHub PASS; bloqueo externo Google Cloud IAM.

## 4. Estado real alcanzado y que no se reabre

- Normalización de fechas Excel/ISO existente y aplicada.
- Máquina de estados y domain mapping aplicados.
- HR source-safe: 14 periodos, 28 tabs y 616 visitas.
- R11D sin identidades inventadas.
- R14C: 196 enlaces exactos aplicados.
- V112 sí resolvió Mi Día por periodo y ranking/scoring por rating autorizado.

No se reabren: normalizador, estados, R11–R11D, R14C, importadores, P0 V110, Mi Día V112 ni ranking/scoring V112.

## 5. Bloque activo único

`R21_R23_FAST_AUDIT_AND_EMPALME_V113`

Estado: esperando V113.

Al recibirla:

1. comparar V113 vs V112;
2. ejecutar `node --check` en batch;
3. ejecutar literalmente `node docs/verify-manifest.mjs`;
4. ejecutar `verify-prototype-fastlane-gate.mjs`;
5. PASS: empalme inmediato;
6. FAIL: máximo tres gaps agrupados; sin documentación extensa previa.

## 6. Gate ejecutable y fail-closed

Archivos:

- `tools/qa/verify-prototype-fastlane-gate.mjs`;
- `.github/workflows/cxorbia-prototype-fastlane-gate.yml`.

El gate bloquea automáticamente:

- manifest inconsistente;
- métodos críticos duplicados;
- proyecto/periodo sin almacenamiento independiente;
- `project()`/`period()` como aliases;
- selector de periodo sin setter validante;
- Mi Día mezclando periodos;
- rankings o scoring con datos no autorizados.

No existe excepción manual para aceptar una candidata que falle.

## 7. Resultado V112

PASS:

- 66 JavaScript con sintaxis válida;
- Mi Día usa periodo activo por defecto;
- vista agregada explícita;
- ranking excluye referencias/perfiles sin rating;
- scoring condicionado a rating numérico.

FAIL:

- `verify-manifest.mjs`: exit code 1, 37 diferencias y aggregate inconsistente;
- dos definiciones de `setProgram()`;
- `currentProjectId` sigue derivado del periodo, no almacenado independientemente;
- `period()` sigue siendo alias de `project()`;
- `periodSel` llama `setProject()` y evita `setCurrentPeriod()`.

## 8. Plan restante Phase A

1. `R21_R23_FAST_AUDIT_AND_EMPALME_V113`.
2. `R24_NEW_EMPTY_FIREBASE_DEV_EXTERNAL_IAM_RESOLUTION`.
3. `R25_CX_DATA_DEV_BACKEND_CONNECTION`.
4. `R26_AUTH_ROLES_STORAGE_MINIMUM`.
5. `R27_CONTROLLED_TYA_IMPORT`.
6. `R28_HR_PLATFORM_MAKE_SYNC`.
7. `R29_SEMANTIC_ROLE_PERIOD_SMOKE`.
8. `R30_PRODUCTION_GO_NO_GO`.
9. `R31_CONTROLLED_PRODUCTION_DEPLOY`.

## 9. Control de tiempo y agilidad

- Auditoría y empalme son un solo bloque.
- No se relee el repo completo.
- No se usa PR #7 para diagnosticar candidatas.
- Workflow focalizado: máximo cinco minutos y cancelación de runs obsoletos.
- Documentación se actualiza una sola vez después de la decisión.

## 10. Cierre obligatorio de cada iteración

Plan, bloque, cambios/verificación, avance, no reabierto, siguiente bloque, bloqueos, Claude, reusable, exclusivo TyA, Academia y gates. El cierre puede ser breve.

## 11. Clasificación vigente

- **Reusable CXOrbia:** gate ejecutable, fail-closed, auditoría delta y empalme inmediato.
- **Exclusivo TyA/Cinépolis:** HR, Q1/Q2, junio, GT/HN y overlays concretos.
- **Claude/prototipo:** V113 con separación real proyecto/periodo y manifest final.
- **Academia:** conservar V111/V112; sin nuevo reproceso.
- **Sin impacto Claude:** workflow, validador, IAM y backend interno.

## 12. Estado de producción y gates

- V110: source lock.
- V111: continuidad.
- V112: rechazada por gate.
- V113: pendiente.
- Firebase nuevo: bloqueado por IAM externo.
- Producción, writes, imports, Auth, Storage, Make, Gemini y pagos: HOLD.
