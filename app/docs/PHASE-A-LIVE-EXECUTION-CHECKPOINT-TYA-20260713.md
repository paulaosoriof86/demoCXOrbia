# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA

Fecha de actualización: 2026-07-14  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama de integración: `docs-tya-v6-v71-audit`  
PR: `#7` draft/open/no merge

## 1. Regla atómica de baseline

**Última candidata aceptada = candidata empalmada = baseline activa.**

No existen estados intermedios como:

- aceptada pero no empalmada;
- baseline de continuidad no empalmada;
- empalmada pero no baseline;
- dos baselines activas.

Una candidata solo puede quedar:

1. `pending_audit`;
2. `rejected_requires_correction`;
3. `accepted_and_empalmed`.

El PASS de auditoría no cierra el bloque por sí solo. El mismo bloque debe ejecutar en forma atómica:

1. PASS del gate;
2. empalme del árbol de la candidata;
3. actualización de manifest/source lock;
4. actualización del registro de baseline;
5. fast-forward de la rama de integración.

Si cualquier paso falla, la candidata no se acepta y la baseline anterior permanece activa.

Contrato obligatorio:

- `backend/contracts/prototype-baseline-registry-v1.json`.
- `tools/qa/verify-prototype-baseline-atomicity.mjs`.
- `.github/workflows/cxorbia-prototype-baseline-atomicity.yml`.

## 2. Estado frontend exacto

### Baseline activa única

- Versión: **V110**.
- Estado: `accepted_and_empalmed`.
- ZIP SHA-256: `1f9e30f711899af500683e7292eb8652e9e0bc4b888cd1252a5482795dbba227`.
- Manifest de empalme: `docs/MANIFEST-V110-UNION-EMPALME-R1.json`.
- Aggregate: `b590f500a67f28fb911698f7a3c457eddd31ddad794efdfb760587630f7037b3`.

### Candidata V113

- ZIP SHA-256: `7bcbb57fcc7c1cd892ec3631a097468f54cc68058d07635b218990ee46cc52a5`.
- Estado: `rejected_requires_correction`.
- No aceptada.
- No empalmada.
- No reemplaza V110.
- Próxima correctiva esperada: V114 incremental sobre V113.

V113 sí resolvió la separación base proyecto/periodo y preservó Mi Día/ranking, pero falló el gate atómico por:

1. `verify-manifest.mjs` continúa leyendo `MANIFEST-V111.json`;
2. siete escrituras directas de `currentPeriodId` fuera de `core/data.js` pueden desincronizar proyecto/periodo;
3. dos filtros de periodo continúan usando `currentProjectId`;
4. Academia todavía afirma que ambos IDs son el mismo valor.

## 3. Metodología de cada nueva candidata

1. Comparar solo contra la candidata incremental inmediata.
2. Contrastar contra el paquete exacto enviado a Claude.
3. Ejecutar un batch:
   - delta de archivos;
   - `node --check`;
   - manifest literal;
   - gate semántico focalizado;
   - prueba runtime requerida.
4. Decidir:
   - PASS y promoción atómica completa;
   - FAIL y máximo tres gaps agrupados.
5. Documentar una sola vez después de la decisión.

No se relee todo el PR, no se revisan módulos no modificados y no se espera CI ajeno al bloque.

## 4. Plan vigente Phase A

1. `R21_R23_ATOMIC_AUDIT_EMPALME_V114`.
2. `R24_NEW_EMPTY_FIREBASE_DEV_EXTERNAL_IAM_RESOLUTION`.
3. `R25_CX_DATA_DEV_BACKEND_CONNECTION`.
4. `R26_AUTH_ROLES_STORAGE_MINIMUM`.
5. `R27_CONTROLLED_TYA_IMPORT`.
6. `R28_HR_PLATFORM_MAKE_SYNC`.
7. `R29_SEMANTIC_ROLE_PERIOD_SMOKE`.
8. `R30_PRODUCTION_GO_NO_GO`.
9. `R31_CONTROLLED_PRODUCTION_DEPLOY`.

## 5. Backend cerrado y no reabierto

- R18A: PASS.
- R18B: PASS.
- Normalización de fechas aplicada.
- Máquina de estados/domain mapping aplicados.
- HR source-safe: 14 periodos, 28 tabs y 616 visitas.
- R11D: un conflicto source-level; cero identidades inventadas.
- R14C: 196 enlaces financieros exactos aplicados.
- Cero pagos confirmados o inferidos.
- Importadores de pagos/certificaciones existentes.

## 6. Bloqueo externo real

R24 continúa bloqueado por Google Cloud IAM para crear el proyecto nuevo y vacío.

- GitHub bloqueado: no.
- Proyecto objetivo creado: no.
- Base existente reutilizada: no.
- Writes/import/deploy/producción: no.

## 7. Claude/prototipo

El paquete V113 → V114 contiene únicamente:

1. eliminar escrituras directas y mantener ambos estados sincronizados;
2. corregir filtros residuales y texto Academia;
3. hacer el verificador de manifest dinámico y literal.

No reabrir Mi Día, ranking/scoring, login, país, modal protegido, Academia restante ni backend.

## 8. Clasificación

- **Reusable CXOrbia:** promoción atómica, registro único de baseline, manifest dinámico, estados canónicos.
- **Exclusivo TyA/Cinépolis:** HR, Q1/Q2, junio, GT/HN y overlays reales.
- **Claude/prototipo:** tres gaps V113 → V114.
- **Academia:** corregir solo la explicación de IDs proyecto/periodo.
- **Sin impacto Claude:** IAM, Firebase, adapters, importadores y workflows backend.

## 9. Cierre obligatorio de cada iteración

1. Plan vigente.
2. Bloque trabajado.
3. Cambios y verificación.
4. Avance Phase A.
5. Trabajo no reabierto.
6. Siguiente bloque exacto.
7. Bloqueos reales.
8. Claude/prototipo.
9. Reusable CXOrbia.
10. Exclusivo TyA/Cinépolis.
11. Academia/manuales/cursos/rutas/notificaciones.
12. Producción y gates.

Este formato debe ser breve cuando no haya cambios en un carril.

## 10. Producción y gates

- PR #7: draft/open/no merge.
- Baseline activa: V110.
- V113: rechazada/no empalmada.
- Producción: HOLD.
- Firebase nuevo: bloqueado por IAM externo.
- Firestore/Auth/Storage writes: HOLD.
- Imports: HOLD.
- Make/Gemini/pagos: HOLD.
