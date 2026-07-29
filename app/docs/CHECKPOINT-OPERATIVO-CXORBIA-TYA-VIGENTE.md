# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__CORTE4_SANDBOX_LEARNINGS_PRESERVED__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_READONLY_INVENTORY_ACTIVE__NO_DATA_WRITES`

## 1. Repositorio y seguridad
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción/merge/imports/pagos y provider data writes reales: 0 en este bloque.

## 2. Corrección de arquitectura vinculante
La expresión histórica “base anterior/base vieja” corresponde a la **plataforma legacy TyA Consultores actualmente operativa y destinada a retiro**.

No corresponde a `cxorbia-backend-dev`.

Identidades canónicas:
1. Legacy TyA Consultores: sistema actual a retirar; solo origen de datos útiles limpios.
2. `cxorbia-backend-dev`: backend DEV de CXOrbia ya construido, con TyA como primer tenant; debe reutilizarse según inventario y no excluirse por estar poblado.
3. `cxorbia-tya-dev-260729-c4`: sandbox técnico creado por interpretación incorrecta; no destino de materialización.
4. Hosting público actual de TyA: se conserva como URL de cutover final; la app legacy será reemplazada por CXOrbia cuando Phase A esté lista.

Prevalece `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`.

## 3. Corte 3 — FROZEN / ACTIVE_BASELINE
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada.
- 14 periodos / 616 visitas.
- HR remota y finanzas/pagos técnicamente validados.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 4. Sandbox Corte 4 — propósito cerrado como validación técnica
En `cxorbia-tya-dev-260729-c4` se demostraron y corrigieron:
- VIS-01: fallback prohibido demo/localStorage;
- VIS-02: Admin blanco/estado vacío y shell residual;
- VIS-02B: script huérfano reescrito como HTML por Hosting;
- 0 pageerrors remoto;
- Admin vacío → logout → Shopper vacío → logout → Admin vacío: PASS automatizado;
- visual humana mostró Admin vacío y Shopper vacío correctamente;
- 0/0/0/0 y sin datos demo.

Estos fixes se preservan como aprendizaje/core reusable. **No se materializa TyA en este sandbox.**

## 5. Backend canónico recuperado: `cxorbia-backend-dev`
La continuidad histórica confirma que este proyecto es el backend DEV de CXOrbia usado desde junio para el primer tenant TyA, no la plataforma legacy.

Se inició inventario read-only con herramienta `tools/qa/cxorbia-canonical-backend-readonly-inventory.mjs`.

Primer inventario seguro comprobó:
- projectId exacto `cxorbia-backend-dev`;
- Auth users=17;
- Firestore raíz `tenants` existe con 1 documento;
- provider writes=0;
- sin valores sensibles exportados.

El primer barrido solo vio raíz; se amplió el inventario a subcolecciones de manera read-only antes de concluir conteos de proyectos/shoppers/certificaciones/visitas.

## 6. Refresh legacy requerido, sin reproceso
El extract/prompt legacy previo ya no es corte final porque la plataforma TyA continuó operando.

Refresh limitado a:
- shoppers nuevos/actualizados;
- certificaciones nuevas presentadas/aprobadas;
- no volver a tomar visitas como fuente principal si HR ya contiene la verdad operacional;
- dedupe por llave estable;
- conflictos a revisión;
- no copiar fixes/parches/código legacy.

Para no depender de una fecha exacta, se prefiere export sanitizado de shoppers+certificaciones y diff contra el backend canónico, no reexport completo de toda la plataforma.

## 7. Ruta real hacia producción
`LEGACY TYA (delta útil) + HR VIVA → cxorbia-backend-dev / tenant tya → completar Phase A → preprod/smoke/rollback → cutover sobre Hosting público actual`.

No crear otro Firebase ni repetir materialización en el sandbox.

## 8. Gate siguiente exacto
`CERRAR INVENTARIO READ-ONLY RECURSIVO DE cxorbia-backend-dev → MAPEAR QUÉ YA EXISTE/QUÉ FALTA → PREPARAR DELTA LEGACY SHOPPERS+CERTIFICACIONES → CONTINUAR PHASE A DESDE EL FALTANTE REAL`.

No PowerShell para Paula, no nueva candidata, no nueva base, no Hosting/deploy ni producción en este gate.

## 9. Claude/prototipo y Academia
- Claude: no nueva candidata por la corrección de arquitectura; preservar fixes core/entrypoint descubiertos en sandbox.
- Academia: incorporar distinción legacy/origen vs backend canónico vs sandbox y estrategia de cutover sin cambio de URL pública.
- Reusable CXOrbia: migración incremental y recuperación de backend canónico existente.
