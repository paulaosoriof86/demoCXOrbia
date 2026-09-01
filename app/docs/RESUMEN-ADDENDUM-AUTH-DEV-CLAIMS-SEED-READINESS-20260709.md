# Resumen addendum Auth DEV claims seed readiness

Fecha: 2026-07-09

## Para Claude/prototipo

El prototipo debe representar Auth/RBAC como configuracion/gate, no como Auth real activo.

Debe mostrar:

- roles configurables por tenant/proyecto;
- perfil completo bloqueado hasta Auth;
- mensajes honestos: `pendiente Auth`, `requiere acceso`, `gate apagado`;
- sin emails/passwords reales en fixtures;
- sin datos personales completos en preview publico.

## Para backend

Se agrego un plan source-safe de claims DEV y un validador ejecutable:

```bash
node tools/release/tya-auth-dev-claims-seed-plan-validate.mjs --out .tmp/auth-dev-claims-seed
```

El validador no llama Firebase ni escribe claims.

## Estado seguro

No produccion. No deploy. No Auth real. No claims escritos. No datos sensibles.
