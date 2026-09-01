# ACADEMIA — IMPACTO CORTE 4 PROTECTED SMOKE PASS

**Fecha:** 2026-07-29

## Conceptos incorporados

El bloque demuestra una secuencia reutilizable para explicar backend seguro en CXOrbia:

1. **Auth inicializado no equivale a proveedor habilitado.**
2. **Proveedor habilitado no equivale a usuario permanente.** En un smoke controlado puede existir un principal temporal reversible.
3. **Claims y Rules son controles distintos.** El usuario temporal recibió `role=admin` y `tenantId=tya`; las Rules mantuvieron create/update/delete denegados.
4. **Backend vacío debe verse vacío.** El navegador comprobó `source=firestore`, `empty=true` y `fallbackUsed=false`.
5. **Read-only es una propiedad verificable.** El gate exigió `readOnly=true`, `writeMode=disabled` y bloqueo de escritura directa.
6. **Cleanup es parte del gate.** El resultado no se considera seguro hasta volver a Auth users=`0` y Email/Password deshabilitado.
7. **Ejecución y reporting deben distinguirse.** El publicador produjo un falso negativo porque esperaba una evidencia secundaria redundante aun cuando el executor ya había cerrado y verificado cleanup. La causa raíz se corrigió sin repetir el principal temporal.

## Reusable CXOrbia

- principal temporal con credencial no expuesta;
- claims tenant/rol limitados al smoke;
- browser smoke sobre backend vacío;
- cleanup obligatorio y verificable;
- reconciliación entre resultado del executor y status agregado;
- evitar reruns con nuevos writes cuando basta corregir el publicador.

## Exclusivo TyA

- Firebase DEV `cxorbia-tya-dev-260729-c4`;
- tenant `tya`;
- ubicación Firestore `us-central1`.

## Sin cambio de contenidos funcionales

No hay cambio en manuales, cursos o rutas de rol por este bloque. Auth/RBAC completo sigue reservado para Corte 6.
