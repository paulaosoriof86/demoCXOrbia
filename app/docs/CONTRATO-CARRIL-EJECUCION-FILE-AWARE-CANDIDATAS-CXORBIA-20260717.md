# CONTRATO VINCULANTE — CARRIL DE EJECUCIÓN PARA CANDIDATAS CXORBIA

Fecha: 2026-07-17  
Estado: ACTIVO Y OBLIGATORIO

## 1. Objetivo

Garantizar que toda candidata GO pueda empalmarse inmediatamente mediante un commit atómico sobre la rama viva, sin trasladar acciones técnicas a Paula.

## 2. Destino

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR: `#7`;
- prohibido `main`;
- no nueva rama;
- no nuevo PR.

## 3. Carriles válidos

### A. File-aware checkout

Candidata extraída, checkout autenticado, rama viva y commit/push disponibles.

### B. Git nativo atómico autenticado

Candidata extraída, HEAD y árbol base verificables, creación de objetos Git, commit único y actualización fast-forward del ref disponibles.

Blobs y trees están permitidos únicamente como primitivas internas del commit atómico. No se permiten como transporte manual o fragmentado.

## 4. Gate

Registrar los bytes, extracción, repo, rama y HEAD. Además debe estar disponible el carril A o el carril B con árbol base y fast-forward.

Solo entonces declarar `EXECUTION_LANE_READY`.

## 5. Secuencia

Recibir, verificar carril, calcular hash, auditar, decidir GO/P0, ejecutar `APPLY_DELTA_DIRECTLY`, preservar backend, generar manifest/build-lock, crear un único commit, mover la rama por fast-forward, verificar diff/HEAD y ejecutar gates.

## 6. Atomicidad

Solo existe empalme cuando hay commit SHA, fast-forward, delta completo, cero archivos pendientes, backend preservado y HEAD posterior verificable.

## 7. Prohibiciones

- Contents API serial como transporte;
- blobs/trees como transporte manual o fuera de un commit atómico;
- workflows, Drive, Base64, `incoming/`, plan JSON o PowerShell;
- nueva rama o PR;
- escribir en `main`;
- force update;
- pedir acciones técnicas a Paula;
- reauditar una candidata GO por falta de carril;
- declarar éxito sin evidencia.

## 8. Estado seguro

No autoriza merge, deploy, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
