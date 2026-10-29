# CXOrbia Recovery — Fase A / I3 — Corte de verdad funcional y decisiones

Fecha local: 2026-10-29 (America/Guatemala).

## Autoridades que no deben desincronizarse

- Repositorio: `paulaosoriof86/demoCXOrbia`, rama `recovery/cxorbia-phase-a-20260831`.
- Fuente de producto única: `a2be5a77a4c0008ec374c17f42d5da27070e1ed6`, árbol `eb8734a450c14d510a9a9924b39cb826caacf510`.
- Matriz funcional: V192, 21 dominios; ledger: V524; plan de choque: 82 tareas. No cambiar los conteos sin readback y evidencia trazable.
- Producción `tya-plataforma.web.app`: DO_NOT_TOUCH; I3 HOLD, Gate20 y Gate21 HOLD. No promover a I4 LIVE por un pase de fuente o un despliegue DEV.
- Fuente de verdad para país, visitas, períodos y conteos históricos: hoja de ruta HR viva, con comparación protegida y multirrol.

## ¿Por qué sigue en 5/21 y qué se necesita para cerrar?

V7 (2026-10-06) tenía 13 MATCH, 3 aprobados no compuestos, 5 defectos. V192 aplica criterios de fuente-served-runtime, integración transfuncional y pruebas actuales: 5 MATCH; 11 avances de código pendientes de certificación en DEV; 2 compuestos no desplegados; 3 defectos funcionales. Nueve MATCH históricos requieren nueva evidencia y un defecto histórico ahora sí es MATCH. No son nueve regresiones demostradas.

| Estado | Dominios | Cantidad |
|---|---|---:|
| MATCH | `historical`, `identity-membership-roll-forward`, `phase-a-supporting-core`, `reports-admin-shopper`, `tenant-admin-config-branding` | 5 |
| Fuente corregida/instrumentada, pendiente UAT integral sobre el mismo artefacto DEV | `auth-protected-data-runtime`, `base-router-shell-cache`, `benefits`, `client-portal-reportkit`, `core-config-data-router-permissions`, `dashboard-operation`, `documents-resources`, `human-runtime-domain-consistency`, `projects-periods-hr-source-wizard-multiproject`, `shoppers-mi-visitas-profile`, `visits-review-postulations-reservations` | 11 |
| Compuesto, sin despliegue acreditado | `persistence-command-ack-boundary`, `questionnaire-shopper` | 2 |
| Defectos funcionales aún reales | `canonical-hr-state-adapters`, `certifications`, `finance-core-liquidation-costs` | 3 |

Los 16 no-MATCH no se deben sumar como reparaciones pendientes de programar: 13 necesitan fundamentalmente traslado y pruebas o integración, y 3 aún requieren corrección funcional. La matriz se actualiza solo al producir evidencias por dominio.

## Decisiones aprobadas de identidad y teléfonos

1. Un shopper real debe conservar un único expediente canónico con todas sus visitas, certificaciones, beneficios y relaciones históricas.
2. Una fusión explícitamente confirmada por Paula puede conservar el UID técnico/login y contraseña más seguros, y redirigir alias/crosswalk sin inventar visitas ni borrar históricos.
3. No fusionar dos personas únicamente por nombres parecidos o teléfonos; cuando haya ambigüedad, colocar una revisión idempotente y aviso visible a Admin/Operaciones.
4. La regla preventiva HR examina el mismo lote y sincronizaciones posteriores antes de crear otra identidad: normalizar nombres/país y vincular expedientes conocidos; ante ambigüedad detener **solo la alta duplicada**, nunca toda la operación.
5. El teléfono nunca bloquea una identidad humana ya acreditada. Elegir el normalizado más frecuente entre fuentes independientes; si empatan, cualquiera de los empatados; conservar alternativos y procedencia. Si no existe, continuar.
6. En el primer ingreso el Shopper debe revisar/actualizar su ficha y contacto, incluso si el dato elegido parece correcto. No condicionar login o fusión a tener móvil.
7. Cada fusión protegida exige foto previa de identidades, referencias en siete dominios, operación idempotente por el proveedor, ACK inequívoco, lectura posterior de Auth/perfil/crosswalk/HR y sin escrituras directas ni LIVE.

Las reglas de normalización telefónica y revisión humana ya están presentes byte a byte en la fuente A2BE: provider `2cbe2ac0ca615aed6bfd965286288d760381cc28`, pruebas contacto `250b109e381eb19632cddc527adb269a6776ae0f` y nombre fuerte `5c746b69f45a1881194b119df9238689000ccbba`; prevención HR `add166ed67fcd0940f8d403d6f990bc85bee90e4`. No reconstruir ni duplicar estos cambios.

## Evidencia de integración y fusión

- [G03 fuente](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40832241773): PASS.
- [A2BE preflight DEV](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40832241567): PASS, no deployment.
- [R026 protected keeper READ-ONLY](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40831162917): PASS, 5 visitas HR y cero referencias operativas a alias en siete dominios; UID técnico identificable solo por huella. 0 fusiones/0 escrituras.
- [A2BE materialización DEV](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40833285318): **PASS**, revisión Cloud Run `cxorbia-live-hr-dev-00330-fim` al 100 % del tráfico compartido DEV, Hosting Preview `https://cxorbia-backend-dev--i3-a2be-40833285318-rlxwpgjo.web.app`, fuente/servidos byte a byte y GET HR meta PASS, Hosting LIVE intacto. `result.json` del artifact `12879617256` acredita cero escrituras Auth/Rules/HR y cero producción. No equivale a un nuevo MATCH sin UAT de roles.
- [R026 canaria protegida #40833855942](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40833855942): **PASS** (artefacto 12879856480). Proveedor ACK, `identityConsolidated=true`, replay idempotente, `readback=true`, 9 escrituras del proveedor autorizado, cero directas Auth/Firestore, 0 HR/LIVE, UID técnico original/credenciales conservados, 1 principal secundario retirado, 5 visitas históricas HR preservadas, siete dominios de alias con cero registros, contactos divergentes no bloqueantes y `contactReviewAtFirstLogin=true`. Shopper autenticado en misma Preview DEV recuperó 5 visitas.
- El total provisional de expedientes fusionados pasa **31/83 a 32/83** por este único cierre. Reconciliar contra ledger global antes de usar como cifra definitiva de toda la cohorte.
- En la sesión técnica Shopper R026, el modelo protegido devolvió `sourceAvailableAll=4`, `currentPeriodAvailable=3`, `countryAvailable=3`, `authorizedProgramAvailable=3` (`cinepolis-2026-10`, GT); la interfaz aún requiere lectura visible independiente para verificar que **no muestre 0** con tres ofertas efectivas. No dar PASS de marketplace/HR hasta ese readback.

## Actualización focal S1 y próximas fusiones — mismo 29 de octubre

- [S1 Shopper UI autenticado #40834869606](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40834869606): **PASS FOCAL** `PASS_S1_SHOPPER_UI_MATCHES_HR_SCOPE` en la misma Preview A2BE: país `GT`, período `cinepolis-2026-10`, revisión HR `4fc8def7...`, 748 filas fuente cargadas, 34 filas dentro del alcance, **1 visita efectivamente elegible = 1 tarjeta visible = encabezado 1**; mensaje vacío ausente, cero escrituras y cero despliegues. Corrige el temor de un **cero general** para el caso R026, pero no acredita todos los shoppers GT/HN ni el dominio completo de visitas.
- El contador de **3** previo era una lectura de `visitFacets().available` sobre el período; la pantalla filtra además estados terminales, propiedad/asignación, agenda, realización, cuestionario, submit, fuera de rango y facetas de liquidación/pago. La diferencia **3 señales iniciales → 1 postulable** es plausible y más segura; falta readback causal individual para las dos exclusiones. No afirmar todavía los motivos exactos ni que tres oportunidades deban aparecer.
- [S1 causal #40835252174](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40835252174): **HOLD** por `page.waitForFunction: Timeout 120000ms exceeded` al esperar la autoridad protegida de la sesión tras autenticación; sin escrituras. Es evidencia nueva de intermitencia/carga del runtime o su restablecimiento, **no invalida el PASS anterior ni permite concluir por qué se excluyeron dos visitas**. Abrir diagnóstico con telemetría por etapa, no reintentar a ciegas.
- Propuesta del siguiente caso de fusión: **R053 GT**, identificado como `KEEPER_VERIFIED` en el preflight global #40820123220, con 1 HR/1 identidad técnica y sin alias-owner en siete dominios en ese corte histórico. **No ejecutar fusión** hasta revalidar en DEV Auth/UID/crosswalk/siete dominios/readback y controles telefónicos no bloqueantes. R026 queda cerrado y excluido de nuevos lotes.
- D07 PDF Instructivo Cinépolis: el manejo de error fuente en A2BE ya no promete un enlace inexistente, pero el **GET protegido auténtico aún no está acreditado**; se requiere sesión efímera y respuesta HTTP + firma `%PDF-` sin repetir OPTIONS previo 200 ni publicar PDF/tokens.
- [D07 GET autenticado real #40835846457](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/40835846457): **HOLD REAL Y CAUSAL**, artefacto de resultados prueba 1 recurso activo/publicado único, source/served A2BE byte-match, Shopper autenticado y token obtenido, **exactamente 1 GET iniciado**. `RESOURCE_READ_GET_FAILED`, `TypeError`, `transportRequestFailed=true`, `httpStatus=null`, `bytesRead=false`, etapa `GET`. No alcanzó respuesta HTTP ni contenido PDF. Próxima acción: diferenciar CORS de fallo de red del browser por telemetría de la solicitud; **no repetir OPTIONS 200 ni modificar Storage/Rules sin diagnóstico**. Cero datos/HR/Auth/Storage/deploy escritos.
- Cinco dominios con evidencia focal S1/R026 que requieren todavía QA transversal para MATCH: `auth-protected-data-runtime`, `base-router-shell-cache`, `human-runtime-domain-consistency`, `shoppers-mi-visitas-profile`, `visits-review-postulations-reservations`. Certificaciones y Finanzas siguen defectos funcionales no cerrados. Matriz **5/21**, ledger **V524**, plan **82** sin cambios por estos avances.

## Ruta única de cierre funcional (sin iteraciones repetidas)

1. Acreditar en DEV misma fuente/tree de backend+Hosting Preview, byte readback, revision/health, LIVE intacto.
2. Ejecutar S1 Admin/Shopper multi-caso GT/HN: HR viva, país, identidad, primer ingreso, visitas disponibles ≠ cero si HR indica disponibles, elegibilidad, postulaciones, reserva y Mi día. La cifra debe coincidir con HR y filtros de período/país/proyecto.
3. Ejecutar S2 Admin/Shopper: certificaciones y recertificación, recursos del proyecto, D07 GET autenticado del PDF, acuse y notificación. OPTIONS 200 es evidencia anterior: no repetirlo ni sustituir por el GET.
4. Ejecutar S3 Admin/Operaciones/Shopper: dashboards operativo y financiero, movimientos, liquidaciones, lotes de pago, beneficios, notificaciones, proyectos nuevos/autoadministración, tiempos de carga y sincronización, documentos y reportes.
5. Corregir únicamente P0 reproducidos; ejecutar QA focal, readback de regresión y actualizar una sola matriz V193 o sucesora por evidencia. Los 16 no-MATCH no se cierran en bloque.
6. Promover a LIVE solo con autorización explícita vigente y gates correspondientes. La presión horaria no altera protección de datos ni trazabilidad.

Estado de esta acta: **checkpoint de decisiones y evidencia**, no un nuevo MATCH ni una aprobación de producción.
