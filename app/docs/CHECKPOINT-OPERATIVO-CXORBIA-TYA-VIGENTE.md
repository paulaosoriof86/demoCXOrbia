# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-19
Estado: `HOSTING_DEV_REMOTE_SMOKE_PASS_PENDING_VISUAL`

## 1. Repositorio y runtime

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Runtime empalmado: V161C.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Aggregate: `7075f70822e3fed8442d62b56e1467fa643facd756aa88258ae2d6d6bdc95cdf`.
- Build publicado en DEV: `v161c-r21-source-safe-20260719-dev`.
- URL visual: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.

## 2. Frontera de promoción

La última `ACTIVE_BASELINE` congelada continúa siendo V131 como referencia de rollback.

V161C ya completó:

1. empalme directo;
2. post-gates técnicos R21;
3. Hosting DEV del mismo build canónico;
4. smoke remoto por roles y Academia.

V161C sigue `active:false` y `visualValidated:false`. Solo puede convertirse en `ACTIVE_BASELINE` después de la revisión visual de Paula y el freeze explícito de Corte 0B.

## 3. Alcance canónico del Corte 0B

- Inventario contractual: `tya-hr-tab-inventory-r20-v1`.
- Periodos: junio 2025 a julio 2026.
- 14 periodos, 28 pestañas, 616 visitas.
- Países: GT 476, HN 140.
- Agosto 2026 fue detectado en la HR viva, pero quedó fuera del corte actual de forma explícita y reversible.
- Julio 2026: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada por elegibilidad.
- Referencias shopper protegidas: 209.
- Diferencia `209/216`: revisión no bloqueante; no inventar, fusionar ni eliminar identidades.
- Pagos confirmados o inferidos: 0.

## 4. Evidencia técnica previa

- Run: `29712762494` — SUCCESS.
- Artifact: `8449340543`.
- Digest: `sha256:a2e4861610a1928bbf77ce34b790bad1765ff5bda91302669f7d14ad1ee75864`.
- Decisiones:
  - `PASS_R20_VERIFIED_INVENTORY_FILTER`;
  - `PASS_R21_ELIGIBILITY_FINAL_CANONICAL_PASS`;
  - `PASS_R21_POSTULATION_ELIGIBILITY`;
  - `PASS_WITH_WARNING_R21_TYA_SOURCE_SEMANTICS`.

## 5. Hosting DEV y smoke remoto

- Run: `29716601804` — SUCCESS.
- Commit exacto desplegado: `8950ef47a8dd0e6f86ad368ffb68b2be638accb6`.
- Artifact: `8450820491`.
- Digest: `sha256:f207df387fe0449fc8382093097cb9c316746b60fdc42d8feaa67abe098dc96f`.
- Decisión final: `PASS_R21_HOSTING_DEV_AND_REMOTE_SMOKE`.
- Semántica remota: `PASS_WITH_WARNING_R21_TYA_SOURCE_SEMANTICS`.
- Smoke remoto roles/Academia: `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`.
- Admin: dashboard, proyectos, visitas, postulaciones, certificación, finanzas y Academia renderizados.
- Cliente: dashboard y sucursales renderizados.
- Shopper: visitas, certificación, beneficios y Academia renderizados.
- 0 blockers, 0 errores de página y 0 errores de consola.
- 0 PII expuesta, 0 nombres shopper crudos y 0 escrituras de datos.

## 6. Incidentes del bloque y causa raíz

Los runs `29716367170` y `29716484448` se detuvieron antes del deploy porque el verificador de atomicidad exigía dos literales documentales en el checkpoint: `ACTIVE_BASELINE` y `TECHNICAL_PASS_PENDING_DEV_AUTHORIZATION`.

No hubo publicación parcial. La causa fue documental y quedó corregida antes del run exitoso. No correspondía a V161C, Firebase ni a la semántica R21.

## 7. Estado de autorización

- La autorización de Hosting DEV fue de una sola ejecución.
- La solicitud quedó marcada `consumed_success`.
- El workflow quedó desactivado para evitar redeploy automático o repetición sin una nueva autorización expresa.

## 8. Siguiente bloque exacto

```text
VALIDACION_VISUAL_PAULA_CORTE_0B
-> abrir URL DEV exacta
-> revisar login y selector tenant/roles
-> revisar Admin / Operativo / Shopper / Cliente / Academia
-> comprobar proyecto Cinépolis y periodo JUL 2026
-> comprobar disponibles/postulación y estados visibles
-> registrar únicamente diferencias reproducibles
-> APROBADO
-> freeze V161C como ACTIVE_BASELINE
```

No iniciar Corte 1 antes del freeze de Corte 0B.

Estado seguro: sin merge, sin producción, sin importaciones reales, sin Firestore/Auth/Storage/HR writes, sin Make/Gemini live y sin pagos.
