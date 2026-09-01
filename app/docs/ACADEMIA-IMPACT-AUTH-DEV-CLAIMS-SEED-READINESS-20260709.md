# Academia impact Auth DEV claims seed readiness

Fecha: 2026-07-09

## Temas nuevos para Academia

Academia debe explicar:

1. Que es Auth.
2. Que son custom claims.
3. Diferencia entre rol, permiso, scope y claim.
4. Diferencia entre dry-run de claims y escritura real de claims.
5. Por que las credenciales y datos personales no van en fixtures ni repo.
6. Por que el perfil completo de shopper requiere Auth/RBAC.
7. Que permisos tienen tenantAdmin, projectAdmin, financeAdmin, certificationAdmin y shopper.
8. Por que financeAdmin no ve datos financieros crudos.
9. Que acciones requieren auditEvent.
10. Como se valida el plan antes de activar claims.

## Por rol

- Administrador SaaS: configura tenant y roles.
- Administrador proyecto: opera proyecto dentro de su scope.
- Finanzas: revisa liquidaciones/pagos sin datos crudos.
- Certificaciones: revisa intentos y carryover.
- Shopper: ve solo su informacion propia.

## Estado

Contenido academico pendiente para Claude/prototipo. Backend deja contrato y validador listos.
