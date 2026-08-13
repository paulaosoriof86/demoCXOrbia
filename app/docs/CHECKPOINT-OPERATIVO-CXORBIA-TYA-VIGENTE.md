# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 18:36 -06:00  
**Estado:** `C6_RUNTIME_10_ROOTCAUSE_PROVEN_WRONG_STAFF_CREDENTIAL_LANE__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_PRODUCTION`

## Estado vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Exact Write V2: PASS cerrado/no repetible.
- Producción: intacta.
- Phase A certificado: **88%**; restante **12%**.

## Runtime 10 cerrado

Run `31652523820`, job `94299776053`, artifact `9163167746`.

PASS antes del fallo: preflight v4, `bash -n`, keyboard submit, Google Cloud DEV auth, source parity, Hosting DEV 1/1, remote parity, contexto `coordinador/staff/tya/cinepolis` y HR viva **15 periodos / 660 visitas / 211 shoppers**. El cierre quedó `membershipVerified=false`, `frontendHandoffStatus=blocked`; STOP_RETRY fue respetado y no hubo segundo intento.

## Causa raíz demostrada después del STOP_RETRY

La membership no estaba siendo probada con la misma identidad canónica reparada por Exact Write V2.

1. Exact Write V2 creó/certificó memberships canónicas para `A=super`, `B=admin`, `C=ops`, `D=ops`.
2. El selector runtime Staff anterior `tools/qa/cxorbia-c6-existing-staff-admin-e2e-credential.mjs` dependía de `backend/private-inbox/corte6-credential-bundle.enc.json`, calculaba candidatos de contraseña legacy y aceptaba `super/admin/ops/coordinador`.
3. Runtime 10 reportó `staffRole=coordinador`.
4. Ese rol no pertenece al conjunto de targets A/B/C/D congelado por Exact Write V2. Por ello el runtime podía autenticar un principal Staff válido y cargar HR, pero no estaba certificado que ese principal tuviera el `tenants/tya/users/{uid}` canónico materializado por Exact Write V2.

Causa raíz: `C6_STAFF_RUNTIME_SELECTOR_NOT_BOUND_TO_EXACT_WRITE_CANONICAL_PRINCIPAL`.

## Reparación source-only aplicada

- Nuevo `tools/qa/cxorbia-c6-canonical-staff-admin-e2e-credential.mjs`:
  - target exacto `B`;
  - rol `admin`;
  - visible login desde private handoff vigente;
  - contraseña efímera regenerada con la misma HKDF del Exact Write V2;
  - cero bundle legacy/password guessing;
  - cero provider writes.
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs` enruta la acción Staff exacta al nuevo selector canónico y conserva la ruta genérica Shopper/Cliente sin cambio.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` v4 quedó reforzado para bloquear cualquier retorno a selector legacy y exigir alias B/admin + handoff privado + derivación Exact Write V2.

Commits:
- `41cbdda28ed85531590d6ebe8b73b26751189e4e`;
- `172d56780b25f749870644db9727a76e2dfd0981`;
- `670810930de72929407fe0b3c83c78232aa3856c`.

No se tocó `/app/modules`, UI visual, `CX.data` interface ni gates cerrados.

## Seguridad

Desde el STOP_RETRY runtime 10:
- provider calls nuevos: `0`;
- Hosting nuevos: `0`;
- Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes: `0`;
- segundo Exact Write: `0`;
- merge: `false`;
- producción: `false`.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12%.** El porcentaje no cambia todavía porque M7 exige evidencia runtime real, pero el bloqueo dejó de ser una causa abierta: ya hay causa raíz demostrada y reparación focal aplicada.

## Siguiente bloque exacto

Único paso productivo restante para M7: nueva autorización explícita de un `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo final. Antes de provider, el preflight v4 reforzado debe PASS y el selector debe demostrar `canonicalTargetAlias=B`, `staffRole=admin`, `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`. Con PASS de la cadena completa y estabilidad 3 reloads/new-tab, cerrar M7 (+5 puntos) y continuar inmediatamente M8 → M9 → M10 sin auditoría general ni reapertura de gates cerrados.

## Clasificación

- **Reusable CXOrbia:** QA debe usar la misma identidad canónica que materializó el gate de Auth/membership; no credenciales legacy oportunistas.
- **Exclusivo cliente:** Staff TyA DEV alias B/admin.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** selector/preflight/evidencia C6.
