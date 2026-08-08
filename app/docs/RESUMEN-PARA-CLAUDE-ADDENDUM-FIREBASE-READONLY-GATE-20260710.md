# RESUMEN-PARA-CLAUDE addendum — Firebase DEV read-only gate

Fecha: 2026-07-10

## Estado que Claude debe respetar

- El runtime post-V96 sigue validado.
- La matriz Auth preactivación está validada.
- Se preparó un gate para verificar Firebase DEV en modo read-only.
- El gate proveedor todavía no se ejecutó.
- No existen usuarios, claims, reglas o datos creados por este bloque.

## Estados que el prototipo debe representar

### Limpio verificado

`Entorno DEV verificado sin recursos de negocio detectados.`

No debe interpretarse como autorización para crear usuarios, importar, escribir o desplegar.

### No vacío / revisión requerida

`Se detectaron recursos existentes. Revisión humana requerida; no se borró ni sobrescribió nada.`

### Inconcluso

`No fue posible comprobar todos los componentes con acceso read-only. No se puede afirmar que el entorno esté limpio.`

### Target bloqueado

`El proyecto o la credencial no coinciden con el entorno DEV esperado.`

## Pendientes visuales

- tarjeta/readiness con Auth, Firestore, Storage, Functions y reglas;
- solo conteos/booleanos, nunca nombres o datos;
- gate provider-off/provider-read autorizado claramente diferenciados;
- botón de ejecutar bloqueado sin autorización;
- resultado no vacío con ruta de revisión y sin acción destructiva;
- resultado inconcluso sin badge verde;
- copy que indique que una verificación limpia no activa backend.

## Copy prohibido

No mostrar:

- `Firebase conectado` antes de la conexión real;
- `Base limpia` antes de que todos los checks obligatorios estén disponibles;
- `Datos eliminados` o `entorno corregido` porque el gate no borra;
- nombres de usuarios, colecciones, objetos, funciones, reglas o credenciales;
- `Listo para producción` por un resultado DEV.

## No tocar desde frontend

- workflows, runner y static validator;
- secret/credencial;
- APIs;
- decisiones técnicas de clean/nonempty/inconclusive;
- creación de usuarios/claims;
- rules/imports/provider calls.

## Validación esperada

- el estado inconcluso no se ve como limpio;
- no se exponen identificadores;
- revisión no ofrece borrado automático;
- provider read y provider write están separados;
- resultado DEV no promete producción;
- Academia y ayuda contextual explican el gate.

## Clasificación

- **Reusable CXOrbia:** UX de verificación segura.
- **Exclusivo cliente:** no incluir datos TyA en el componente genérico.
- **Claude/prototipo:** impacto directo.
- **Academia:** impacto directo.
- **Sin impacto Claude:** implementación API/credencial interna.
