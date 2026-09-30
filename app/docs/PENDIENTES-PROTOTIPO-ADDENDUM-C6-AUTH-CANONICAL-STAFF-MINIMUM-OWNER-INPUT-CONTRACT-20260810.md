# PENDIENTES PROTOTIPO — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Fecha:** 2026-08-10

## Pendiente backend vivo

A–C ya no requieren investigación técnica adicional ni selección de legacy. El pendiente quedó reducido a seis respuestas empresariales:

```text
A Superadministración: titular + TyA completo/proyectos específicos
B Administración: titular + TyA completo/proyectos específicos
C Operaciones: titular + TyA completo/proyectos específicos
```

Después de recibirlas, backend debe convertirlas a owner anchors source-safe, entitlement exacto, target claims y expected-claims digests.

## Estrategia de credencial

- A: reutilizar el `super` canónico existente solo si owner binding independiente coincide; si no, credencial nueva efímera.
- B/C: credencial nueva efímera obligatoria durante ejecución separadamente autorizada.
- Nunca persistir login/secret crudo en repo, artifact o log.

## No hacer

- no pedir fingerprints a Paula;
- no seleccionar keeper legacy;
- no inferir por unicidad de rol;
- no copiar scope legacy;
- no asumir Cinépolis;
- no wildcard silencioso para TyA completo;
- no provider read;
- no PREWRITE/Activation/smoke/repair;
- no Auth/Firestore/IAM/HR/Rules/Storage writes;
- no frontend workaround;
- no deploy, merge o producción.

D `ae2f...` permanece `REPAIR_PLAN_READY` y fuera del bloque.
