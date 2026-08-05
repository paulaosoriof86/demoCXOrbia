# CXOrbia TyA — instrucciones de ejecución vigentes

## Autoridad y continuidad

Antes de actuar, leer en este orden:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. fuentes activas declaradas por el índice;
6. PR #7 y HEAD remoto de la rama viva.

Ante conflicto, prevalecen el índice vigente, el checkpoint vigente y el addendum de carril directo.

## Rama y PR únicos

- Repositorio: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR existente: `#7`.
- No crear rama, PR, candidata o metodología paralela.
- No usar `main`, merge o producción sin autorización expresa.

## Carril directo obligatorio

CXOrbia no depende de Codex para escribir en GitHub.

`ATOMIC_DIRECT_APPLY_AVAILABLE` se satisface por cualquiera de estos carriles ya instalados:

1. checkout Git autenticado con commit/push directo; o
2. `CXORBIA_ATOMIC_APPLY_RUNNER` mediante `.github/cxorbia-apply-requests/request.json`.

Los gates post-aplicación se ejecutan mediante `CXORBIA_READONLY_POST_GATES_RUNNER` y `.github/cxorbia-gate-requests/request.json` cuando corresponda.

Codex es opcional. Nunca debe convertirse en requisito, dependencia operativa ni acción manual de Paula cuando los runners controlados estén disponibles.

## Aplicación de deltas

Para toda candidata auditada GO y sin P0 demostrado:

- aplicar el delta directamente sobre la rama viva;
- conservar backend, overlays, contratos, documentos y autoridades canónicas;
- producir un solo commit funcional atómico;
- verificar parent, hashes, allowlist, diff, push y HEAD remoto;
- ejecutar los gates posteriores sobre el HEAD exacto;
- detenerse antes de deploy salvo autorización expresa.

El runner atómico debe:

- consumir una solicitud de una sola ejecución;
- validar `expectedParentSha` y hashes actuales/destino;
- limitarse a archivos allowlisted;
- eliminar la solicitud en el commit funcional;
- dejar worktree limpio;
- publicar evidencia verificable.

## Prohibiciones

- Contents API secuencial para cambios funcionales;
- mutaciones directas de árboles funcionales fuera del runner controlado;
- workflows transportadores improvisados;
- nuevas ramas o PR;
- PowerShell, CMD o pasos manuales para Paula;
- reconstrucciones de candidatas;
- auditorías generales cuando existe un delta focalizado;
- relajación de gates, wildcard o hardcode de PASS;
- deploy, Firestore/Auth/Storage/HR writes, Make, Gemini, pagos, merge o producción sin autorización y gate correspondiente.

## Regla de oro del prototipo

- No rediseñar ni reescribir `/app/modules` o `/app/core` desde backend.
- No parchar UI desde backend salvo delta frontend auditado y autorizado.
- Mantener la interfaz exacta de `CX.data`.
- Mantener multi-tenant por `tenantId` y multi-proyecto por `projectId`.
- Preservar HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos y sincronización HR/plataforma.
- No conectar ni copiar la base legacy.

## Documentación y cierre

Registrar cada bloque en CAMBIOS, checkpoint, índice, resumen para Claude, pendientes e impacto Academia según aplique.

No afirmar PASS, commit, push, deploy o producción sin evidencia reproducible.

El cierre debe indicar:

- qué se hizo;
- HEAD anterior y nuevo;
- archivos y gates;
- qué se preservó;
- impacto Phase A, Claude y Academia;
- pendiente real y siguiente acción exacta;
- estado seguro y bloqueo comprobado, si existe.
