# RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-JERARQUIA-TENANT-CUENTA-PROYECTO.md

## Contexto

Paula aclaró una regla de negocio importante: cada cliente de CXOrbia es una consultora, cada consultora puede tener varias cuentas/clientes finales, y cada cuenta puede tener uno o más proyectos configurados dentro de la plataforma.

## Decisión canónica

```text
Tenant = consultora cliente de CXOrbia
Cuenta = cliente final / marca / cuenta comercial administrada por la consultora
Proyecto = campaña, ronda o programa operativo configurado en CXOrbia
Visita = unidad operativa dentro del proyecto
```

## Ejemplo T&A

```text
Tenant: T&A Consultores
Cuenta: Cinépolis
Proyecto: Cinépolis Guatemala Junio 2026 Q1
Visitas: sucursales y escenarios de esa ronda
```

## Implementación documental

Se agregó/actualizó:

- `ARQUITECTURA-JERARQUIA-TENANT-CUENTA-PROYECTO.md`
- `MAPEO-CXDATA-FIRESTORE.md`
- `firebase/seed-tya-piloto.json`
- `CAMBIOS-BACKEND.md`
- `ESTADO-GATES-PR1.md`

## Decisión técnica

Para no romper el prototipo aprobado:

- se mantiene `/tenants/{tenantId}/projects/{projectId}` para proyectos;
- se usa `/tenants/{tenantId}/clients/{accountId}` como colección compatible para cuentas/clientes finales;
- cada proyecto debe incluir `accountId`, `clientId`, `accountName` y/o `client`;
- las visitas, postulaciones y cuestionarios conservan `projectId` y ahora pueden llevar `accountId`/`clientId`;
- no se cambia `/app/modules`;
- no se activa adapter.

## Implicación para futuros clientes

La migración inicial sigue siendo T&A como primer tenant, pero la arquitectura no queda hardcodeada a T&A. Nuevas consultoras se modelarán como nuevos tenants, cada una con sus cuentas y proyectos propios.

## Estado

- Auth DEV ficticio ya fue completado.
- Firestore rules DEV ya fueron publicadas.
- Seed ficticio fue ajustado para reflejar cuenta/proyecto, pero no ha sido cargado en Firestore.
- Próximo gate sugerido: dry-run/validación de seed ficticio actualizado, sin escribir datos hasta autorización separada.
