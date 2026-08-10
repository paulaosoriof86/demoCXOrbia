# ACADEMIA — ADDENDUM C6 AUTH DUPLICATE KEEPER ONE-READ STOP

**Fecha:** 2026-08-10

## Impacto formativo

Este bloque no cambia pantallas, cursos, rutas por rol ni comportamiento funcional de Academia. Sí agrega un patrón de troubleshooting que debe conservarse para documentación técnica/operativa avanzada:

1. una cuenta provider habilitada no equivale por sí sola a un acceso válido;
2. claims/scope habilitantes prueban alcance técnico, no cuál principal duplicado es el keeper;
3. lineage source-safe debe ser única y reproducible antes de retirar o alterar un principal;
4. cuando dos candidates son equivalentes bajo discriminadores permitidos, se aplica fail-close y revisión humana, no heurística;
5. `creationTime`, `lastSignInTime`, orden de resultados, nombre o coincidencia visual no deben usarse para decidir propiedad en este caso;
6. una cuenta fuera de rol/tenant puede permanecer bloqueada sin requerir repair TyA inmediato.

## Ejemplo técnico source-safe

- tres pares Admin/Operaciones: acceso técnico potencial en ambos miembros, pero sin ancla única;
- un par Cliente: ambos históricos, ninguno coincide con la lineage canónica disponible;
- un par cross-tenant/outside-contract: cero acceso TyA efectivo y política cerrada sin modificación.

## Estado seguro

No se publican nuevos contenidos automáticamente. No hubo cambio UI, Auth write, provider write, deploy ni producción. Cualquier incorporación futura a manuales/cursos debe usar fingerprints/clases técnicas y nunca PII o credenciales.
