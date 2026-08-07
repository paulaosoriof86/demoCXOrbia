# DIAGNÓSTICO DE CAUSA RAÍZ — C6 ruta a producción

**Fecha:** 2026-08-07  
**Estado:** diagnóstico acumulativo con evidencia terminal.

## 1. Causa raíz principal — geometría de permisos incorrecta

La credencial conectada a GitHub es:

```text
firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

La política IAM le asigna capacidades operativas amplias —entre otras `roles/run.admin`, `roles/cloudbuild.editor`, `roles/firebaseauth.admin`, `roles/iam.serviceAccountTokenCreator`, `roles/iam.serviceAccountUser` y `roles/artifactregistry.reader`— pero originalmente no tenía los permisos IAM de inventario/creación necesarios para cerrar el runtime aislado.

Esto produjo una secuencia repetitiva:

```text
Cloud Run/build capabilities present
+ IAM service-account create absent
+ IAM policy/key visibility absent
= deployment path advances until the next IAM boundary and then STOP_RETRY
```

No es un problema del frontend, de `CX.data` ni del plan Auth de 340 filas. Es un desacople entre el rol del principal de control-plane y las operaciones administrativas excepcionales exigidas por C6.

## 2. Causa raíz secundaria — workflows one-shot efímeros

La estrategia de crear y retirar workflows nuevos en el mismo PR ha generado al menos un caso donde el workflow autorizado no materializó run observable. El PR es extremadamente acumulativo y dispara numerosas Actions históricas en cada cambio.

Al 2026-08-07 PR #7 registra miles de commits/archivos cambiados y cada actualización dispara múltiples workflows ajenos al bloque C6; esto genera ruido operacional y dificulta distinguir el gate nuevo.

Root-fix probado en el bloque actual:

```text
1. instalar workflow one-shot;
2. instalar request exacto;
3. disparar mediante pull_request:edited;
4. validar PR_HEAD_SHA=github.event.pull_request.head.sha;
5. claim único;
6. eliminar workflow y consumir request al terminar.
```

Este patrón materializó correctamente el run `31180615131`.

## 3. Causa ya corregida — SHA sintético del PR

El primer intento de direct runner comparó el source contra `GITHUB_SHA`, que para `pull_request` corresponde al ref/merge sintético. El contrato vigente usa exclusivamente:

```text
github.event.pull_request.head.sha
```

Ese problema no debe reaparecer.

## 4. Hallazgo de seguridad no bloqueante para el runtime

La credencial Firebase Admin SDK tiene varios roles amplios. El runtime nuevo, en cambio, quedó demostrado con:

```text
projectRoleCount=0
directServiceAccountBindingCount=0
userManagedKeyCount=0
```

Por tanto la separación runtime/control-plane funciona. El hardening de la credencial Firebase Admin SDK debe tratarse como deuda de seguridad separada después de estabilizar la ruta de producción, salvo que un gate demuestre un P0.

## 5. Conclusión

La demora desde ayer no proviene de rehacer la plataforma ni de una regresión funcional general. La ruta crítica se ha concentrado en cerrar de forma segura la identidad y el carril de ejecución antes de permitir Auth/provider writes.

Estado actual:

```text
runtime identity isolation=PASS
final fingerprint=PASS
provider boundary=still OFF
direct runner deploy=pending
Auth execution=pending
production=cutover pending
```

La siguiente secuencia no debe desviarse: revocar `roles/iam.securityReviewer`, probar revocación, desplegar una sola vez el direct runner DEV, cerrar SKIP13, ejecutar Auth según plan congelado, smoke multirrol y cutover autorizado.
