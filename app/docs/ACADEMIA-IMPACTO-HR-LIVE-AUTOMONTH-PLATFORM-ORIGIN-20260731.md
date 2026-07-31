# Academia — HR viva, periodos automáticos y origen plataforma

**Fecha:** 2026-07-31  
**Estado:** `REUSABLE_PATTERN_DOCUMENTED__OPEN_READ_VALID__DEV_VS_PROD_GATE_SEPARATED__NO_PRODUCTION`

## Patrón reusable
Una operación de campo no debe exigir configuración técnica mensual cuando el calendario operativo ya existe en una fuente viva.

Para CXOrbia:
- una pestaña mensual nueva validada por metadata provider crea/detecta el periodo automáticamente;
- el navegador refresca la fuente viva periódicamente y al recuperar foco;
- una fuente fallback no puede inventar existencia: se conserva último estado válido y se falla cerrado;
- plataforma puede originar disponibilidad antes de HR;
- al aparecer HR, conciliar por IDs estables, origen y estado de sincronización; nunca por nombre visual.

## Caso TyA/Cinépolis
Julio puede mantener visitas pendientes en ejecución y agosto puede tener visitas disponibles platform-origin aunque aún no existan pestañas HR de agosto.

`PLATAFORMA ORIGINA → assignmentSource=platform → HR APARECE/REFLEJA → RECONCILIA → NO DUPLICA`.

`HR ASIGNA → PLATAFORMA DETECTA → RETIRA DE DISPONIBLES → RECONCILIA → NO DUPLICA`.

## Privacidad e identidad shopper
- preview source-safe: identidad enmascarada;
- runtime protegido: Auth + claims/RBAC + Firestore Rules;
- Admin/Operación ve identidad operativa;
- shopper solo su scope;
- no copiar PII a JS estático.

## Corrección reusable: lectura vs edición
La lectura abierta de una fuente no equivale a permitir escritura pública.

TyA ya utilizaba lectura pública/source-safe mediante GViz como fallback. Por tanto, exigir `Restricted` para que DEV pudiera leer la HR fue una mezcla metodológica incorrecta.

Regla reusable:
`READ CAPABILITY != WRITE POLICY`.

- **Public read** puede ser una decisión operativa válida si la fuente expuesta está prevista para lectura.
- **Provider authenticated read** puede coexistir y ser preferente para metadata/frescura.
- **Public write** es un riesgo distinto que debe evaluarse según el entorno y antes de cutover productivo.
- Un gate de hardening de producción no debe bloquear innecesariamente una validación DEV read-only.

## Provider actual
Google Sheets API está habilitada y la service account puede leer la HR canónica de 30 tabs/28 mensuales. El fallback GViz público read-only permanece como contingencia fail-closed.

## Fuente canónica
Archivos homónimos se distinguen por provider ID y estructura, no por título visual.

## Contenido para manuales/cursos
- fuente viva vs snapshot;
- detección automática de periodos;
- public read vs public write;
- provider auth y mínimo privilegio;
- gates separados DEV/producción;
- platform-origin antes de HR;
- conciliación bidireccional;
- `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`;
- source-safe vs runtime protegido;
- fail-closed y revisión de conflictos.

## Seguridad
Documentación únicamente. Sin deploy, Firestore/HR/Auth/Rules/Storage/Make/Gemini, merge ni producción.
