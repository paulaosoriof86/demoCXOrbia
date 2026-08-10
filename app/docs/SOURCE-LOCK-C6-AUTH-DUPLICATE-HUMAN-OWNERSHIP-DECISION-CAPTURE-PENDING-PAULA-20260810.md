# SOURCE LOCK — C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD al inicio:** `21b112fb11a4690246550bdd51f7937c386cfaf2`  
**Estado:** `C6_AUTH_DUPLICATE_HUMAN_OWNERSHIP_DECISION_CAPTURE_READY__PAULA_DECISION_REQUIRED__ZERO_PROVIDER_READS__ZERO_REPAIR__NO_PRODUCTION`

## 1. Universo congelado

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
```

No se amplió el universo y no se reconstruyeron las 340 identidades. `fd891...` permanece cerrado fuera del bloque.

## 2. Matriz construida

Fuentes rectoras nuevas:

- `app/docs/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.md`;
- `app/docs/evidence/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.json`.

La matriz separa `KEEP_ONE_MEMBER`, `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS`, `PRESERVE_BOTH_PENDING_OWNER_MAPPING` y, para Cliente, `CANONICAL_EXTERNAL_KEEP_HISTORICAL_PAIR_NONCANONICAL_PENDING_RETIRE`.

## 3. A–C · staff histórico

Los pares `1acd...`, `2c4d...` y `542...` siguen sin selector member-level source-safe. Ambos miembros de cada par son legacy/pre-import namespace `NONE`, equivalentes bajo evidencia permitida y fuera de la clase staff canónica importada.

Por tanto:

- `KEEP_ONE_MEMBER` requiere que Paula elija exactamente uno de los dos fingerprints;
- `PRESERVE_BOTH_PENDING_OWNER_MAPPING` es válida sin distinguir members;
- `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` requiere confirmación humana de que existe y debe prevalecer un principal canónico externo para ese owner/grupo.

No se infirió keeper.

## 4. D · Cliente `ae2f...`

Existe un Cliente canónico externo al par histórico, ya validado, con fingerprint source-safe `6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c`, namespace `staff`, scope `tya/cinepolis`, sign-in/readback/idempotencia y membresía PASS.

La matriz presenta explícitamente la opción de conservar ese principal como único canónico y clasificar ambos históricos como no canónicos pendientes de un repair separado. No se ejecutó disposición ni retiro.

## 5. Decisión terminal

```text
decision=PAULA_MINIMUM_OWNERSHIP_DECISION_REQUIRED
capturedDecisions=0/4
providerReads=0
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
```

La siguiente acción no es otra investigación técnica. Es capturar las cuatro decisiones humanas mínimas.

## 6. Seguridad

No se creó request provider ni workflow provider. No se usaron antigüedad, orden, nombre, email crudo, UID, shopperId, metadatos temporales o inferencias visuales. Cero PII cruda exportada.

## 7. Después de la decisión

No ejecutar repair dentro de esta autorización. Si la decisión humana produce una disposición Auth inequívoca, el siguiente bloque será un repair focal separado con snapshot, idempotencia, readback y rollback dry-run, sujeto a autorización expresa.

## 8. Clasificación

- **Reusable CXOrbia:** matriz de disposición humana cuando no existe ownership anchor técnico.
- **Exclusivo cliente:** cuatro grupos históricos TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** patrón de revisión y decisión humana de identidad canónica/histórica.
- **Sin impacto Claude:** source lock, evidencia y control interno.

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados. Producción sigue intacta.
