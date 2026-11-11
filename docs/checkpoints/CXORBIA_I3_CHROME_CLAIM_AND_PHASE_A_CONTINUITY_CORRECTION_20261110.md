# CXOrbia I3 — corrección de continuidad Chrome y cierre sin reprocesos

**Fecha local:** 2026-11-10, America/Guatemala  
**Ámbito:** Control operativo del plan B1–B9 *existente*; no abre otra candidata, rama, auditoría, metodología o autorización I4.  
**Autoridad:** `paulaosoriof86/demoCXOrbia`, `recovery/cxorbia-phase-a-20260831`; product source `4784f220912ccb1f4be19254ee6b9695dcd0a6eb`; product tree `0f0d5b080b249191696ffad6a17936bdb4c347db`.  
**Estado:** Diagnóstico y evidencia acotada; no afirma nuevos bloques `BLOCK_LOCKED`.

## Causa verificable del falso bloqueo de Chrome

El asistente consultó `browser.tabs.list()` en sesiones previas, obtuvo `[]` y clasificó incorrectamente el entorno como si no hubiera pestañas de Chrome conectadas. La documentación del navegador distingue **pestañas creadas/reclamadas por el asistente** de **pestañas propias abiertas por la usuaria**. Un listado vacío del primer tipo es normal después de la liberación entre turnos y **no prueba falta de conexión**.

**Reproducción y corrección 10-nov:** `browser.user.openTabs()` encontró la pestaña de la usuaria `CXOrbia · Preview Backend DEV` en `https://cxorbia-backend-dev.web.app/index-backend-dev.html`; `browser.user.claimTab(tab)` obtuvo control de esa pestaña real; `domSnapshot()` confirmó Administración, Cinépolis y NOV 2026. No hubo nuevo login, perfil ni credencial, ni sustitución por navegador externo. Esta es una **corrección del procedimiento de acceso del asistente**, no un cambio de código CXOrbia ni un defecto de producto.

**Invariante para las siguientes sesiones:** antes de decir que Chrome no está disponible, consultar `browser.user.openTabs()`, elegir por URL/título comprobados y reclamar exactamente el objeto devuelto. `browser.tabs.list()=[]` no es motivo para detener un bloque. Si no existe pestaña real, describir el hecho exacto, no inventar un bloqueo GitHub/Chrome. El acceso al usuario de prueba se hará solo por sesión y controles autorizados, sin credenciales nuevas.

## Evidencia visual de Chrome DEV — mismo candidato

| Superficie | Lectura directa | Alcance y decisión |
|---|---|---|
| Mi Día / B1 | NOV 2026 activo; 11 agendadas, 0 por aprobar, 12 realizadas, 11 sin asignar; calendario noviembre | `PASS_VISUAL_FOCAL_ADMIN_READONLY`; falta Shopper/aceptación integral B1 |
| Visitas / B3–B6 | 44 registros del período, 34 GT y 10 HN; 11 disponibles, 33 asignadas, 12 realizadas, 3 fuera de rango | `PASS_VISUAL_FOCAL_ADMIN_READONLY`; sin probar escritura ni check-in real |
| Detalle / B3 | Visita de C. Sankris Mall, Julissa Flores, asignada; honorario Q60 y pago `Pendiente de confirmación`; historial visible | `PASS_VISUAL_FOCAL_ADMIN_READONLY`; sin cambiar visita ni pago |
| Shoppers / B2 | 192 perfiles en proyecto, 87 activos según criterio de 6 meses; Jhennypher Murga 15 visitas, Julissa Flores 10; búsqueda y perfiles disponibles | `PASS_VISUAL_FOCAL_ADMIN_READONLY`; falta certificación integral de edición/rol Shopper |
| Postulaciones / B7 | 0 solicitudes nuevas, 33 asignaciones vigentes HR, 11 agendamientos, 0 cancelaciones/reprogramaciones pendientes. Diálogo `Pedir acción al shopper` ofrece cinco tipos; se abrió y cerró sin enviar | `PASS_VISUAL_FOCAL_ADMIN_READONLY`; no prueba recepción/reload del shopper |

## No repetir validaciones cerradas

- RUN2382 DEV publicación exacta; RUN2385 Academy/Postulaciones provider, RUN2387 Admin+Shopper GT/HN+PDF; RUN2391 decisiones de cancelación y reprogramación, idempotencia y limpieza: **mantener PASS focal**, no repetir salvo drift demostrado. Referencias durables en `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` y `docs/checkpoints/`.
- B4, B5, B6 conservan el PASS funcional/humano declarado en la continuidad. Ningún test focal aumenta por sí solo los 3/9 bloques `BLOCK_LOCKED` ni los 5/21 dominios `MATCH` estrictos.
- Academia D08: sesión del estudiante, guardado, nueva sesión, idempotencia y aislamiento proveedor ya PASS sintético. Falta **interfaz con Shopper/Cliente independiente** para aceptación final.
- B7: proveedor de postulación/notificaciones/decisiones ya PASS sintético. Falta **panel del destinatario en Chrome** (lectura, recarga, navegación), una prueba de rol pertinente y recibo humano.
- B1–B3: ejecutar únicamente acciones end-to-end y cláusulas visuales históricamente faltantes, con dueño/actor correcto; no volver a auditar toda la población/HR.
- B8: septiembre fue pagado externamente el 31-oct según Dirección; Chrome muestra 43 revisiones y 0 pagadas confirmadas. Requiere **conciliación por fuente y ACK**, no inferir pagos ni bloquear la vista general por un pago ficticio. Octubre pendiente, noviembre progresivo.
- B9: Gate20/Gate21 HOLD hasta regresión acumulativa sobre mismo artefacto y aceptaciones requeridas. Producción DO_NOT_TOUCH; I4 sin autorización efectiva.

## Regla de ejecución y comunicación para evitar bucle

1. Seleccionar un único owner/acción pendiente de B1–B3, Academia, B7 o B8 usando **antes** la matriz y recibos vigentes; no abrir investigación amplia del mismo owner ya acreditado.
2. Ejecutar una prueba realmente autenticada, documentar acción, actor, antes/después, ACK, persistencia y la pantalla necesaria; si no es posible, asignar `HOLD` con causa **exacta**.
3. Marcar individualmente técnico / visual Chrome / TinyFish (o excepción documentada) / humano. Pedir el PASS/FAIL de Dirección solo cuando se muestre prueba completa, sin confundir silencio con aprobación.
4. Registrar **un único receipt incremental** en la misma rama, actualizar puntero y seguir inmediatamente al siguiente cierre. No usar el tiempo en repetir pruebas previamente PASS.
5. Al estar todos los bloques exigidos aceptados, correr una vez la regresión y Gate20/Gate21 del mismo artifact. I4 requiere autorización y gate; urgencia no reemplaza validación.

**Project Sources**: espejo 07-oct superado; GitHub es autoridad. Sin cargar archivos en Project no afirmar sincronización de esas Fuentes. Congelar aquí el vínculo y entregar paquete QUITAR/AGREGAR/CONSERVAR al cierre documental; no detener las pruebas por ese espejo.
