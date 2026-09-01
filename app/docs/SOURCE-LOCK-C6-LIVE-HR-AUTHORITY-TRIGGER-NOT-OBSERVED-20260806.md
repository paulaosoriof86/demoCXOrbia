# SOURCE LOCK — C6 autoridad HR viva, trigger provider no observado

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_LIVE_HR_AUTHORITY_SOURCE_ROOT_FIX_APPLIED__PROVIDER_TRIGGER_NOT_OBSERVED__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Alcance autorizado

Paula autorizó continuar con el bloque siguiente después de cerrar los 13 perfiles Shopper. El bloque quedó limitado a:

- corregir la autoridad de metadata/autodiscovery de HR viva;
- detectar el periodo calendario vigente desde el proveedor;
- reconstruir todos los periodos desde la misma revisión viva;
- comprobar que un cambio histórico altera `sourceRevision`;
- verificar propagación transversal de la revisión;
- ejecutar como máximo una lectura provider read-only;
- cero writes, deploy, merge o producción.

## 2. Causa raíz corregida en source

La implementación anterior combinaba un builder capaz de ver agosto con un registry estático observado el 30 de julio. Además, el planner de agosto contenía cifras fijas de HR (`34/10` y `1406`) y el gate país/pestaña hacía una segunda lectura GViz distinta de la revisión principal.

Se aplicaron directamente sobre la rama viva:

```text
e961fd4322007a5a64eee60f00f2d6fa7b9392f6  provider registry dinámico
4aa7ced4b0728709f4d620aec748056f0234b439  enforcement sin mes fijo
6bc1c0f94a36d717f56c5b2776a5713416eeb66b  contrato autoridad/revisión histórica
fefb41b76f56aef1bab9f3f185711f9392f10fe3  país/pestaña sobre una revisión
 daa7db23d6a8eebb71e0c14105631587dede5b11  planner periodo vivo sin conteos fijos
05bf22938c346bf1abd489f742ac72a7a47a3122  workflow acumulativo read-only
31f4af0f7501b23b4e72b1a5f8457669a5f91c77  workflow país/revisión única
```

El nombre histórico del archivo `cxorbia-august-delta-readonly-plan.mjs` se conserva para no romper referencias, pero su contrato activo pasó a periodo calendario vivo y reconciliación por revisión.

## 3. Request controlado

```text
authorizationId=chat-20260806-live-hr-authority-current-period-01
sourceCommit=31f4af0f7501b23b4e72b1a5f8457669a5f91c77
requestCommit=4e404f2db48ff8b07430d7ac7505eff6c040458a
providerReads autorizados=1
providerWrites=0
```

## 4. Resultado observable

Transcurrido el timeout contractual de 20 minutos:

```text
branchHead=requestCommit
nuevo evidence commit=NO
LIVE-HR-AUTHORITY-CONTRACT-LATEST.json=NO
commit statuses publicados=0
resultado provider disponible=NO
```

No existe evidencia para afirmar que el workflow haya iniciado ni para afirmar que la lectura provider se haya consumido. Por tanto:

```text
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
STOP_RETRY=true
```

No se hará un segundo trigger ni una segunda lectura sin autorización fresca.

## 5. Qué sí quedó resuelto

- El código ya no usa agosto como mes fijo.
- El periodo activo se deriva del calendario y de tabs devueltas por metadata viva.
- El registry estático deja de ser autoridad cuando existe metadata provider.
- La consistencia país/pestaña usa la misma revisión source-safe.
- La prueba de mutación histórica exige que cambie el hash estable.
- Los timestamps volátiles no deben cambiar `sourceRevision`.
- El planner ya no trata `34/10`, `616`, `684` ni `1406` como constantes contractuales.

## 6. Qué no puede declararse todavía

- No puede declararse agosto GT/HN como PASS.
- No puede declararse el total vivo actual de periodos, tabs o visitas.
- No puede declararse paridad transversal runtime hasta obtener evidencia provider.
- No puede ejecutarse repair Auth, deploy ni cutover a partir de este bloque.

## 7. Clasificación

- **Reusable CXOrbia:** autoridad provider viva, registry auto-descubierto, revisión estable y reconciliación histórica.
- **Exclusivo TyA:** spreadsheet HR de Cinépolis, nomenclatura de tabs y mapeos operativos.
- **Claude/prototipo:** no tocar módulos UI; deben consumir una sola `sourceRevision` y nunca fijar meses/conteos.
- **Academia:** actualizar material de fuente viva, cache, revisión y pruebas históricas.
- **Sin impacto Claude:** los 13 perfiles omitidos, Auth existente, Finanzas, Portales, Reservas y composición frontend permanecen preservados.

## 8. Estado seguro comprobado

```text
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 9. Siguiente acción exacta

Autorizar un único diagnóstico de control-plane que determine si el request `4e404f2d...` generó un run y en qué checkpoint terminó, sin volver a leer HR. Solo si se demuestra `providerReads=0`, podrá emitirse un trigger corregido para una única lectura viva. Si se demuestra que el read ocurrió, recuperar exclusivamente su run/job/logs o artifact, sin repetirlo.
