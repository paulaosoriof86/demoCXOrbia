# ADDENDUM PREVALENTE — I3 FORENSIC CONTROL-PLANE / CACHE ROOT CAUSE

**Fecha:** 2026-09-18  
**ID:** `CXORBIA-I3-FORENSIC-CONTROL-PLANE-CACHE-ROOTCAUSE-20260918`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## 1. Motivo

La repetición de visualizaciones donde módulos previamente trabajados parecían ausentes o antiguos obligó a reabrir exclusivamente la auditoría forense solicitada por Paula. Esta auditoría no reabre I0/I1/I2 ni autoriza reconstrucción de módulos.

## 2. Hallazgo principal: el source NO perdió los módulos aprobados

Se comparó el árbol de producto inmediatamente anterior al fix de caché contra las 84 autoridades Fase A reducidas por el `CANONICAL_MODULE_ADJUDICATION_PASS1`.

Resultado:
- 84 autoridades examinadas;
- 73 byte-exact contra su autoridad aprobada previa;
- 11 diferencias;
- las 11 diferencias corresponden exclusivamente a owners focales autorizados de I3;
- 0 drift no autorizado;
- 0 archivos faltantes.

Readbacks adicionales demostraron que los módulos visibles reclamados por Paula conservan sus últimas revisiones Git reales:
- `app/modules/shoppers.js`;
- `app/modules/misvisitas.js`;
- `app/modules/proyectos.js`;
- `app/modules/hr-source.js`;
- `app/modules/operacion-extra.js`;
- `app/modules/finanzas.js`;
- `app/modules/cert.js`;
- `app/modules/documentos.js`.

Conclusión: **NO reconstruir estos módulos.** El problema observado es de composición/entrega/certificación, no de pérdida de source.

## 3. Causa raíz sistémica del bucle

### A. `RELEASE_COMPOSITION_FAILURE` histórico ya demostrado
La matriz anterior cubría 86 source files mientras el entrypoint real cargaba 124 scripts internos; 56 scripts internos activos estaban fuera de la matriz. Esto permitía `owner MATCH` con módulo funcional no canónico.

### B. Prueba de autoridad con provenance insuficiente
La matriz v4 puede sobrescribir `latestApprovedSource` con el commit de composición, aun cuando la autoridad real provenga de un checkpoint/commit anterior. Eso vuelve parte de la prueba autorreferencial y dificulta demostrar “última versión aprobada” de manera independiente.

Corrección obligatoria: matriz v5 debe separar:
- `approvedSourceCommit`;
- `approvedBlob`;
- `approvalAuthority`;
- `composedAtSource`;
- `currentBlob`.

### C. Gate20 no es exhaustivo
El Gate20 vigente sólo recorre tres rutas únicas (`shoppers`, `financiero`, `miperfil`) mientras el contrato visible contiene 56 entradas rol-ruta (34 Admin, 12 Shopper, 10 Cliente). Un Gate20 focal puede pasar aunque otro módulo aprobado falte o no monte.

Corrección obligatoria: el inventario esperado debe ser independiente del `CX.NAV` servido. La aceptación transversal debe recorrer el inventario congelado, no derivar sus expectativas del runtime que está auditando.

### D. Orden Gate20 / artifact / Gate21 / aceptación transversal incorrecto
El workflow empaqueta el artifact y ejecuta Gate21 antes de la aceptación humana exhaustiva final. Gate21 puede demostrar integridad criptográfica de un artifact que aún no ha demostrado canonicidad funcional transversal.

Orden obligatorio:
`SOURCE/MATRIX → BUILD/DEV → HR/AUTH/PERSISTENCE → FULL HUMAN ACCEPTANCE → GATE20 receipts → PACKAGE ONE ARTIFACT → GATE21`.

### E. Segunda autoridad histórica aún embebida
El workflow conserva un job `[human-live-only]` con Run188/Hosting/runtime/artifacts hardcodeados. Aunque normalmente esté skipped, constituye un carril alterno histórico dentro del workflow canónico.

Corrección obligatoria: eliminarlo del critical path. La única identidad de release debe venir del manifest del run vivo.

### F. Caché capaz de mostrar composición vieja
`app/core/build-lock.js` mantiene un BUILD_ID de agosto y el Service Worker reutilizaba ese namespace. `firebase.json` no exigía revalidación/no-store de HTML/JS/CSS/JSON. Una sesión de navegador/PWA podía conservar CacheStorage/HTTP cache anterior y presentar una mezcla visual aun cuando Hosting tuviera blobs correctos.

Corrección focal autorizada:
- `app/sw.js`: runtime ejecutable completo network-only/fail-closed y purga total de caches al activar;
- `firebase.json`: `Cache-Control: no-store, no-cache, max-age=0, must-revalidate` para HTML/JS/CSS/JSON/webmanifest.

Este fix es `RELEASE_COMPOSITION_FAILURE`, no reconstrucción funcional.

## 4. Product source después del fix de caché

- source: `7f22df0679497f3c5c1e6a65d26d30ccf972ccf9`
- tree: `eaa5dfcd9d62ce02d0edada943da056c3730f5c0`
- archivos de producto modificados por esta corrección: `app/sw.js`, `firebase.json` solamente.

Todos los módulos de negocio previamente adjudicados permanecen intactos salvo los owners focales I3 ya autorizados.

## 5. Decisión anti-reconstrucción

Desde este freeze:
- queda prohibido “volver a hacer” Hoja de Ruta, Shoppers, Mis Visitas, Proyectos, Reportes, Certificaciones, Documentos o Finanzas por apariencia visual;
- una visualización vieja activa primero cache/source/readback;
- un FAIL de control no autoriza reabrir un módulo KEEP;
- cualquier cambio adicional de producto requiere drift funcional reproducible y owner exacto.

## 6. Corrección única del control plane

Antes de otra visualización de Paula:
1. matriz v5 con provenance independiente;
2. inventario esperado congelado de 56 entradas rol-ruta;
3. una sola aceptación browser exhaustiva Admin + Shopper + Cliente sobre el mismo DEV artifact;
4. Gate20 derivado de esa aceptación, sin segundo login/reconcile paralelo;
5. artifact se empaqueta sólo después del PASS transversal;
6. Gate21 deriva source/tree y hashes exclusivamente del manifest del artifact del mismo run;
7. eliminar carril hardcodeado Run188;
8. no rebuild/redeploy entre aceptación, packaging y Gate21.

## 7. Criterio de salida

No se vuelve a pedir visualización humana a Paula hasta que run único demuestre:
- 124/124 scripts internos;
- 0 fuera de matriz;
- 0 duplicate src;
- 0 overlays desconocidos;
- 0 drift no autorizado;
- 56/56 entradas rol-ruta esperadas presentes;
- Admin/Shopper GT/Shopper HN/Cliente PASS;
- HR/periodos/postulaciones/reservas/finanzas/reportes/certificaciones/documentos PASS;
- cache/source parity PASS;
- un artifact;
- Gate21 sobre ese mismo artifact.

Producción continúa `DO_NOT_TOUCH`.
