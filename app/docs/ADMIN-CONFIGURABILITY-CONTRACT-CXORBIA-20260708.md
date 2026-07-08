# Admin Configurability Contract CXOrbia

Fecha: 2026-07-08  
Bloque: administrabilidad completa preview-only  
Archivo tecnico: `tools/contracts/cxorbia-admin-configurability-contract.mjs`  
Estado: seguro, documental/contractual, sin runtime real.

## 1. Objetivo

Este bloque deja definido un contrato de validacion para garantizar que CXOrbia evolucione como plataforma administrable desde UI/plataforma y no desde codigo, consola o cambios manuales no trazables.

El contrato valida que los modulos y opciones criticas puedan configurarse por `tenantId` y `projectId`, con roles, permisos, versionado, estado, auditoria, gate y revision humana cuando aplique.

No conecta backend real. No activa Firestore, Auth, Storage, Make, Gemini, HR, correo, WhatsApp, pagos ni import real.

## 2. Dominio cubierto

El contrato exige configurabilidad para estos dominios:

- proyectos;
- reglas;
- HR/origen;
- cuestionarios;
- documentos;
- plantillas NDA;
- planes;
- evidencias;
- certificaciones;
- Academia;
- notificaciones;
- postulaciones;
- shoppers;
- visitas;
- reservas;
- asignaciones;
- reprogramaciones;
- cancelaciones;
- liquidaciones;
- pagos;
- integraciones;
- Make;
- Gemini;
- imports;
- reportes;
- roles/permisos;
- gates/auditoria.

## 3. Estados y gates

Cada dominio configurable debe declarar como minimo:

- `domain`;
- `tenantId`;
- `projectId` o `null` si aplica a nivel tenant;
- `editable: true`;
- `versioned: true`;
- `rolesAllowed`;
- `status`;
- `auditRef`;
- `gate.required: true`;
- `gate.status`.

Estados aceptados a nivel general:

- `draft`;
- `in_review`;
- `human_review_required`;
- `approved`;
- `active`;
- `paused`;
- `replaced`;
- `archived`;
- `published`;
- `preview_only`.

Para integraciones/Make/Gemini, el proveedor debe permanecer en:

- `disabled`;
- `prepared`;
- `gate_required`;
- `preview_only`.

## 4. Reglas especificas NDA

El contrato exige que las plantillas NDA sean editables como plantilla/version por rol autorizado, pero sin modificar silenciosamente aceptaciones ya presentadas o firmadas.

Campos requeridos:

- `templateId`;
- `version`;
- `effectiveFrom`;
- `effectiveTo`;
- `status`;
- `tenantId`;
- `projectId`;
- `createdBy`;
- `approvedBy`;
- `auditRef`.

Reglas adicionales:

- debe existir `reacceptancePolicy`;
- debe existir `acceptanceImmutability: do_not_modify_existing_acceptance`;
- no se permite incluir archivos NDA firmados reales en el payload/repo;
- no se permite incluir DPI, banco, firmas, tokens ni documentos sensibles;
- la UI futura debe reflejar: pendiente, aceptado, version vencida, requiere nueva aceptacion, bloqueado por gate.

## 5. Reglas especificas planes

Los planes deben ser configurables y versionados, no hardcodeados.

Campos requeridos:

- `planId`;
- `planType`;
- `version`;
- `effectiveFrom`;
- `effectiveTo`;
- `status`;
- `tenantId`;
- `projectId`;
- `authorizedRoles`;
- `historyRef`;
- `auditRef`.

Tipos validos:

- `operational`;
- `project`;
- `certification`;
- `payments`;
- `evidence`;
- `automations`;
- `academy`.

Estados visibles esperados para Claude:

- borrador;
- en revision;
- aprobado;
- activo;
- pausado;
- reemplazado;
- archivado.

## 6. Bloqueos duros

El contrato bloquea cualquier manifest que intente declarar como activo:

- ejecucion real;
- escritura Firestore/base;
- escritura HR;
- escritura Storage;
- proveedor real conectado;
- Make real;
- Gemini real;
- Auth real;
- import real;
- notificacion/correo/WhatsApp real;
- pago real;
- publicacion sin revision humana;
- sobrescritura de versiones previas;
- modificacion silenciosa de NDA aceptado;
- datos sensibles crudos;
- DPI;
- banco;
- NDA firmado;
- secretos/tokens/webhooks/API keys.

## 7. Impacto Phase A

Este bloque avanza Phase A porque ordena la futura operacion real controlada desde plataforma:

- permite que TyA/Cinepolis sea un proyecto, no una logica global;
- prepara administrabilidad de reglas, HR, cuestionario, documentos, certificacion, evidencias, liquidaciones, pagos e integraciones;
- refuerza que junio se controle como liquidaciones/pagos pendientes, no como visitas pendientes;
- obliga a que Make/Gemini/imports/pagos permanezcan preparados o bloqueados por gate hasta autorizacion.

## 8. Impacto Claude/prototipo

Claude debe incorporar, cuando tenga capacidad, pantallas/estados administrables para:

- configuracion por tenant/proyecto;
- fichas de NDA con plantilla, version, vigencia, aprobacion, reaceptacion y gate;
- fichas de planes con tipo, version, vigencia, estado, roles, historial y auditoria;
- estados visibles claros: borrador, en revision, aprobado, activo, pausado, reemplazado, archivado;
- badges honestos: preparado, pendiente gate, requiere revision, no ejecutado;
- razon obligatoria en cambios criticos;
- no mostrar Make/Gemini/import/pagos como activos si el provider/gate no esta activo.

Claude no debe tocar backend, contratos, tools, workflows, Firestore/Auth/Storage, Make, Gemini, import real ni datos reales.

## 9. Impacto Academia

Academia debe explicar por rol:

- que es una configuracion por tenant/proyecto;
- diferencia entre plantilla NDA, version NDA, aceptacion y reaceptacion;
- que una aceptacion ya presentada no se modifica silenciosamente;
- que es un plan y que tipos de plan existen;
- significado de estados: borrador, en revision, aprobado, activo, pausado, reemplazado, archivado;
- como funcionan gates, revision humana y auditRef;
- que preparado no significa ejecutado;
- que provider configurado no significa provider activo;
- errores frecuentes: activar integraciones sin gate, sobrescribir versiones, exponer datos sensibles, confundir preview/import validado con import real.

## 10. Clasificacion obligatoria del bloque

- Reusable CXOrbia: contrato de administrabilidad multi-tenant, versionado, roles, gates, auditoria, estados honestos y provider-disabled default.
- Exclusivo cliente: ninguna regla exclusiva TyA queda hardcodeada; TyA/Cinepolis solo apareceria como datos de manifest externo.
- Claude/prototipo: debe convertir estos dominios en UI administrable, con estados, badges y copy honesto.
- Academia: debe profundizar NDA, planes, configuraciones, gates, roles y revision humana.
- Sin impacto Claude: el archivo tecnico no toca runtime ni UI; su ejecucion es preview-only.

## 11. Estado seguro

Sin cambios en `/app/modules`.  
Sin cambios en `/app/core`.  
Sin runtime real.  
Sin deploy.  
Sin produccion.  
Sin Firestore/Auth/Storage real.  
Sin HR writes reales.  
Sin Make/Gemini real.  
Sin correos/WhatsApp reales.  
Sin pagos reales.  
Sin import real.  
Sin datos sensibles en repo.
