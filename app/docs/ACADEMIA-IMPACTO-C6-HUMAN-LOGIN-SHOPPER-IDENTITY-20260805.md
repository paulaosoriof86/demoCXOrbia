# ACADEMIA — Impacto C6 Login humano e identidad Shopper

**Fecha:** 2026-08-05  
**Clasificación:** Academia · Sin cambio funcional

## Resultado

El bloque corrigió en source el bridge de autenticación para usar un único formulario y auditó identidades Shopper. No modificó:

- módulos de Academia;
- cursos;
- certificaciones presentadas;
- manuales;
- rutas de aprendizaje;
- notificaciones;
- contenidos por rol.

## Impacto futuro

Los manuales de acceso no deben afirmar todavía que todos los shoppers usan `nombre.apellido` y `Nombre123*`. La auditoría mostró que esos patrones no son universales.

Antes de actualizar material de formación debe existir:

1. contrato canónico de identidad Shopper aprobado;
2. población reparada y validada;
3. Login single-form desplegado;
4. validación humana por Staff, Shopper y Cliente.

## Estado

```text
ACADEMIA_FUNCTIONAL_IMPACT=false
LOGIN_MANUAL_UPDATE_PENDING=true
DEPLOY_EXECUTED=false
IDENTITY_REPAIR_PENDING=true
```

Cero writes, deploy, merge o producción.
