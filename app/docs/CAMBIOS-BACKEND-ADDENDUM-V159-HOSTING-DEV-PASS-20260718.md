# CAMBIOS BACKEND — V159 HOSTING DEV PASS Y CORRECCIONES RAÍZ

Fecha: 2026-07-18

## Resultado vigente

V159 completó auditoría, empalme, gates locales, Firebase Hosting DEV, prueba remota del build exacto y smoke remoto. Después se corrigió de raíz la clasificación falsa de shoppers protegidos, se volvió a desplegar el mismo runtime V159 y el build actualizado volvió a pasar los gates locales y remotos.

- Estado: `hosting_dev_remote_smoke_pass_pending_visual`.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Workflow run vigente: `29649918631`.
- Commit exacto desplegado: `91aed5f9bdd54a396bd8758479888516dd1c3013`.
- Hosting version: `projects/87461567267/sites/cxorbia-backend-dev/versions/dbb0c50992aba5e2`.
- Artefacto sanitizado: `8431164287`.
- Digest: `sha256:693d05ecfc4621c02321e13a0caf6f40ac2683356ee0893c02a04f027aa3539a`.
- Estado GitHub observable: `cxorbia/v159-hosting-dev = success`.
- Blockers finales: `0`.
- P0 frontend demostrado: no.
- `ACTIVE_BASELINE`: pendiente únicamente de validación visual de Paula.

## Causas raíz corregidas

### 1. Proyecto y periodo colapsados

`tools/release/tya-source-safe-binding-build-r18a.mjs` quedó como compatibility entrypoint del binding canónico R15G. Proyecto `cinepolis` y periodo `cinepolis-YYYY-MM` permanecen separados.

### 2. Estados perdidos en el adapter

R15G conserva estados operativos, submitido, liquidación, pago, `financialControl`, evidencias y razones de revisión. Submitido no se transforma en liquidado ni pagado.

### 3. Junio validado con heurística incompleta

R18D expone el sobre financiero source-safe aprobado por periodo. El gate acepta únicamente estados canónicos, vínculos financieros protegidos o ese sobre aprobado; pagos confirmados o inferidos permanecen en cero.

### 4. Shoppers protegidos contados como activos y perfiles completos

La causa era la heurística heredada `CX.data_shopperDataLevel`: consideraba perfil operativo la mera presencia de campos nulos o conteos históricos, aunque el adapter declarara `dataLevel:'protected_reference'`.

La corrección se aplicó en la frontera de conexión, no en `app/modules`:

- `tools/release/tya-source-safe-binding-build-r15g.mjs` da precedencia al `dataLevel` declarado por la fuente;
- `protected_reference` nunca puede clasificarse como activo o perfil completo;
- `CX.data.shopperActivo()` devuelve falso para referencias protegidas;
- el comportamiento heredado se conserva para perfiles operativos o autorizados reales.

Commit principal: `6da63c5747f99cdb9732055aed9043aeef1440c5`.

Evidencia remota actual:

- fuente shopper: 215;
- referencias protegidas: 215;
- activos: 0;
- inactivos: 0;
- perfiles completos: 0;
- perfiles incompletos: 0;
- ratings inventados: 0;
- estados inventados: 0;
- identidades inventadas: 0.

### 5. Carril de deploy fragmentado y dependiente del cliente

`tools/release/tya-r15g-dev-root-deploy.sh` centraliza autorización fail-closed, build, gates, deploy, polling y smoke remoto. El workflow es únicamente wrapper y runner.

El ejecutor admite volver a desplegar V159 antes del freeze cuando existe una corrección raíz validada, sin degradar registry ni declarar la baseline activa.

Commit: `d06d0908be16ea5699931be14c51dfb0350c3b95`.

### 6. Falta de observabilidad del Hosting DEV

`.github/workflows/cxorbia-phase-a-r15g-dev-root-deploy.yml` publica el estado `cxorbia/v159-hosting-dev`, permitiendo comprobar PASS/HOLD sin depender de correos o de `workflow_dispatch` visible.

Commit: `219f686f487147bd486abb82c0dce005b8cbed20`.

### 7. Carrera de propagación remota

El ejecutor incorpora polling acotado, cache-busting y validación exacta de build/commit antes del smoke remoto. Falla cerrado si el archivo de prueba no converge.

### 8. Gates históricos V110 bloqueando V159

Los workflows RC V110 quedaron como diagnósticos históricos manuales y no participan automáticamente en la decisión V159.

- RC smoke: `15efae4ddc596fb467772d83f05afcf0671a3def`.
- Predeploy V110: `5f166caaa920702376479742ca20457475a46cb4`.

### 9. Firestore drift disparado por cambios frontend o de gates

`.github/workflows/cxorbia-firestore-canonical-drift-r15e.yml` quedó limitado a cambios reales de evidencia, contratos y clasificadores Firestore. Mantenimiento de workflows, gates source-safe y Hosting-only ya no lo disparan.

Commits: `a4306abda3e2ea91aa5ade5a3bbb2a9098e57c55` y `755d13c78bfb19e602965c8dc6354ffbf789d815`.

### 10. Contratos sin representar la evidencia actualizada

Registry, checkpoint vivo y validadores ahora aceptan revisiones de evidencia confiables y registran el build corregido sin congelar V159 prematuramente.

- Registry: versión `1.6.0`.
- Contrato vivo: versión `3.2.0`.
- Estado: `hosting_dev_remote_smoke_pass_pending_visual`.

## Gates posteriores a la corrección

- R18A canonical assets: PASS.
- R15G/R18D exact source-safe runtime: PASS.
- Run R15G posterior al registry: `29650129754`.
- Fuente: `PASS_WITH_WARNING_R15G_TYA_SOURCE_SEMANTICS`.
- Roles: `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`.
- Proyecto/periodo/KPI/histórico: `PASS_TYA_PROJECT_PERIOD_KPI_HISTORY`.
- Overlays: `PASS_WITH_REVIEW_R18D_VISIBLE_OVERLAYS`.
- Blockers: 0.

## Evidencia funcional preservada

- 14 periodos.
- 616 visitas.
- 44 visitas por periodo activo.
- GT 34 y HN 10.
- Proyecto y periodo separados.
- Junio ejecutado con liquidación/pago pendiente.
- Pagos confirmados o inferidos: 0.
- Shoppers actuales: 215; referencia: 216; revisión R11D; identidades inventadas: 0.

## Advertencias no bloqueantes

- Deriva shopper 215/216 bajo revisión R11D.
- HR DEV es snapshot fresco de build, no sincronización runtime live.

## Claude/prototipo

No se modificó `app/modules` para resolver la clasificación shopper. No existe paquete nuevo para Claude. Claude solo interviene si la revisión visual demuestra un P0 frontend reproducible y localizado. P1/P2 se documentan sin bloquear el freeze.

## Academia

Debe enseñar que una referencia protegida no es un perfil activo ni completo. También debe conservar proyecto frente a periodo, snapshot frente a runtime live, submitido frente a liquidado/pagado, revisión R11D y proveedores apagados.

## Siguiente acción

Paula valida visualmente el build actualizado. Solo con `APROBADO` se congela V159 como `ACTIVE_BASELINE` y se continúa al Corte 1.

## Clasificación

- Reusable CXOrbia: precedencia de nivel de datos, binding canónico, sobre financiero, ejecutor único, observabilidad, polling y gates por evidencia real.
- Exclusivo TyA/Cinépolis: 14/616/44, GT/HN, junio y R11D 215/216.
- Claude/prototipo: sin tarea nueva confirmada.
- Academia: validación visual y regla de referencias protegidas.
- Sin impacto Claude: CI, registry, contratos, gates y documentación.

## Estado seguro

Hosting DEV actualizado. Sin merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
