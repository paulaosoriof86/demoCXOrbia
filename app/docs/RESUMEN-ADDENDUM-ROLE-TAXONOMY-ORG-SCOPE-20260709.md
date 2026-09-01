# Resumen addendum role taxonomy org scope

Fecha: 2026-07-09

## Que se agrego

Se agrego cobertura de roles/personas para representantes, coordinadores, franquiciados/franquicia, cliente/marca evaluada, finanzas, certificaciones y shoppers/evaluadores.

## Para Claude/prototipo

Claude debe incorporar roles/personas configurables por tenant/proyecto y no asumir solo admin/shopper. Debe permitir scopes por tenant, pais, proyecto y propio perfil.

## Para backend

Antes de activar Auth/claims se debe validar la taxonomia con:

```bash
node tools/release/tya-role-taxonomy-org-scope-validate.mjs --out .tmp/role-taxonomy
```

## Estado seguro

Solo contrato/config/script. No activacion real.
