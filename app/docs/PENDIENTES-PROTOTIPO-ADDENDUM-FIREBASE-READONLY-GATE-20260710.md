# PENDIENTES-PROTOTIPO addendum — Firebase DEV read-only gate

Fecha: 2026-07-10

## Estado

El gate técnico para verificar el estado limpio de Firebase DEV quedó preparado, pero la consulta al proveedor no ha sido ejecutada.

No se debe representar el entorno como limpio, conectado o listo para producción hasta que el resultado read-only exista y todos los checks obligatorios estén disponibles.

## Estados que el prototipo debe mostrar

### Verificación bloqueada

- autorización del proveedor pendiente;
- botón de ejecución deshabilitado o protegido;
- copy: `Verificación read-only pendiente de autorización.`

### Limpio verificado

- Auth sin usuarios;
- Firestore sin contenido de negocio;
- Storage sin objetos;
- Functions sin funciones detectadas;
- copy: `Entorno DEV verificado sin recursos de negocio detectados.`
- aclaración visible: no autoriza escrituras, import, usuarios, claims, reglas, deploy o producción.

### No vacío / revisión requerida

- mostrar únicamente componente afectado y conteo/booleano sanitizado;
- copy: `Se detectaron recursos existentes. Revisión humana requerida.`
- no ofrecer borrado, limpieza automática, overwrite o migración inmediata.

### Inconcluso

- indicar qué check no pudo verificarse, sin revelar recursos;
- copy: `No fue posible comprobar todos los componentes. No se puede afirmar que el entorno esté limpio.`
- nunca usar badge verde.

### Target incorrecto

- copy: `El proyecto o la credencial no coinciden con el entorno DEV esperado.`
- bloquear cualquier paso posterior.

## Datos prohibidos en UI, logs y exportaciones

- UID;
- correo;
- teléfono;
- nombre;
- custom claims completos;
- nombres de colecciones/documentos;
- nombres o metadatos de objetos Storage;
- nombres/configuración de Functions;
- nombres o contenido de reglas;
- tokens, credenciales o URLs privadas;
- respuestas crudas del proveedor.

## Pendientes Claude/prototipo

- tarjeta de readiness para Auth, Firestore, Storage, Functions y reglas;
- diferencia visible entre provider-off, provider-read autorizado y provider-write bloqueado;
- estado de ejecución con actor, fecha y referencia de auditoría, sin PII;
- explicación de que una verificación limpia no conecta el backend;
- ruta de revisión humana para entorno no vacío;
- bloqueo fail-closed ante estado inconcluso o target incorrecto;
- ayuda contextual y enlace a Academia por rol autorizado.

## Validación de candidata

- no mostrar `Firebase conectado` antes de activación real;
- no mostrar `Base limpia` si un check obligatorio quedó inconcluso;
- no exponer identificadores;
- no ofrecer acciones destructivas;
- no convertir DEV limpio en GO de producción;
- no activar botones de usuarios, claims, reglas, import o deploy por este resultado;
- conservar multi-tenant y proyecto configurable.

## Pendientes backend que no debe resolver frontend

- ejecutar el workflow read-only tras autorización explícita;
- corregir IAM/API read-only si el resultado es inconcluso;
- revisar cualquier recurso detectado sin borrarlo;
- preparar dry-run de identidades opacas solo después de clean-state verificado;
- mantener writes, claims, rules, imports y providers en gates separados.

## Impacto Academia

- interpretar clean/nonempty/inconclusive/target mismatch;
- diferencia entre lectura y escritura;
- no-deletion policy;
- autorización separada por proveedor;
- datos que nunca deben mostrarse;
- clean-state DEV no equivale a producción.

## Clasificación

- **Reusable CXOrbia:** estados de verificación segura y fail-closed.
- **Exclusivo cliente:** ningún dato TyA dentro del componente genérico.
- **Claude/prototipo:** impacto directo.
- **Academia:** impacto directo.
- **Sin impacto Claude:** endpoints, credencial temporal y artifact interno.
