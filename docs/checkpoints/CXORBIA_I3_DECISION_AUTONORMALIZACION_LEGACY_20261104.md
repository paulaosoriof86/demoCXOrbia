# CXOrbia Recovery — ratificación de autoconciliación de identidad desde legacy
**Fecha:** 2026-11-04 (Guatemala) · **Iteración:** I3 · **Autoridad:** instrucción explícita de Paula en el Project CXOrbia Recovery · **Estado:** DECISION_RECIBIDA / IMPLEMENTACION_P0_PENDIENTE · **Producción:** DO_NOT_TOUCH.

Este recibo es append-only dentro del plan congelado V1.1; NO crea plan, rama, candidata, importación ni release nuevo. No certifica un arreglo ni autoriza I4.

## BEFORE → AFTER
BEFORE: el código vigente impide por diseño toda fusión automática: `app/modules/shoppers.js` exige decisión individual; el proveedor `backend/runtime/cxorbia-shopper-command-provider-v1.mjs` exige `fuzzyMatching:false` y `humanConfirmed:true` para adjudicación. El notice declara: «Ninguna fusión se realiza automáticamente». La fusión de Stiven confirmó proveedor/recarga, pero la consulta Shopper anterior del histórico fue 0 frente a 10 en Admin; VRM-304 está materializado en DEV, E2E posterior pendiente.

AFTER solicitado por Paula: trasladar la normalización y las fusiones automáticas compatibles por nombre de la legacy v5.86.44 al flujo transversal y permanente de identidad de CXOrbia; no requerir confirmaciones persona por persona cuando la equivalencia sea determinable; preservar identidad de ingreso, UID/alias, histórico, beneficios, postulaciones, certificaciones, liquidaciones, países y períodos. Corregir por causa/owner y no por shopper ni mes. Ratifica y amplía la autorización nominal corroborada que ya constaba en V1.1 del 16-10.

## Evidencia diferenciada de la cola
La pantalla Admin DEV del 04-11 registró 276 **claves técnicas únicas de caso o alias**, 24 perfiles marcados y 213 perfiles visibles; tras la fusión real de Stiven con ACK/readback: 275 claves técnicas, 22 marcados y 212 visibles. Los 275 NO son 275 personas ni 275 fusiones aprobadas. `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` combina revisiones del compositor y provider; el aviso `app/adapters/cxorbia-admin-identity-review-notice-v1.js` está definido como no bloqueante. Se requiere readback de la cola actual por motivo/ID/country/project/alias antes de cualquier batch; no usar contador como puerta I3 ficticia.

## Oráculo funcional legacy observado (lectura, sin login ni writes)
Plataforma v5.86.44: `_v5863Norm` normaliza tildes/caso/espacios; `_v5868StrongShopperLink` enlaza contactos y usuario; `_v5868WeakCompatibleShopperLink` enlaza nombre compatible sin conflicto; `_v5868LinkedShopperIds` conserva la red de alias; `_v5863MergeShopper` reasigna referencias de postulaciones; `_v5868CollapseAssignedPostDuplicates` deduplica asignaciones. También se observaron `regenerarVisitasDesdeHR`, `autoCrearPostsDesdeHR`, `submitPost`, `setPeriod`, liquidaciones, notificaciones, reportes y recursos. Transcribir contratos de comportamiento, NO copiar Realtime Database/localStorage, borrados ni confirmaciones sin ACK.

## Contrato de fusión transversal solicitado y condiciones que preservan datos
1. Generar claves de comparación de nombre completo normalizado y país dentro de `tenantId + projectId`; mantener criterios de teléfono, correo y username como corroboración fuerte. Dos registros con nombre equivalente y contacto faltante pueden ser equivalentes automáticamente si no existe señal contradictoria. No depender de shopper, Cinépolis ni mes.
2. La equivalencia nominal es candidata para consolidación automática, no autorización para mezclar a ciegas dos UIDs activos independientes, distintos países o registros marcados previamente como personas distintas. Resolver el keeper mediante evidencia de acceso y referencia HR. Si hay homónimo real o contactos contradictorios, aislar únicamente ese grupo; otros continúan.
3. La consolidación real debe tener evento de autoridad identificado como **automático** (no simular `humanConfirmed:true`), cambios provider transaccionales/idempotentes, ACK/readback, reversibilidad y conservación de históricos. Nunca reimportar/recrear HR ni cambiar dueño de una fila HR.
4. Antes y después de cada lote: coincidir revisión externa HR, counts de visitas por owner, `uniqueVisitKeys`, `duplicateVisitKeys=0`, login del keeper, periodos GT/HN, historial Admin/Shopper, pagos y postulación. Ningún alias histórico se borra físicamente para fabricar el conteo.
5. Reducir la cola con clasificación de `auto_resuelto_con_ACK`, `ya_resuelto`, `distinto`, `orphan_tecnico`, `ambigüedad_real`; mostrar cuentas de casos y de perfiles separadas. No ocultar un P0 ni usar el banner como gate bloqueante.

## Owners focales que deben probarse antes de escribir código
`backend/runtime/cxorbia-shopper-command-provider-v1.mjs` (reglas y consolidación durable), `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` (cola y consumo transversal), `app/adapters/tya-cumulative-read-model-v2.js` (visitas y alias), `app/modules/shoppers.js` (presentación), `app/adapters/cxorbia-admin-identity-review-notice-v1.js` (mensaje), pruebas correspondientes; preservar módulos MATCH no afectados. Clasificación inicial: FUNCTIONAL_DEFECT de política automática requerida + MAPPING_FAILURE/VRM-304 pendiente de E2E. Scope exacto por BEFORE/AFTER y pruebas antes de mutation funcional.

## Siguiente acción exacta
(1) Readback read-only de revisiones actuales por razón (no contar claves como humanos); (2) fixture transversal GT/HN, fuerte/débil/homónimo/contradicción, Auth keeper, pagos e histórico; (3) corregir owner P0, probarlo, publicarlo solamente sobre candidata serial DEV y certificar Admin+Shopper real; (4) actualizar matriz 21 dominios por evidencia; (5) I4 solo con I3 GO y autorización productiva. Producción, HR y datos reales NO cambiados por este recibo.

**Fuente congelada antes de este recibo:** HEAD control `3df22b79e1d11e8cc796ee6cab60b4b912293a9d`, source funcional `21a82e7a4b42ba2c0878bf1d6041b5b0e8dc7c1c`; source tree `2a98089c41bf0ca45d553902918c6eae6a539d60`. Cierre oficial I3 HOLD / 5 de 21 MATCH; I4 NO AUTORIZADO.
