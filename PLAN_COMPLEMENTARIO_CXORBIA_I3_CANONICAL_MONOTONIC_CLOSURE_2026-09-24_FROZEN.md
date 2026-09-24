# PLAN COMPLEMENTARIO FROZEN — I3 CANONICAL MONOTONIC CLOSURE
## CXORBIA RECOVERY — GO-LIVE
## 2026-09-24

**ID:** `CXORBIA-I3-CANONICAL-MONOTONIC-CLOSURE-PLAN-20260924`  
**Estado:** `FROZEN_ACTIVE_UNTIL_I3_GO`  
**Iteración:** I3 — FUNCTIONAL CLOSURE / PRE-I4  
**Microbloque:** `CXORBIA-PRE-I4-VISUAL-REMEDIATION-MICROBLOCK-20260922`

Este plan complementa, no reemplaza, el Plan Rector Recovery I0–I4. Su único propósito es cerrar I3 rápidamente sin perder ninguna mejora, finding, autoridad modular ni evidencia.

## Objetivo único

Producir UNA candidata DEV:
- canónica;
- acumulativa;
- incremental;
- monotónica;
- compuesta con la última autoridad aprobada de cada módulo;
- con todos los deltas posteriores demostrados;
- con todos los hallazgos VRM-001…VRM-041 gestionados;
- con aceptación humana/semántica real;
- y certificable como el mismo artifact que luego, sólo con autorización, podría pasar a I4.

## C0 — FREEZE DE CAUSA + LEDGER + REGLA MONOTÓNICA

**Estado:** EN EJECUCIÓN / debe cerrar antes de nuevos product writes.

Entregables:
1. Addendum de causa raíz canónica/monotónica.
2. Este plan.
3. Ledger append-only VRM-001…VRM-041.
4. Lock con blobs/commits.
5. Regla: siguiente finding disponible = VRM-042; nunca reutilizar IDs.

Criterio de cierre:
- los tres documentos existen físicamente en la rama canónica;
- HEAD readback confirmado;
- ningún cambio de producto incluido en este freeze;
- producción intacta.

## C1 — SINGLE AUTHORITY ENFORCEMENT

**Tipo:** control-only salvo test mecánico.

Acciones:
1. Crear/derivar un único `CANONICAL_CANDIDATE_DESCRIPTOR` vivo con:
   - productSourceSha/tree;
   - predecessorSourceSha;
   - findingsLedger revision;
   - moduleAuthority revision;
   - expected artifact identity.
2. Eliminar como autoridad ejecutable las sources paralelas de jobs:
   - histórica I3 `77bf74f...`;
   - PRE-I4 `f5b96e...`;
   - semantic `dad7cdda...`;
   - cualquier `github.sha` usado como product source.
   Podrán permanecer sólo como evidencia histórica.
3. Todos los jobs I3/PRE-I4 deben leer la candidata del mismo descriptor/artifact, no redefinirla.
4. Incorporar `MONOTONIC_COMPOSITION_GUARD` al workflow existente:
   - current functional source es descendiente del predecessor;
   - todos los product diffs están asociados a findings abiertos;
   - ningún `PROVEN_CLOSED` pierde owner/blob/comportamiento protegido;
   - no existe segunda source productiva ejecutable.
5. Hacer que readiness sea derivado del ledger + Module Truth + focal, nunca un boolean histórico escrito a mano.

Criterio de cierre:
- guard mecánico PASS;
- búsqueda estática de product-source pointers alternos = 0 autoridades ejecutables;
- no build/deploy de producto requerido para este paso.

## C2 — CIERRE FOCAL DE P0 SIN RECONSTRUIR

La candidata funcional base de continuación es `d8aad982ae4b47e66bf949d906b6c7ede8866f84`. Cualquier product successor debe ser descendiente de ella.

### C2.1 VRM-037 — shopper history/profile/benefits
Prioridad inmediata.
- terminar diagnóstico exacto del sexto registro de José Sarat;
- identificar owner general, no usuario específico;
- contrastar control shopper;
- buscar primero autoridad/delta ya aprobado;
- recuperar exacto si existe;
- si no queda adjudicado rápidamente, corregir directamente el owner actual;
- repetir sólo focal del contrato shopper;
- revalidar Paula s3: histórico=7/KPI=7 + Perfil/Mis Visitas/Beneficios/Reportes;
- revalidar shopper representativo GT y HN.

### C2.2 VRM-036 — Certificaciones
- adjudicar la autoridad histórica aprobada;
- exact identity only;
- no inventar certificaciones ni elegibilidad;
- ambiguos = review-only;
- Module Truth sólo puede pasar a MATCH con composición material demostrada.

### C2.3 VRM-039 — Recursos + Finanzas
Recursos:
- recuperar última autoridad aprobada real;
- count=0 sólo es PASS si la autoridad aprobada define explícitamente empty-state válido;
- Storage/metadata/roles/readback deben estar operativos cuando el contrato lo exige.

Finanzas:
- preservar honorarios/obligaciones HR reales y reembolsos parciales;
- recuperar autoridad aprobada de ingreso/margen/CxC si existe;
- si una fuente legítimamente no existe, clasificarla explícitamente y no llamar módulo completo por simple fail-closed.

### C2.4 Re-prueba obligatoria de VRM ya corregidos
No reimplementar:
- VRM-033 nombres humanos;
- VRM-034 cero QA residue;
- VRM-035 gate semántico;
- VRM-038 cero lenguaje técnico;
- VRM-040 GT=3/HN=1 fuera-de-rango contra misma HR;
- VRM-041 cero undefined/null/UID como copy.

Sólo pasan a `PROVEN_CLOSED` en la candidata acumulativa final.

## C3 — MODULE AUTHORITY + TERMINAL CUMULATIVE PROOF

### C3.1 Module Authority 20/20
Para cada dominio:
- última autoridad aprobada independiente;
- source commit y blob;
- dependency closure;
- load order;
- actual candidate blob;
- served blob;
- finding(s) que lo tocaron;
- evidencia funcional/humana;
- clasificación final.

Estados permitidos:
`MATCH | APPROVED_NOT_COMPOSED | COMPOSED_NOT_DEPLOYED | TRUE_FUNCTIONAL_DEFECT`.

C3 no cierra si existe cualquier estado distinto de MATCH.

### C3.2 Ledger completeness
- VRM-001…VRM-041 deben existir en ledger.
- Ningún ID desaparece.
- Todo finding con impacto actual debe ser `PROVEN_CLOSED`.
- Si aparece un nuevo hallazgo, se agrega VRM-042+ dentro de C2/C3; NO se abre otra iteración.

### C3.3 Un único focal humano exhaustivo
ADMIN:
login, branding, proyecto/período, Mi Día, Dashboard, Visitas, Shoppers, Perfil/Histórico/KPIs, Postulaciones, Reservas, Recursos, Certificaciones, Finanzas/Liquidaciones, Reportes, back/refresh, desktop/mobile, cero técnico/undefined/QA.

SHOPPER:
Paula s3 + GT + HN: login, identidad, Perfil, histórico, KPIs, Mi Día, Disponibles, Mis Visitas, Beneficios, Reportes, Recursos, Certificación, Tablón, refresh/mobile, aislamiento, cero duplicados.

CLIENTE:
alcance Fase A vigente y aislamiento, sin reabrir funcionalidades no afectadas.

HR:
misma fresh sourceRevision para oráculo y UI; GT/HN, período, estados y fuera-de-rango exactos.

### C3.4 Artifact terminal
Una sola candidata → un manifest → un build determinista → un artifact → Gate20 semántico → Gate21 derivado del mismo artifact.
No rebuild ni recomposición posterior.

## C4 — UNA SOLA VISUALIZACIÓN DE PAULA + I3 GO

Sólo emitir `LISTA PARA VISUALIZACIÓN HUMANA` cuando:
- ledger terminal;
- 20/20 módulos MATCH;
- focal C3 PASS;
- artifact/served parity PASS;
- producción intacta.

Paula visualiza una sola URL DEV y una ruta corta Admin/Shopper.

Si Paula detecta hallazgo nuevo:
- se agrega VRM-042+ al mismo ledger;
- se clasifica;
- se corrige owner exacto dentro de C2/C3;
- se repite sólo el gate afectado + terminal acumulativo;
- NO nueva auditoría general, candidata, branch, overlay, reimport ni metodología.

Si visual PASS:
- congelar aceptación humana;
- emitir I3=GO sobre ese artifact exacto;
- solicitar UNA autorización fresca para I4.

## Política de velocidad

Para evitar otra ronda de días:
- no repetir auditoría general;
- no buscar indefinidamente módulos históricos;
- cada P0 usa búsqueda focal acotada por registry/manifest/git;
- si la autoridad aprobada exacta no se adjudica en ese pase, se implementa el contrato ya congelado en el owner actual y se prueba;
- no se detiene el carril por documentación secundaria;
- controles y correcciones se ejecutan en secuencia sobre la misma lineage;
- ningún PASS parcial vuelve a Paula.

## Producción

`https://tya-plataforma.web.app/` permanece `DO_NOT_TOUCH`.
Este plan no autoriza I4.
