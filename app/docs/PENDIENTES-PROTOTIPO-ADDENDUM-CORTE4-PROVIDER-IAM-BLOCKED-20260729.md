# PENDIENTES PROTOTIPO — Corte 4 provider IAM — 2026-07-29

## Bloqueante externo único

Configurar una identidad capaz de crear/verificar el proyecto Firebase nuevo:

- opción A: corregir `CXORBIA_GCP_PROJECT_CREATOR_JSON` con service account dedicada y permisos `resourcemanager.projects.create` + `addFirebase`;
- opción B: crear una sola vez `cxorbia-tya-dev-260729-c4` con identidad administradora y otorgar lectura a la service account existente.

## Evidencia

- credencial válida disponible: `existing_dev_service_account`;
- project probe: permiso denegado;
- creación atómica: bloqueada por permiso/política;
- proyecto creado=false;
- Firebase agregado=false;
- base preexistente reutilizada=false.

## Después del desbloqueo

1. verificar identidad nueva;
2. verificar vacío;
3. completar config web DEV sin secretos;
4. autorizar/desplegar Rules read-only;
5. activar solo lectura;
6. smoke `source=firestore`, `empty=true`, `fallbackUsed=false`, `writes=0`.

## No bloqueantes heredados

PDF, Excel, reportKit, copy de fuentes y registry R20.

## Prohibiciones

No reutilizar `cxorbia-backend-dev`, no nueva candidata, no import, no writes, no producción.
