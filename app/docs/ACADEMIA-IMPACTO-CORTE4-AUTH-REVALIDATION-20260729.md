# ACADEMIA — IMPACTO CORTE 4 AUTH / REVALIDACIÓN

Fecha: 2026-07-29

## Impacto conceptual

Academia/manuales deben diferenciar claramente:

- proyecto Firebase;
- IAM del runner;
- Web App;
- Firestore;
- inicialización de Firebase Authentication;
- proveedor de inicio de sesión;
- usuario/principal;
- claims de rol/tenant;
- Firestore Rules;
- lectura protegida;
- materialización de datos;
- Auth/RBAC completo de Corte 6.

## Regla operativa

Inicializar Authentication no significa que exista un usuario ni que un proveedor esté habilitado. Un smoke protegido necesita un principal autenticado cuando las Rules requieren `request.auth`.

Si se usa un principal temporal DEV para smoke:

1. debe existir solo durante la prueba;
2. no debe llevar datos reales;
3. la credencial no se publica ni se guarda en repo;
4. se elimina al terminar;
5. el proveedor temporal se deshabilita al terminar;
6. se confirma nuevamente Auth users=0.

## Clasificación

- Reusable CXOrbia: lifecycle de principal temporal y separación Auth config/proveedor/usuario/claims.
- Exclusivo TyA: tenant `tya` y Firebase DEV concreto.
- Sin impacto en contenidos frontend inmediato: no requiere nueva lección visible hasta que se consolide el manual de backend/administración.
