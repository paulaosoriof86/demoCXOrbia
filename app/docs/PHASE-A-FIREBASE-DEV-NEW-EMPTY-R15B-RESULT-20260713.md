# CXOrbia Phase A R15B — Firebase DEV nuevo y vacío

Decisión: **BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY**

Proyecto objetivo: `cxorbia-tya-dev-260713-r15a`

## Resultado

- La autorización explícita fue registrada correctamente.
- La credencial temporal existente es una service account válida de `cxorbia-backend-dev`.
- El lookup del nuevo project ID devolvió `PERMISSION_DENIED`; por seguridad no se interpretó como proyecto existente ni como proyecto libre.
- Se ejecutó el guard de creación atómica autorizado.
- Cloud Resource Manager rechazó la creación con `PERMISSION_DENIED`.
- El proyecto no fue creado.
- Firebase no fue agregado.
- No existe baseline nueva que pueda verificarse o utilizarse.

## Causa operativa

La service account disponible puede operar recursos autorizados dentro del proyecto Firebase DEV anterior, pero no tiene permiso de creación de proyectos Google Cloud/Firebase a nivel de organización, folder o cuenta.

El permiso requerido debe provenir de una identidad administradora con capacidad de crear proyectos. No puede ser autoasignado por la misma service account bloqueada.

## Estado seguro comprobado

- Creación de proyecto intentada dentro de la autorización: sí.
- Proyecto creado: no.
- Proyecto existente reutilizado: no.
- Borrado de proyecto: no.
- Vinculación de billing: no.
- Inicialización Auth: no.
- Usuarios Auth creados o modificados: 0.
- Inicialización o escrituras Firestore: 0.
- Inicialización o escrituras Storage: 0.
- Reglas, Functions o Hosting desplegados: no.
- Imports o migración de datos: no.
- Producción: no.
- Credenciales o PII expuestas: no.

## Bloqueo actual

Continúan en HOLD:

- configuración del adapter `CX.data` contra Firebase;
- inicialización Auth/Firestore/Storage;
- materialización Phase A;
- import real;
- deploy;
- producción.

`cxorbia-backend-dev` no se reutilizará porque la lectura R13 confirmó que contiene 17 usuarios Auth y datos Firestore.

## Única acción externa indispensable

Una identidad administradora de Google Cloud/Firebase debe realizar una de estas acciones equivalentes:

1. conceder temporalmente a la service account existente permiso para crear proyectos en el nivel correcto de organización/folder; o
2. crear manualmente el proyecto `cxorbia-tya-dev-260713-r15a` como proyecto nuevo, sin billing, sin Auth, sin Firestore, sin Storage, sin aplicaciones y sin datos.

Después de esa acción se podrá ejecutar la verificación sanitizada y continuar sin importar datos ni desplegar producción.
