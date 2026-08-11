# SOURCE LOCK — C6 staff repair/bootstrap exact write STOP before first write

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## 1. Autorización consumida

Request:

```text
requestId=c6-staff-repair-bootstrap-exact-write-20260811-01
requestCommit=ac82cfc4a74d70dbedb8ab099bd430a6e5c372b7
snapshotAuthority=31518927950
workflowRunId=31534505451
workflowJobId=93922274430
```

El request quedó `enabled=false`, `consumed=true`, `nextGate=STOP_RETRY_NO_SECOND_ATTEMPT`.

## 2. Gates previos

Antes del request activo se ejecutó un source self-test con request deshabilitado:

```text
sourceSelfTestRunId=31534430007
decision=PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_SOURCE_PREFLIGHT
providerWrite=0
```

En la ejecución autorizada también pasaron:

```text
request gate=PASS
static exact-write source checks=PASS
source self-test before credentials=PASS
canonical DEV service account private load=PASS
credentialPrivacyPass=true
```

## 3. STOP exacto

El executor detuvo la ejecución durante la resolución privada de identidad, antes de alcanzar el primer provider write:

```text
decision=STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE
blocker=PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B
identityResolutionPass=false
providerStatePass=false
```

No se emite ni persiste el login faltante. El digest técnico congelado no es reversible y las fuentes privadas permitidas en runtime no aportaron una coincidencia exacta para B.

## 4. Causa raíz

La causa raíz no es drift de Auth, HR, claims, Firestore ni del snapshot 31518927950. Es una brecha entre dos decisiones de seguridad previamente correctas pero incompatibles para este executor:

1. los owner target logins A-D se conservaron únicamente como digests source-safe, sin plaintext en repo/docs;
2. el exact write exige materializar `visibleLogin` real dentro del tenant user document y resolver la credencial B/C/D antes del primer write;
3. el bundle cifrado histórico y los tenant user docs vivos disponibles al executor no contienen una referencia que reproduzca exactamente el digest técnico de B;
4. SHA-256 no permite reconstruir el valor original desde el digest.

Por tanto, inventar, inferir o sustituir el login habría violado el contrato de identidad. El STOP con cero writes fue el comportamiento correcto.

## 5. Seguridad demostrada

```text
Auth creates=0
custom claims writes=0
Auth disables=0
Auth writes TOTAL=0
Firestore user writes=0
Firestore audit writes=0
Firestore writes TOTAL=0
Auth deletes=0
Firestore deletes=0
HR writes=0
Rules writes=0
Storage writes=0
Make writes=0
Gemini calls=0
payments writes=0
deploy=0
merge=false
production=false
raw password persisted=false
password hash persisted=false
raw visible login persisted=false
private credential artifact=false
```

R4 Cliente canónico, los ocho históricos, A y todo el baseline permanecen sin mutación por este request.

## 6. Anti-bucle

- no reejecutar `c6-staff-repair-bootstrap-exact-write-20260811-01`;
- no repetir snapshot provider 31518927950;
- no reabrir Auth 340, SKIP13, MultiAuth, HR, M4 ni static gate;
- no inferir B por rol, nombre o coincidencia aproximada;
- no crear login sustituto silencioso;
- no provider writes hasta cerrar un canal privado transitorio que resuelva los target logins exactos antes del write boundary y exista nueva autorización explícita.

## 7. Progreso

No se acredita un nuevo punto de M5 porque no hubo ejecución provider efectiva.

```text
M5=4/8
PhaseA=84%
remaining=16%
```

## 8. Siguiente bloque exacto

`C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`.

Objetivo: recuperar/validar los owner target visible-login inputs ya entregados mediante fuentes privadas existentes, sin provider writes, sin emitir PII y sin cambiar owner-binding, roles, scopes o digests. Solo cuando A-D estén resueltos de forma exacta se podrá preparar una nueva autorización de exact write; no es un segundo intento del request consumido.

## 9. Cierre obligatorio

```text
que_se_hizo=executor exacto + source self-test + intento autorizado fail-closed pre-write
avance_Phase_A=84%
que_se_preservo=baseline completo; Auth 228; HR viva; R4; ocho históricos; frontend; PR7 sin merge
Claude=sin cambios UI; wiring sigue pendiente
Academia=impacto conceptual de fail-closed/privacidad; no bloqueante por sí mismo
pendiente_real=resolver target visible-login exacto B dentro de un canal privado permitido, y validar A-D antes de nueva autorización
estado_seguro=0 provider writes; 0 deletes; 0 deploy; 0 merge; producción intacta
bloqueo_comprobado=PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B
```

## 10. Clasificación

- **Reusable CXOrbia:** fail-closed antes del primer write, one-way digest non-recoverability, separación entre identidad source-safe y dato vivo protegido.
- **Exclusivo TyA:** target B y snapshot/budget focales C6.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** patrón de privacidad y recuperación controlada.
- **Sin impacto Claude:** request/provider executor y evidence.
