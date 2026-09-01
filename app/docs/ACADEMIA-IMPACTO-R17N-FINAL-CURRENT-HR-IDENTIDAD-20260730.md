# ACADEMIA — IMPACTO R17N FINAL / HR ACTUAL / IDENTIDAD REAL

Fecha: 2026-07-30

## Conceptos que deben incorporarse

1. **Fuente viva vs snapshot:** un snapshot source-safe es evidencia histórica, no verdad operativa perpetua. Antes de una migración debe verificarse frescura. En TyA, el snapshot de 210 refs fue superado por la HR viva actual de 208 refs (+2/-4/206 intersección).
2. **Privacidad técnica vs identidad operativa:** sanitizar GitHub/logs no significa anonimizar la aplicación. La plataforma autorizada necesita identidad real; PII sensible se protege por RBAC/Rules.
3. **Identidad multi-fuente:** referencia HR, perfil shopper, Auth y certificación son entidades relacionadas pero no equivalentes. El enlace se demuestra por llaves/evidencia y los conflictos pasan a review.
4. **No name-only automerge:** el nombre puede ser visible y aportar evidencia, pero no puede ser la única llave automática para fusionar personas.
5. **Identidad transaccional:** `visitId`, `hrRowId`, `sourceSheet+sourceRow` permiten recuperar vínculos históricos sin copiar la lógica del legacy.
6. **Idempotencia antes de writes:** el plan final se congela con grupos, conteos y hash reproducible antes de autorizar materialización.
7. **Fail-closed del gate:** un workflow no puede declarar PASS por encontrar un artefacto viejo; el status debe depender del resultado real del job.
8. **Contrato stale:** cuando un contrato histórico contiene un conteo fijo ya superado (R14C shoppers=210), no se fuerza para hacer pasar el gate; se conserva la evidencia financiera por `visitId` y se actualiza la capa que depende de la fuente viva.

## Caso TyA documentable

- Backend canónico existente reutilizado.
- Legacy retirado usado solo como fuente de shoppers/certificaciones útiles.
- HR actual hasta julio: 616 visitas / 208 refs.
- 201 refs reutilizan perfiles canónicos, 2 enlazan perfiles legacy create-candidate, 5 son perfiles nuevos desde identidad HR actual.
- 208/208 referencias actuales tienen target; 0 HOLD de identidad actual.
- 77 certificaciones listas y 1 HOLD.
- 572 controles de liquidación; 0 pagos ejecutados.
- R17N final no-execute: 1,406 writes potenciales exactos; 0 ejecutados.

## Manuales/cursos por rol

- Admin/Operativo: identidad real necesaria para operación, histórico, certificación y liquidación.
- Shopper: perfil propio, certificación y movimientos autorizados.
- Cliente: solo información dentro de su alcance contractual/proyecto.
- Seguridad: distinguir datos operativos visibles por rol de datos altamente sensibles (DPI, banco, NDA, adjuntos) con controles adicionales.

## Estado

Sin impacto frontend inmediato. Actualizar contenidos cuando la materialización y smoke validen el comportamiento real.
