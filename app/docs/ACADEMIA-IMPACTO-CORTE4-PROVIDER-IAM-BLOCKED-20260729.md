# ACADEMIA — Impacto Corte 4 provider IAM — 2026-07-29

## Aprendizaje operativo

Una credencial puede ser estructuralmente válida y aun así no tener permisos IAM suficientes. Academia debe separar claramente:

1. credencial/service account;
2. permisos IAM;
3. creación del proyecto Google Cloud;
4. incorporación de Firebase;
5. creación o despliegue de Firestore Rules;
6. lectura;
7. escritura;
8. activación del proveedor en CXOrbia.

## Caso Corte 4

- hardening `CX.data` read-only: PASS;
- credencial válida: disponible;
- permiso para crear/verificar proyecto: bloqueado;
- proyecto nuevo creado: no;
- base existente reutilizada: no;
- provider writes de datos: 0.

## Validación esperada del aprendizaje

El usuario debe poder explicar por qué no se resuelve un bloqueo IAM cambiando la UI, reutilizando una base existente o activando Firestore sin Rules.

## Estado seguro

Contenido documental; no activa proveedor, Rules, Auth, Storage, imports ni producción.
