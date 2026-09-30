# PROTOCOLO-ACTUALIZACION-PROTOTIPO-CLAUDE

Fecha: 2026-07-01
Proyecto: CXOrbia backend y migracion a produccion
Rama canonica: release/cxorbia-tya-rc-20260630

## Objetivo

Actualizar rapidamente la base visual del prototipo cada vez que Claude entregue un nuevo ZIP, sin perder ni romper backend protegido.

## Metodo preferido desde V64

Usar integracion directa por ChatGPT/GitHub siempre que el ZIP este adjunto en la conversacion.

Paula solo debe adjuntar el ZIP nuevo de Claude y pedir:

`Audita y aplica VXX por fast-track GitHub preservando backend protegido.`

ChatGPT debe hacer:

1. Auditar estructura del ZIP.
2. Detectar cambios frente a la version vigente.
3. Verificar que no toca backend protegido.
4. Validar sintaxis JS y UTF-8 en sandbox cuando sea posible.
5. Aplicar archivos permitidos directamente en GitHub.
6. Preservar `app/core/backend*.js`, `app/index-backend-dev.html`, Firebase, reglas, seeds y herramientas backend.
7. Crear documentacion minima VXX.
8. Registrar commit en GitHub.
9. Solo pedir PowerShell para preview visual local o validaciones que requieran Firebase CLI/credencial local.

## Cuando usar PowerShell

PowerShell se usa solo si:

- hay que abrir preview local en navegador;
- hay que usar Firebase CLI local;
- hay que usar credenciales locales ignoradas;
- hay que validar algo que GitHub no puede ejecutar.

Si se usa PowerShell, debe ser un unico bloque, no comandos sueltos, con reporte corto y sin secretos.

## Backend protegido

No sobrescribir ni eliminar:

- `app/index-backend-dev.html`
- `app/core/backend*.js`
- `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`
- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `firebase/seeds/*`
- `firebase/client-write-tools/*`

## Reglas de decision

### Aplicar directo

Aplicar directo si:

- el ZIP trae solo prototipo/frontend;
- no contiene backend protegido;
- JS y UTF-8 pasan validacion;
- los cambios son consistentes con los pendientes de Claude;
- no hay datos reales ni secretos.

### Aplicar parcial

Aplicar parcial si:

- el ZIP trae mejoras utiles pero intenta tocar archivos protegidos;
- hay documentos que no deben sobrescribirse;
- hay archivos obsoletos que deben eliminarse con confirmacion documental.

### Devolver a Claude

Devolver a Claude si:

- rompe la arquitectura;
- mezcla Orbit/Orbia u otro proyecto;
- introduce datos reales;
- reemplaza backend o Firebase;
- rompe UTF-8 o sintaxis JS;
- elimina modulos criticos sin reemplazo claro.

## Documentacion minima por version

Para cada version VXX crear o actualizar:

- `AUDITORIA-PROTOTIPO-VXX-DETALLADA.md`
- `PENDIENTES-PROTOTIPO-VXX.md`
- `INCIDENCIAS-INTEGRACION-BACKEND-VXX.md`
- `CAMBIOS-PROTOTIPO-VXX-APLICADO.md`

`PAQUETE-PARA-CLAUDE-VXX.md` se prepara cuando Paula lo pida.

## Cadencia agil

Cada ZIP de Claude debe tratarse como una mini release:

1. Intake: recibir ZIP.
2. Audit: revisar riesgos y diferencias.
3. Apply: aplicar en GitHub con proteccion.
4. Validate: sintaxis, UTF-8 y backend protegido.
5. Commit: un commit por version.
6. Gate backend: continuar solo con la ultima version aplicada.

## Resultado esperado

El backend siempre avanza sobre la ultima version visual aprobada, sin reprocesar rutas, sin mezclar proyectos y sin hacer trabajo manual innecesario.
