# SOURCE LOCK — C6 SKIP13 access reconciliation source-only STOP_RETRY

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 abierto, draft, sin merge  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_7_UNIQUE_CANONICAL_AUTH__1_DUPLICATE_EFFECTIVE_PAIR_UNRESOLVED_KEEPER__STOP_RETRY__AUTH_FREEZE_UNMODIFIED__NO_WRITES__NO_PRODUCTION`

## 1. Alcance autorizado

Reconciliar source-only los 8 perfiles SKIP13 con acceso efectivo y sus 9 candidate fingerprints usando exclusivamente el freeze Auth vigente, matrices versionadas y la evidencia provider read-only V2 ya capturada. Cero nuevas lecturas provider/Auth/claims/membership/HR y cero writes/deploy/merge/producción.

## 2. Fuentes prevalentes utilizadas

- `backend/config/c6-shopper-auth-final-freeze-v1.json` — 340 filas únicas, digest `6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b`;
- `app/docs/evidence/C6-SKIP13-PROVIDER-READONLY-REVALIDATION-V2-HOLD-20260807.json` — 13/13 resueltos, 8 perfiles / 9 candidatos efectivos;
- `app/docs/evidence/CORTE6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-LATEST.json` — el multi-Auth no tiene keeper demostrado y prohíbe selección arbitraria;
- `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-LATEST.json` — dos candidatos del perfil especial con score 5016/5016 y señales source-safe idénticas;
- `backend/config/corte6-shopper-auth-skip13-disposition-v1.json` y `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md` — preservación histórica y obligación de verificar accesos preexistentes antes de cutover.

## 3. Ejecución source-only observable

```text
requestId=c6-skip13-access-reconciliation-source-only-20260807-01
requestCommit=a73ad38d7007077837404b4e3a370828551effde
runId=31197299766
jobId=92928580367
artifactId=9001336549
artifactDigest=sha256:e3aa1169e33b97e34639542fd9a2ca6dfa6f8f72372479e24b784c1106b42480
evidenceDigest=sha256:3c9babccf8f2dd736c6ba7efdcd21e67be42a8b6bbea98d1c2b76b2a7d2e2d03
```

Todos los checks source-only pasaron; el resultado esperado del bloque es STOP_RETRY por identidad no resoluble, no un fallo del harness.

## 4. Clasificación de los 8 perfiles efectivos

Siete perfiles tienen exactamente un único candidato Auth efectivo, ligado al perfil por `shopperId` exacto y scope `tya/cinepolis/shopper`, sin candidato competidor. Se clasifican como `IDENTIDAD_CANONICA_VIGENTE` para efectos de acceso y deben preservar el Auth existente sin repair:

```text
cc941934f90032aa48e8 -> fa84ea99678c2b2f5953
9ed0cdabf3794b7ccf21 -> bc5b358c6883a46ef4e2
80d716626b85e14778ea -> ff65430db1848288c596
8aea97650e97902f7616 -> 8e80a0b286283139ff2e
540c9e6b71440b393365 -> cc52fe65814c6b9ae201
c01e0f344901f03e78d2 -> 63cb1df5e624217df319
729eb0480d5ec2266a20 -> 26c355c7cabb98038038
```

No existe evidencia source-safe suficiente para clasificar ninguno de esos siete como alias histórico o acceso a retirar.

## 5. Perfil especial — bloqueo real

```text
profileFingerprint=7cc28c78de9bfda01d14
candidateA=4e6d26551d11db444bd0
candidateB=9b2b7ca1bd72c1301d29
```

Ambos candidatos conservan acceso efectivo propio y los vectores técnicos previos continúan empatados. Las fuentes rectoras dicen expresamente que no está probado cuál cuenta es canónica y que `creationTime`, ordinal, first-returned, enabled o emailVerified no pueden usarse como selector.

Clasificación de la pareja:

```text
IDENTIDAD_DUPLICADA
technicalClass=DUPLICATE_EFFECTIVE_AUTH_PAIR_UNRESOLVED_KEEPER
keeper=null
accessToRetire=null
```

No se inventó un alias histórico ni una cuenta a retirar. La condición autorizada `Ante identidad no resoluble -> STOP_RETRY` se activa aquí.

## 6. Overlay de plan y demostración de no superposición

El freeze original NO se modificó. Se materializó un overlay source-only:

`backend/config/c6-skip13-access-reconciliation-overlay-v1.json`

El overlay conserva 340 filas únicas y una sola operación primaria por perfil. Si se aplicara conceptualmente sobre el freeze, siete filas pasarían de `PRESERVE_NO_AUTH` a `NO_OP` y el perfil especial volvería a `HOLD`:

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=80
HOLD=1
PRESERVE_NO_AUTH=132
TOTAL=340
uniqueRows=340
onePrimaryOperationPerProfile=true
```

Por tanto, el requisito de producir un plan final `HOLD=0` NO puede demostrarse sin fabricar una selección de keeper. `targetHoldZeroSatisfied=false`, `executable=false`, `finalPlanProduced=false`.

## 7. Fail-close

```text
requestConsumeCommit=b56f372171d23fc7d06089d371ab4fa0b5dd90da
workflowRemovalCommit=a4df8983ab8f07504c939ab34f7361a96a04d649
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

## 8. Estado seguro

```text
providerReads=0
AuthReads=0
claimsReads=0
membershipReads=0
HRReads=0
providerWrites=0
AuthWrites=0
passwordChanges=0
passwordResets=0
membershipWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
merge=false
production=false
```

Direct runner DEV permanece PASS y sin cambios. El freeze Auth de 340 filas conserva su digest original y no fue ejecutado.

## 9. Siguiente bloqueo exacto

Para cerrar el único HOLD restante se necesita un discriminador nuevo y explícitamente autorizado para los dos candidatos del perfil `7cc28c78de9bfda01d14`. Las fuentes disponibles no contienen uno. No procede otra ejecución Auth ni un plan HOLD=0 hasta resolver keeper vs acceso a retirar sin arbitrariedad.

## 10. Clasificación

- **Reusable CXOrbia:** overlay no destructivo, verificación de no superposición y fail-close ante multi-Auth sin keeper.
- **Exclusivo TyA:** fingerprints SKIP13 y disposición de acceso.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** gobernanza de identidad, trazabilidad criptográfica y prohibición de inferencias arbitrarias.
- **Sin impacto Claude:** UI, rutas y módulos preservados.
