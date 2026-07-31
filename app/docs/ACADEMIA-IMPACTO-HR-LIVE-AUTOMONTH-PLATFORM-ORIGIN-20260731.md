# Academia — HR viva, periodos automáticos y origen plataforma

**Fecha:** 2026-07-31  
**Estado:** `REUSABLE_PATTERN_DOCUMENTED__AUTO_MONTH_REMOTE_PASS__DISPLAY_IDENTITY_MINIMUM_DEV__NO_PRODUCTION`

## Patrón reusable
Una operación de campo no debe exigir configuración técnica mensual cuando el calendario operativo ya existe en una fuente viva.

Para CXOrbia:
- una pestaña mensual nueva validada por metadata provider crea/detecta el periodo automáticamente;
- metadata de tabs y lectura de filas son responsabilidades separables;
- el navegador refresca periódicamente y al recuperar foco;
- fallback de filas no puede probar por sí solo que una pestaña existe: registry provider manda;
- plataforma puede originar disponibilidad antes de HR;
- al aparecer HR, conciliar por IDs estables + origen/estado de sincronización; nunca por nombre.

## Implementación validada en TyA
Remote DEV PASS:
- 14 periodos / 616 visitas / último `2026-07`;
- `tabRegistryAutoDiscovery=true`;
- `live_provider_metadata_auto_refresh`;
- Cloud Run y Hosting existentes redeployados exactamente una vez;
- producción intacta.

En Cloud Run, el runtime usa Application Default Credentials del service account para leer metadata de Google Sheets. Esto evita incrustar una llave privada en el contenedor.

## Caso Julio/agosto
Julio puede mantener visitas pendientes en ejecución mientras agosto tiene visitas platform-origin antes de que existan tabs HR agosto.

`PLATAFORMA ORIGINA → assignmentSource=platform → HR APARECE/REFLEJA → RECONCILIA → NO DUPLICA`.

`HR ASIGNA → PLATAFORMA DETECTA → RETIRA DE DISPONIBLES → RECONCILIA → NO DUPLICA`.

## Lectura vs edición
Regla reusable:
`READ CAPABILITY != WRITE POLICY`.

- Public read puede ser una decisión operativa válida.
- Provider authenticated read puede coexistir y ser preferente para metadata/frescura.
- Public write es un riesgo separado para hardening/cutover.
- Un gate de hardening de producción no debe convertirse artificialmente en bloqueo DEV read-only.

## Identidad shopper: mínima exposición útil
La validación humana necesita reconocer al shopper sin publicar su perfil sensible.

Patrón aplicado:
- endpoint source-safe normal: nombre enmascarado;
- vista operacional DEV: `display_name_only`;
- visible: nombre operativo + ID estable + país/métricas source-safe;
- excluido: teléfono, correo, DPI, banco/cuentas, credenciales, observaciones privadas y workbook crudo;
- módulos UI no se modifican para compensar backend;
- auto-entry de validación se preserva; no se introduce login técnico adicional.

Este patrón permite probar navegación, listas y módulos por identidad sin confundir “necesito reconocer el registro” con “debo exponer toda la PII”.

## One-shot de infraestructura
El gate de deploy usa contador persistido por proveedor:
- registrar inmediatamente la mutación Cloud Run;
- smoke antes de permitir Hosting;
- registrar inmediatamente la mutación Hosting;
- consumir autorización solo con ambos smokes PASS;
- nunca reejecutar un proveedor ya consumido por un fallo posterior.

## Fuente canónica
Archivos homónimos se distinguen por provider ID y estructura, no por título visual.

## Contenido para manuales/cursos
- fuente viva vs snapshot;
- detección automática de periodos;
- provider registry vs lectura de filas;
- ADC/runtime service account;
- public read vs public write;
- platform-origin antes de HR;
- conciliación bidireccional;
- `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`;
- identidad operativa mínima vs PII sensible;
- state machine one-shot de deploy;
- fail-closed y revisión de conflictos.

## Seguridad
DEV únicamente. Firestore/HR/Auth/Rules/Storage/Make/Gemini/pagos writes0; merge=false; producción=false.
