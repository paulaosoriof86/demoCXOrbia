# CONTRATO VINCULANTE — CARRIL FILE-AWARE PARA CANDIDATAS CXORBIA

Fecha: 2026-07-17
Estado: ACTIVO Y OBLIGATORIO

## 1. Objetivo

Evitar que una candidata auditada GO quede atrapada entre un ZIP accesible por archivos y un repositorio accesible solo mediante llamadas aisladas. Toda candidata futura debe auditarse y empalmarse dentro del mismo workspace file-aware, con la candidata descomprimida y el checkout autenticado del repositorio disponibles simultáneamente.

## 2. Carril obligatorio

Antes de iniciar una auditoría completa deben estar disponibles en una sola sesión:

1. bytes reales del ZIP candidato y capacidad de descomprimirlo;
2. checkout de `paulaosoriof86/demoCXOrbia`;
3. rama viva `docs-tya-v6-v71-audit` seleccionada;
4. lectura del HEAD vigente y del árbol de trabajo;
5. capacidad autenticada de commit y push sobre esa misma rama;
6. acceso a manifest, build-lock, validadores y documentación acumulada.

El conector GitHub aislado puede usarse para consultar estado, PR y documentación, pero no como carril primario de empalme de una candidata completa.

## 3. Gate de capacidad previo a la auditoría

Antes de invertir tiempo en la auditoría debe registrarse:

- `CANDIDATE_BYTES_AVAILABLE=true`;
- `REPO_CHECKOUT_AVAILABLE=true`;
- `TARGET_BRANCH=docs-tya-v6-v71-audit`;
- `AUTHENTICATED_COMMIT_PUSH_AVAILABLE=true`;
- `HEAD_BEFORE=<sha>`;
- `WORKTREE_STATE=<clean|documented>`.

Si cualquiera de los cuatro primeros valores es falso, el estado es:

`EXECUTION_LANE_NOT_READY`

En ese estado no se inicia una auditoría larga, no se declara GO y no se intenta reconstruir el ZIP mediante `update_file`, Base64, blobs, trees, workflows, Drive, PowerShell o acciones manuales de Paula. Se cambia de inmediato al workspace file-aware correcto.

## 4. Regla de sesión única

La auditoría, la decisión GO/P0 y la aplicación deben ocurrir en el mismo workspace y sobre la misma candidata. No se divide el proceso entre una conversación que audita y otra herramienta que intenta reconstruir el delta sin acceso simultáneo al ZIP y al checkout.

## 5. Secuencia por candidata

1. Recibir la candidata más reciente.
2. Ejecutar el gate de capacidad del carril.
3. Calcular SHA-256 y verificar inventario.
4. Auditar únicamente contra la baseline/source lock inmediata.
5. Si existe `P0_PROVEN`, detener y documentar evidencia reproducible.
6. Si queda `AUDITED_GO_READY_DIRECT_APPLY`, ejecutar inmediatamente `APPLY_DELTA_DIRECTLY` en la rama viva.
7. Preservar backend, contratos, adapters, tools, overlays TyA y documentación acumulada.
8. Reconciliar solo archivos explícitamente clasificados como vivos; no sobrescribir documentación acumulada a ciegas.
9. Crear un commit verificable de empalme y hacer push a la rama viva.
10. Generar manifest, build-lock, verificador y registro de baseline.
11. Ejecutar gates posteriores y después solicitar validación visual.

## 6. Atomicidad y evidencia

Una candidata solo pasa a `EMPALMED_PENDING_POST_GATES` cuando existe:

- commit SHA verificable;
- delta aplicado completo;
- ausencia de archivos pendientes del delta;
- backend protegido preservado;
- documentación reconciliada;
- HEAD posterior registrado.

Tener algunos archivos copiados no constituye empalme.

## 7. Prohibiciones

Queda prohibido como sustituto del carril file-aware:

- aplicar una candidata completa archivo por archivo mediante el conector;
- crear blobs o trees para transportar contenido;
- usar `main` como destino accidental;
- crear otra rama o PR;
- usar workflows como transporte;
- pedir a Paula descompresión, PowerShell, copias o checkout local;
- declarar GO sin haber confirmado primero que existe carril ejecutable para aplicar inmediatamente;
- convertir una limitación de herramienta en nueva metodología.

## 8. Destino fijo y validación de rama

Para CXOrbia TyA:

- repositorio: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR: `#7`;
- no `main`;
- no nueva rama;
- no nuevo PR.

Antes de commit y antes de push se debe volver a comprobar la rama. Si la rama no coincide, se detiene sin escribir.

## 9. Responsabilidad operativa

Paula solo entrega la candidata. La selección del carril correcto, checkout, auditoría, empalme, commit, push, documentación y gates corresponden al asistente en el workspace file-aware. No se trasladan tareas técnicas manuales a Paula.

## 10. Clasificación

- Reusable CXOrbia: gate de capacidad, sesión única, atomicidad y control de destino.
- Exclusivo cliente: rama y PR actuales de TyA.
- Claude/prototipo: ninguna acción adicional; Claude sigue entregando candidatas completas incrementales.
- Academia: sin impacto de contenido; solo trazabilidad interna del proceso.
- Sin impacto Claude: checkout, commit, push, manifest, build-lock y validadores.

## 11. Estado seguro

Este contrato no autoriza merge, deploy, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
