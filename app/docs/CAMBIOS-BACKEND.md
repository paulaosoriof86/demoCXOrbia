# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 11:09 -06:00  
**Estado:** `I3_ADMIN_TARGET_B_EXISTING_CREDENTIAL_VERIFIED__ENCRYPTED_HANDOFF_PASS__AUTH_WRITES_0__HUMAN_LOGIN_LEGAL_ACCEPTANCE_NEXT`

## 2026-08-17 — I3 Admin TARGET_B credential recovery

Se reutilizó el runner read-only existente `cxorbia-corte6-auth-mapping-capability-readonly.yml`; no se creó rama, PR ni workflow nuevo.

Archivos backend/tools tocados:
- `tools/qa/cxorbia-i3-admin-target-b-credential-handoff-readonly.mjs`: verificador exacto de TARGET_B, login Firebase real y handoff cifrado.
- `tools/qa/cxorbia-corte6-auth-mapping-capability-readonly.mjs`: routing del modo TARGET_B al verificador nuevo, preservando el modo histórico.
- `backend/config/i3-admin-target-b-handoff-public.pem`: clave pública efímera/source-safe para cifrar el handoff; no contiene secreto.
- `backend/config/corte6-auth-mapping-capability-readonly-request.json`: request `i3-admin-target-b-credential-handoff-readonly-20260817-01`, consumido read-only.
- `app/docs/evidence/CORTE6-AUTH-MAPPING-CAPABILITY-READONLY-LATEST.json`: evidencia sanitizada del PASS.

Ejecución real: workflow run `32049054855`, job `95443726801`, `SUCCESS`. TARGET_B alias `B`, rol `admin`, binding técnico exacto, Auth habilitado, claims exactos y `firebasePasswordSignIn=true`.

Ledger exacto: Auth writes `0`; passwordChanges `0`; passwordResets `0`; Firestore reads/writes `0/0`; Shopper reads/writes `0/0`; historicalCredentialAccess `0`; otras identidades modificadas `0`; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción `0/false`.

La credencial vigente fue recuperada únicamente en memoria privada del runner, comprobada mediante sign-in real y persistida solo como ciphertext. No se rotó contraseña porque la credencial actual funciona. El siguiente gate es el login humano de Paula y la aceptación V0.4 desde la UI protegida; el consentimiento legal no se automatiza.

Clasificación: `Reusable CXOrbia` = handoff cifrado/read-only de credencial canónica existente; `Exclusivo cliente` = TARGET_B TyA; `Claude/prototipo` = sin cambio UI; `Academia` = sin cambio de contenido, continúa aceptación humana; `Sin impacto Claude` = sí.

## Histórico preservado

Gate `31762716234`: one provider read consumed; inventory 231 Auth / 209 principals / 340 profiles / HR 15-660-212. V1 `62/137/10` non-authoritative; independent 616/208/194.

Source gap fixed: exact linked protected owners canonicalized via `CX_EXACT_IDENTITY_CONTRACT` before HR composition. Run `31763545130` SUCCESS / `PASS_P0_GLOBAL_COMPOSITION_SOURCE` / hard fails 0.

Historical handoff no current credential; real E2E/Academia/Certification SKIPPED. Request disabled; `31763754714` provider/E2E skipped; no second read.
