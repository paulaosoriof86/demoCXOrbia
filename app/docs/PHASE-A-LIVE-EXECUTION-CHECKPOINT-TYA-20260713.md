# PHASE A — CHECKPOINT VIVO ÚNICO DE EJECUCIÓN TYA

Fecha de actualización: 2026-07-14  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama de integración: `docs-tya-v6-v71-audit`  
PR: `#7` draft/open/no merge

## 1. Regla de precedencia

Este archivo es el checkpoint operativo de cada iteración normal.

En una iteración normal solo se revisan:

1. este checkpoint;
2. el diff del bloque;
3. el resultado de su validador o workflow;
4. el estado de PR #7.

El maestro y los addenda se releen completos únicamente al abrir conversación, ante conflicto de fuente, cambio de baseline, autorización productiva o cambio de alcance.

## 2. Objetivo único vigente

Cerrar Phase A TyA con:

- V111 auditada y empalmada sobre V110;
- HR TyA como fuente operacional;
- periodos, visitas, shoppers, certificaciones, liquidaciones y pagos correctos;
- Firebase DEV nuevo y vacío;
- conexión real por el punto único de `CX.data`;
- Auth, Storage y sincronización controladas;
- smoke semántico por rol y periodo;
- deploy productivo solo después del GO.

## 3. Baseline y carriles paralelos

### Frontend

- Baseline vigente: **V110**.
- Claude está terminando V111 con el paquete focalizado ya enviado.
- V111 no será baseline hasta auditoría diferencial contra V110 y el paquete exacto.
- Siguiente acción al recibirla: `R21_R23_AUDIT_AND_EMPALME_V111_WHEN_RECEIVED`.

### Backend

- R18A: PASS.
- R18B: PASS.
- Bloque actual: `R24_NEW_EMPTY_FIREBASE_DEV`.
- Estado: bloqueado por IAM externo de Google Cloud, no por GitHub.

## 4. Estado real alcanzado y que no se reabre

- Normalización de fechas Excel/ISO existente y aplicada.
- Máquina de estados y domain mapping existentes y aplicados.
- HR source-safe: 14 periodos, 28 tabs y 616 visitas.
- R11D aplicado como un solo conflicto source-level; cero identidades inventadas.
- R14C: 196 enlaces financieros exactos aplicados.
- Cero pagos confirmados o inferidos.
- Certificaciones pendientes de fuente/revisión, sin pedir repetición automáticamente.
- V110 empalmada físicamente.
- R10: 13/13 rutas sin errores de consola.

No se reabren:

- normalizador de fechas;
- máquina de estados;
- domain mapping;
- R11–R11D;
- R14C;
- importadores de pagos/certificaciones;
- P0 cerrados en V110.

## 5. Bloque activo único

`R24_NEW_EMPTY_FIREBASE_DEV`

### Resultado actual

Workflow R24: `29299756581` — ejecución GitHub completada con `success`.

Decisión de proveedor:

`BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`

Comprobado:

- GitHub bloqueado: no.
- Credencial disponible: service account de `cxorbia-backend-dev`.
- Credencial dedicada con Project Creator: no disponible.
- Creación atómica intentada con autorización previa: sí.
- Google Cloud respondió `PERMISSION_DENIED`.
- Proyecto objetivo: `cxorbia-tya-dev-260714-r24`.
- Proyecto creado: no.
- Firebase agregado: no.
- Base existente reutilizada: no.
- Auth/Firestore/Storage inicializados: no.
- Import, deploy o producción: no.

### Única acción externa indispensable

Una identidad administradora debe realizar una sola de estas acciones:

1. conceder a una identidad dedicada permiso de creación de proyectos; o
2. crear una vez el proyecto vacío `cxorbia-tya-dev-260714-r24`, sin Analytics, billing, Auth, Firestore, Storage, Hosting, apps ni datos.

Después se ejecutará verificación sanitizada y se continuará con R25.

## 6. Diagnóstico de los aparentes bloqueos GitHub

No había un bloqueo general de GitHub comparable con Orbit. Había tres causas distintas:

1. **Fan-out excesivo:** un commit en la rama de PR disparó más de veinte workflows históricos.
2. **Fallo CI falso:** el validador del checkpoint estaba hardcodeado en R18A aunque el contrato ya avanzó a R24.
3. **Bloqueo real externo:** Google Cloud IAM negó `projects.create`; el job GitHub sí terminó correctamente.

## 7. Política CI aplicada desde R24

- PR #7 queda como rama de integración, no como rama de prueba iterativa.
- Cada bloque usa rama focalizada `phase-a/<bloque>-<fecha>`.
- Un workflow focalizado por bloque.
- Filtros por rama y ruta.
- `concurrency` con cancelación de runs anteriores.
- Se agrupan cambios y se hace un solo fast-forward a la rama de integración después de una decisión.
- Un bloqueo del proveedor se reporta como `providerBlocked=true`, no como fallo GitHub.
- No se reejecuta todo el PR de 2,000+ commits para diagnosticar un bloque puntual.

## 8. Plan restante Phase A

1. `R24_NEW_EMPTY_FIREBASE_DEV` — pendiente de la única acción IAM externa.
2. `R21_R23_AUDIT_AND_EMPALME_V111_WHEN_RECEIVED` — ejecutar apenas Claude entregue.
3. `R25_CX_DATA_DEV_BACKEND_CONNECTION`.
4. `R26_AUTH_ROLES_STORAGE_MINIMUM`.
5. `R27_CONTROLLED_TYA_IMPORT`.
6. `R28_HR_PLATFORM_MAKE_SYNC`.
7. `R29_SEMANTIC_ROLE_PERIOD_SMOKE`.
8. `R30_PRODUCTION_GO_NO_GO`.
9. `R31_CONTROLLED_PRODUCTION_DEPLOY`.

## 9. Control de tiempo y agilidad

- Cada iteración entrega un cambio verificable o un bloqueo concreto.
- No se dedica una iteración solo a releer o documentar.
- Diagnóstico normal: checkpoint, diff, validador y PR.
- Mientras un carril espera una entrada externa, se continúa el otro.
- Al recibir V111 se detiene cualquier trabajo no crítico y se audita/empalma inmediatamente.

## 10. Cierre obligatorio de cada iteración

Toda respuesta debe incluir:

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
11. Academia, manuales, cursos, rutas y notificaciones.
12. Producción y gates.

## 11. Clasificación vigente

- **Reusable CXOrbia:** integración canónica, estados separados, metadata snapshot/runtime, perfiles protegidos, overlays y política CI focalizada.
- **Exclusivo TyA/Cinépolis:** HR, reglas Q1/Q2, junio, GT/HN y resultados financieros concretos.
- **Claude/prototipo:** V111 para periodo, login/alcance y shopper protegido.
- **Academia:** proyecto vs periodo, snapshot vs runtime, estados, perfiles protegidos y lectura de gates.
- **Sin impacto Claude:** IAM Google Cloud, creación del proyecto, workflows y validadores backend.

## 12. Estado de producción y gates

- PR #7: draft/open/no merge.
- Producción: HOLD.
- V110: baseline.
- V111: pendiente de entrega y auditoría.
- R17: evidencia NO-GO.
- Firebase DEV nuevo: no creado por IAM.
- Firestore/Auth/Storage writes: HOLD.
- Imports: HOLD.
- Make/Gemini/pagos: HOLD.
- Siguiente acción ejecutable inmediata: auditar V111 al recibirla; en paralelo resolver la única acción IAM de R24.
