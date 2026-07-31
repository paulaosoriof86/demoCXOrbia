# Academia — HR viva, periodos automáticos y origen plataforma

**Fecha:** 2026-07-31  
**Estado:** `REUSABLE_PATTERN_DOCUMENTED__HR_SHARING_P0_INCLUDED__NO_PRODUCTION`

## Patrón reusable
Una operación de campo no debe exigir configuración técnica mensual cuando el calendario operativo ya existe en una fuente viva.

Para CXOrbia:
- una pestaña mensual nueva validada por metadata provider crea/detecta el periodo automáticamente;
- el navegador refresca la fuente viva periódicamente y al recuperar foco;
- una fuente fallback no puede inventar existencia: si la metadata provider no está disponible, el sistema conserva el último estado válido y falla cerrado;
- el periodo operativo no depende exclusivamente de HR: plataforma puede originar disponibilidad antes de que la pestaña HR exista;
- cuando HR aparece, la conciliación usa IDs estables, origen y estado de sincronización; nunca nombre visual.

## Caso TyA/Cinépolis
Julio puede mantener visitas pendientes en ejecución y agosto puede tener visitas disponibles originadas en plataforma aunque aún no existan pestañas HR de agosto. Esto no es contradicción: son dos momentos del flujo bidireccional.

La regla correcta es:
`PLATAFORMA ORIGINA → MARCA assignmentSource=platform → HR APARECE/REFLEJA → RECONCILIA → NO DUPLICA`.

Y en sentido inverso:
`HR ASIGNA → PLATAFORMA DETECTA → RETIRA DE DISPONIBLES → RECONCILIA → NO DUPLICA`.

## Privacidad e identidad shopper
Un preview source-safe puede mostrar un placeholder para proteger PII. Eso no debe confundirse con el runtime autenticado:
- artefacto público/source-safe: mínimo dato, identidad enmascarada;
- runtime protegido: Auth + claims/RBAC + Firestore Rules; muestra la identidad necesaria según rol;
- Admin/Operación ve identidad operativa;
- shopper solo su propio scope;
- nunca copiar PII a JS estático para “arreglar” una pantalla de prueba.

## Gate provider
La automatización depende de una capacidad real del proveedor. Si Google Sheets API está deshabilitada, el sistema debe declararlo y no simular metadata mediante GViz. La activación de API es infraestructura de una sola vez; no forma parte del trabajo mensual del usuario.

La cuenta técnica que lee HR debe tener mínimo privilegio: `reader` sobre el archivo, no editor. En TyA ese reader ya existe.

## P0 de sharing reusable
Una fuente operativa con `anyone=writer` viola mínimo privilegio y debe bloquear producción, aunque el código y los datos sean correctos. El gate de cutover debe verificar también el sharing del sistema de origen, no solo Firebase/Firestore.

Lección reusable:
`PROVIDER READY = API CAPABILITY + FILE ACCESS MINIMO + NO PUBLIC WRITE + READ FRESHNESS + FAIL-CLOSED`.

## Separación de fuente mensual y origen operativo
Que HR aún no tenga la pestaña del mes no implica que no puedan existir visitas del mes siguiente si el flujo permitido es plataforma→HR. El sistema debe conservar explícitamente la procedencia de esos registros y reconciliar cuando aparezca HR.

No se debe inferir el contenido concreto del nuevo mes copiando el anterior: el contrato técnico puede estar listo, pero la materialización requiere el source-of-truth exacto de las visitas platform-origin.

## Contenido para manuales/cursos
- fuente viva vs snapshot;
- detección automática de periodos;
- existencia de tab antes de interpretar contenido;
- platform-origin antes de HR;
- conciliación bidireccional y anti-duplicación;
- `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`;
- privacidad source-safe vs identidad runtime;
- permisos mínimos del archivo fuente;
- fail-closed y revisión de conflictos;
- diferencia entre activación inicial de proveedor y operación mensual autónoma.

## Seguridad
Documentación únicamente. Sin cambios de sharing, provider writes, deploy, Firestore/HR/Auth/Rules/Storage/Make/Gemini, merge ni producción.