# Cambios — Drift gate y source lock post-V96

Fecha: 2026-07-10  
Bloque: reconciliación segura de identidad runtime  
Estado: completado en backend/gates/documentación; empalme runtime no ejecutado.

## Archivos creados

1. `backend/config/phase-a-source-lock-post-v96-runtime-manifest.source-safe.json`
   - manifiesto de 67 archivos runtime con SHA-256;
   - procedencia: `Prototype development request.zip` post-V96;
   - SHA-256 del ZIP: `80feb7c7809d28657b5eec243aa187f678c023ecd471a9f9404e52d285bd2663`.

2. `tools/release/tya-source-lock-post-v96-runtime-verify.mjs`
   - verificación read-only de identidad runtime;
   - genera JSON/Markdown en `.tmp` o artifact;
   - falla si falta un archivo o cambia un hash.

3. `.github/workflows/cxorbia-source-lock-post-v96-runtime-verify.yml`
   - workflow safe-only;
   - sin secrets, proveedores, deploy, imports ni escrituras;
   - artifact de evidencia por 14 días.

4. `app/docs/SOURCE-LOCK-POST-V96-RUNTIME-RECONCILIATION-20260710.md`
   - decisión y evidencia forense del bloque.

5. Addenda de cambios, Claude, pendientes, Academia y tracker asociados a este bloque.

## Archivo modificado

`tools/release/tya-rc-phase-a-drift-gate.mjs`

Cambio:

- se clasificaron como safe-only únicamente archivos con patrones restringidos:
  - `backend/config/*.source-safe.json`;
  - `backend/rules/*.rules.draft`;
  - workflows y validators explícitos;
- no se abrió allowlist general para `tools/release`;
- no se permitió ningún archivo runtime adicional;
- no se cambió el SHA validado `489b0420a820b390f4307db93fe8280959f3867c`.

## Resultado

### Source lock hash gate

- veredicto: `NO_GO_SOURCE_LOCK_RUNTIME_NOT_EMPLOYED`;
- 67 esperados;
- 30 coinciden;
- 0 ausentes;
- 37 con hash diferente;
- 27 archivos runtime adicionales report-only.

### Drift gate

- antes: 31 bloqueados;
- después: 4 bloqueados;
- los 4 restantes son runtime real:
  - `app/core/tya-phase-a-source-safe-preview.js`;
  - `app/data/tya-hr-source-safe-periods.js`;
  - `app/index.html`;
  - `app/sw.js`.

## Qué no se hizo

- no se tocó `/app/modules`;
- no se sustituyó `/app/core`;
- no se empalmó el ZIP;
- no se borraron patches previos;
- no se movió el runtime SHA validado;
- no se creó Firebase DEV;
- no se activó Auth/Firestore/Storage;
- no se ejecutó import, write, HR writeback, Make, Gemini o pagos;
- no hubo merge, deploy ni producción.

## Impacto frontend

El hallazgo exige un empalme controlado del source lock post-V96 antes de conectar runtime backend. Corresponde a Claude/frontend o a una excepción explícitamente autorizada, no a un patch backend silencioso.

## Riesgo pendiente

Mientras el gate permanezca en NO GO:

- la rama conserva contratos/readiness backend, pero no puede presentarse como runtime post-V96;
- DEV Root Deploy debe seguir bloqueado;
- Auth/Firestore activation debe permanecer preparada, no activada.

## Commits del bloque

- `2708fd2978e8e6bbfbba08444f3e0aa0c81171c9` — manifiesto source lock;
- `e05a84aaa6806068db6281903168fb1fd4c88afc` — verificador inicial;
- `94af5ac6173f32f4c7739396279000903653cb7a` — workflow CI;
- `4eed3de4e6db85cd6e9ef030a07443875101ed21` — clasificación safe-only del drift gate;
- `30217109976bc85a0ba9144f739fa2b9055a452c` — reporte acotado a runtime.

## Estado seguro

Backend/gates/documentación solamente. Sin runtime mutation, sin proveedores, sin writes, sin imports, sin deploy y sin producción.
