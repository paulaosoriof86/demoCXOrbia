# ADDENDUM MAESTRO — EMPALME DIRECTO Y CARRIL FILE-AWARE CXORBIA TyA

**Fecha de emisión:** 2026-07-17  
**Última actualización:** 2026-07-18  
**Estado:** ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE  
**Nombre canónico:** `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

## 0. Lock prevalente

Para toda candidata frontend auditada `GO` y sin `P0_PROVEN`, la única operación permitida es:

`APPLY_DELTA_DIRECTLY`

sobre la rama viva `docs-tya-v6-v71-audit`.

Ningún documento, conversación, limitación temporal de herramienta, tamaño del ZIP o demora puede sustituir este método por composite previo obligatorio, `incoming/`, plan JSON, CMD/PowerShell, workflow transportador, nueva rama/PR, copias manuales, nueva candidata o reauditoría.

Solo un `P0_PROVEN` con evidencia reproducible y autorización expresa de Paula en la conversación actual permite detener el empalme o proponer otro método.

La revisión visual y los gates funcionales se ejecutan después del empalme atómico. Un fallo post-gate se corrige focalizadamente sobre la rama viva; no invalida retroactivamente el método de empalme ni autoriza reconstrucciones paralelas.

## 1. Mantenimiento y prevalencia

Este archivo es la única fuente maestra vigente para recepción, auditoría y empalme de candidatas CXOrbia TyA.

Se reemplaza bajo el mismo nombre. No se crean copias con fecha, `(1)`, `V2`, `final` ni documentos alternativos.

Ante contradicción con otro documento, prevalece este lock.

## 2. Lectura obligatoria

Antes de responder, auditar, modificar, documentar o cerrar un bloque:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. documento maestro de continuidad vigente;
3. este addendum;
4. addenda vigentes de Academia, patrones reutilizables y antidesvío;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. source lock/checkpoint contractual más reciente;
8. `CAMBIOS-BACKEND.md` y addendum vigente;
9. `RESUMEN-PARA-CLAUDE.md` y addendum vigente;
10. `PENDIENTES-PROTOTIPO.md` y addendum vigente;
11. PR #7 y HEAD de la rama viva.

No se piden datos ya entregados ni se reinician metodología, reglas, mapeos, adapters o Phase A.

## 3. Destino fijo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR existente: `#7`
- Base: `release/cxorbia-tya-rc-20260630`
- Destino prohibido: `main`
- No nueva rama
- No nuevo PR
- No `force`

Antes de modificar, commit y push se verifica repo, rama y HEAD. Si no coinciden, se detiene sin escribir.

## 4. Gate obligatorio `EXECUTION_LANE_READY`

Antes de auditar una candidata se registra:

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
REPO_CHECKOUT_AVAILABLE=true
TARGET_REPOSITORY=paulaosoriof86/demoCXOrbia
TARGET_BRANCH=docs-tya-v6-v71-audit
AUTHENTICATED_COMMIT_PUSH_AVAILABLE=true
HEAD_BEFORE=<sha>
WORKTREE_STATE=<clean|documented>
```

Solo con todos los valores críticos verdaderos se declara `EXECUTION_LANE_READY`.

Si alguno es falso:

- declarar `EXECUTION_LANE_NOT_READY` inmediatamente;
- no iniciar auditoría extensa;
- no declarar GO;
- no pedir otra candidata;
- no generar paquete Claude;
- no reconstruir el ZIP por conectores o workflows;
- no trasladar tareas manuales a Paula;
- cambiar al workspace file-aware correcto.

## 5. Sesión única

Recepción, hash, inventario, auditoría delta, decisión GO/P0, aplicación, commit y push deben ocurrir:

- con la misma candidata;
- en el mismo workspace;
- con el mismo checkout;
- sobre la misma rama;
- sin trasladar el empalme a otra conversación o herramienta sin los bytes extraídos.

## 6. Estados válidos

- `EXECUTION_LANE_NOT_READY`
- `EXECUTION_LANE_READY`
- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_GO_READY_DIRECT_APPLY`
- `EMPALMED_PENDING_POST_GATES`
- `TECHNICAL_PASS_PENDING_VISUAL`
- `ACTIVE_BASELINE`

No se declara GO si el carril no está listo. Después de GO, la siguiente acción es aplicación directa.

## 7. Auditoría incremental

La auditoría compara únicamente:

1. candidata inmediata anterior;
2. baseline/source lock viva;
3. backend, contratos, adapters, tools, overlays y documentación que deben preservarse.

Se separa:

- delta nuevo;
- acumulado heredado;
- pendiente vivo;
- regresión;
- hallazgo nuevo;
- P0;
- P1/P2.

No se repite una auditoría cerrada sin insumo nuevo.

## 8. Criterio P0

Solo bloquea el empalme evidencia reproducible de:

- app que no inicia;
- sintaxis o ruta esencial rota;
- pérdida crítica;
- secreto o dato sensible expuesto;
- write, deploy, proveedor, pago o producción no autorizado;
- regresión que impida Phase A.

P1/P2 se documentan y no bloquean.

## 9. Operación única cuando hay GO

Al alcanzar `AUDITED_GO_READY_DIRECT_APPLY`:

1. congelar `HEAD_BEFORE`;
2. aplicar el delta auditado directamente al checkout de la rama viva;
3. preservar backend, contratos, adapters, tools, overlays y documentos vivos;
4. confirmar cero archivos del delta pendientes;
5. ejecutar verificaciones estructurales mínimas;
6. crear un único commit de empalme;
7. hacer push a la rama viva;
8. registrar `HEAD_AFTER`;
9. generar manifest, build-lock y verificador;
10. ejecutar gates post-empalme;
11. ejecutar validación visual;
12. corregir focalizadamente cualquier diferencia reproducible;
13. congelar baseline solo con evidencia y `APROBADO`.

## 10. Atomicidad

Una candidata solo está empalmada cuando existen conjuntamente:

- commit SHA verificable;
- push comprobado;
- delta completo;
- cero archivos pendientes;
- backend protegido;
- documentos vivos reconciliados;
- `HEAD_AFTER` registrado.

Ante fallo durante la aplicación:

1. detener;
2. no continuar con otro archivo;
3. restaurar el estado previo;
4. documentar el fallo exacto;
5. no declarar unión parcial.

## 11. Preservación obligatoria

Se conserva:

- interfaz exacta de `CX.data`;
- backend nuevo y limpio;
- contratos, adapters, tools, gates y overlays;
- multi-tenant por `tenantId`;
- multi-proyecto por `projectId`;
- Cinépolis como proyecto configurable;
- HR e histórico completo;
- shoppers, postulaciones y certificaciones presentadas;
- liquidaciones y pagos;
- sincronización HR/plataforma;
- Academia, manuales, rutas por rol y notificaciones;
- UTF-8 sin BOM;
- ausencia de secretos y datos sensibles.

No se conecta ni copia la base vieja. No se parchea UI desde backend.

## 12. Documentos vivos

Se reconcilian, no se reemplazan a ciegas:

- `CAMBIOS-BACKEND.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- documentación de Academia;
- tracker, source lock y checkpoint;
- manifest/build-lock/verificador.

## 13. Prohibiciones

Queda prohibido como sustituto del carril file-aware:

- aplicar una candidata completa archivo por archivo mediante Contents API;
- usar blobs/trees como transporte fragmentado;
- Base64, Drive, `incoming/`, plan JSON, `.cmd` o PowerShell para Paula;
- workflow como transportador;
- nueva rama o PR;
- escribir en `main`;
- solicitar otra candidata cuando la actual está GO;
- reauditar por falta de carril;
- declarar éxito sin commit, push y HEAD verificables.

## 14. Circuit breaker antidemora

1. La primera respuesta operativa indica `EXECUTION_LANE_READY` o `EXECUTION_LANE_NOT_READY`.
2. No más de un bloque de diagnóstico sin evidencia o cambio de estado.
3. Después de GO, la siguiente acción es `APPLY_DELTA_DIRECTLY`.
4. Si una respuesta adicional transcurre sin commit, se declara el bloqueo exacto.
5. No se promete trabajo en segundo plano.
6. Una limitación del carril se informa antes de auditar, no después.

## 15. Estado seguro

Este addendum no autoriza merge, deploy, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni proveedores externos.