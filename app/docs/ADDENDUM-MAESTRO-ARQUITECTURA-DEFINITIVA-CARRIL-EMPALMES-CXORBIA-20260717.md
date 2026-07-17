# ADDENDUM MAESTRO — ARQUITECTURA DEFINITIVA DEL CARRIL DE EMPALMES CXORBIA

Fecha: 2026-07-17
Estado: ACTIVO, OBLIGATORIO Y PREVALENTE

## 1. Diagnóstico raíz vinculante

La causa raíz de los bloqueos de empalme no fue el tamaño de las candidatas ni la cantidad de archivos. Fue intentar unir dos planos separados:

- candidata/ZIP disponible en la conversación;
- repositorio Git accesible únicamente mediante conector API.

Ese modelo no garantiza copia directa, commit y push atómicos de candidatas completas. Por tanto, queda descartado como carril de empalme.

## 2. Arquitectura definitiva

El carril permanente es:

`Claude Design → ZIP → auditoría ChatGPT → plan JSON → workspace local con ZIP + checkout Git autenticado → integrador determinístico → commit/push → verificación ChatGPT → validación visual`.

El workspace local es el plano de ejecución. El conector GitHub se usa para consulta, documentación, verificación y cambios textuales pequeños; no para transportar candidatas completas.

Codex es apoyo puntual para instalación o conflictos complejos. No es requisito de cada candidata y su límite no bloquea el flujo ordinario.

## 3. Componentes obligatorios

- `tools/integration/workspace-preflight.mjs`.
- `tools/integration/empalme-candidate.mjs`.
- `tools/integration/run-latest.mjs`.
- `tools/integration/CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd`.
- `tools/integration/policies/cxorbia-product.json`.
- política explícita de tenant.
- perfiles opcionales de proyecto.
- `backend/contracts/integration-lane-architecture-lock-v1.json`.
- `tools/qa/assert-integration-architecture-lock.mjs`.
- carpeta local `incoming/`, excluida de Git.

## 4. Invariantes no negociables

1. El motor pertenece al producto CXOrbia.
2. CXOrbia es multi-tenant.
3. Cada tenant es multi-proyecto.
4. No existe proyecto global por defecto.
5. Toda selección de tenant y proyecto es explícita.
6. Cinépolis es únicamente el primer proyecto operativo de TyA.
7. Ninguna cifra, HR, cuestionario, certificación, pago o regla de Cinépolis se convierte en default del tenant o del producto.
8. Los siguientes proyectos TyA deben poder crearse/configurarse desde la plataforma.
9. Los siguientes tenants reutilizan el mismo motor con políticas propias.
10. El backend, contratos, adapters, tools, docs y overlays protegidos no son reemplazados por una candidata frontend.
11. El ZIP y el checkout Git autenticado deben coexistir en el mismo workspace antes de empalmar.
12. El preflight debe pasar antes de copiar archivos.
13. Un FAIL detiene el proceso sin blobs, trees, workflows, Drive, Base64 ni rutas paralelas.
14. Toda candidata se aplica por delta auditado e identidad SHA-256.
15. El integrador debe ser idempotente y registrar candidatas ya aplicadas.
16. Antes de commit debe existir respaldo y rollback automático.
17. No se declara empalme terminado sin commit, push, manifest y build-lock verificables.
18. Gates y smoke se ejecutan después del empalme y antes de DEV/producción según el tenant/proyecto seleccionado.

## 5. Separación de niveles

### Producto CXOrbia

Motor, contratos, políticas generales, seguridad, manifiestos, source lock, preflight, rollback, idempotencia y configurabilidad.

### Tenant TyA

Política multi-proyecto, fuentes disponibles, reglas de acceso y catálogo de gates aplicables al tenant. No define un proyecto por defecto.

### Proyecto Cinépolis

Perfil opcional de validación con sus cifras y reglas particulares. Nunca modifica defaults de TyA ni del producto.

### Otros proyectos y tenants

Cada uno incorpora una política/perfil explícito sin modificar el motor común.

## 6. Control de cambios de arquitectura

Esta arquitectura no se reabre por demora, preferencia de una conversación o limitación puntual del conector.

Solo puede modificarse cuando exista:

- un P0 técnico demostrado que impida operar el carril;
- evidencia reproducible de la causa;
- propuesta compatible con multi-tenant/multi-proyecto;
- autorización expresa de Paula;
- actualización conjunta del addendum, contrato de arquitectura, validador, `AGENTS.md` y documentación obligatoria.

Sin esos cinco elementos, el carril vigente se mantiene.

## 7. Orden operativo por candidata

1. Leer fuentes, source lock, tracker y PR.
2. Auditar la candidata y emitir decisión GO/P0.
3. Generar plan JSON con SHA, branch, HEAD, tenant, proyectos explícitos y delta.
4. Ejecutar `assert-integration-architecture-lock.mjs`.
5. Ejecutar preflight local.
6. Aplicar con `empalme-candidate.mjs`.
7. Verificar commit/push, manifest, build-lock y registro.
8. Ejecutar gates por tenant/proyecto.
9. Actualizar Phase A, Claude, Academia y pendientes.
10. Solicitar validación visual únicamente cuando el bloque técnico esté cerrado.

## 8. V156

V156 permanece `AUDITED_GO_READY_DIRECT_APPLY`, con 35 archivos modificados y 0 eliminados. Su ejecución debe usar exclusivamente este carril. No se considera empalmada hasta tener evidencia física del commit/push y build-lock V156.

## 9. Estado seguro

Este addendum no autoriza merge, deploy, producción, importaciones reales, Firestore/HR writes, Make/Gemini live, Storage real ni pagos.
