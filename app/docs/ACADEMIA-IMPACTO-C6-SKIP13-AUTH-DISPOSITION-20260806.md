# ACADEMIA — Impacto C6 SKIP 13 perfiles Auth

**Fecha:** 2026-08-06

## Aprendizaje reutilizable

Un perfil histórico y una cuenta de acceso son conceptos diferentes. Cuando la evidencia de identidad no justifica una reparación Auth, el sistema puede conservar el perfil, sus visitas, certificaciones y liquidaciones, mientras lo excluye de creación o actualización de credenciales.

Patrón aplicado:

```text
HOLD técnico
→ decisión humana documentada
→ PRESERVE_NO_AUTH
→ historia intacta
→ cero acceso nuevo
→ reincorporación manual futura permitida
```

## Control técnico

La disposición se aplica mediante fingerprints source-safe, coincidencia exacta del conjunto de 13 filas y digest del plan antes/después. Esto evita resolver por nombre, borrar historia o modificar accidentalmente otros shoppers.

## Impacto en cursos y manuales

- explicar separación entre identidad histórica y habilitación de acceso;
- incluir trazabilidad por autorización humana;
- enseñar que una excepción comercial no elimina controles de seguridad;
- conservar un gate final para verificar que cuentas preexistentes no otorguen acceso a perfiles omitidos.

No hubo cambios frontend, Auth, datos, deploy, merge ni producción.
