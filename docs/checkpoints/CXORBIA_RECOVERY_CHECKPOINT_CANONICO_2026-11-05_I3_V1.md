# CXOrbia Recovery — Checkpoint canónico acumulativo I3

**Fecha de corte:** 5 de noviembre de 2026, Guatemala.  
**Estado:** I3 / HOLD; Gate 20 HOLD; Gate 21 HOLD; Fase A aún no supera I3.  
**Producción:** `https://tya-plataforma.web.app/` LEGACY_ORACLE / `DO_NOT_TOUCH`; I4 sin autorización.  
**Repo/carril único:** `paulaosoriof86/demoCXOrbia`, `recovery/cxorbia-phase-a-20260831`.  
**Carácter:** checkpoint **aditivo**, no reemplaza ni modifica el Plan Rector, Addendum prevalente, locks históricos ni el Excel de aprobación humana.

## Autoridad técnica y comprobantes

- Producto canónico DEV aprobado para reproof: fuente `09eed4f012f9ad04e49d53569aabd86bd4c832a9`; árbol `e6f941c511272dfb0d258e935d7c1526c83b31cb`.
- DEV Hosting verificado en RUN2182: `sites/cxorbia-backend-dev/versions/3b675f7bcc8b07e6`; runtime `cxorbia-live-hr-dev-00347-jmn`; HR revisada `cdc40258e9806b5d0ff1e09dd19b19743b76ee3dd22ac7f849fac538c3340dac`.
- RUN2182: <https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42044986780>. Stiven fusionado con ACK protegido, replay idempotente cero escrituras; ficha Admin y Shopper 10/10 visitas; acceso normal validado, 56/56 rutas y 44/44 clics PASS. Identidad canónica de Stiven `shopper_gt_319cd82eaf`, usuario `stiven.lopez`; alias `shr-1783519013963-4koxm` retirado.
- RUN2183: <https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42047162119>. Inicio/cierre/reingreso con contraseña ordinaria Stiven PASS; prueba exhaustiva posterior interrumpida por espera de hidratación de 120 s y run en FAIL, sin invalidar el PASS independiente de RUN2182.
- Recuento exacto de cohorte: RUN <https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42054965975> (PASS de ejecución read-only; decisión funcional de cohorte `HOLD_REVISED_HR_SOURCE_NOT_APPROVED`). Artefacto `13429710430` (139 pares, 83 grupos, 0 fusiones, 0 escrituras, 0 deploy). Código de control a HEAD `6de860bd5db98f2cd38647d6c94082397b494e3f`; commits focales de auditoría `12909d...`, `c6aee9...`, `6de860...`. No cambió el producto ni su runtime.

## Identidades: decisión de Dirección y recenso exacto

Paula **ya confirmó SÍ** las 139 relaciones del Excel del 28 de octubre, distribuidas en 83 grupos; digest `ac3e15184316d62aa53942359e857f2c34dec486a2ca41057e529a39f062d872`. La autorización es **por cohorte completa**, sin confirmaciones repetitivas individuales; no hay homónimos vigentes identificados por Dirección. Stiven es un caso adicional a este Excel; no debe sumar al indicador 32/83.

El mecanismo anterior que funcionó para Stiven limitaba `approvedCases` a longitud 1; **esa es la causa comprobada de que no avanzara el lote**. El preflight viejo reconstruía los aprobados con nombre, teléfono y membresía activa y falló al cambiar la HR; esta dependencia temporal fue corregida en un preflight **solo de lectura**: 139/139 pares se recuperan mediante hashes irreversibles de los IDs exactos del Excel, sin publicar nombres, teléfonos, direcciones, credenciales, UIDs ni IDs de shoppers.

### Resultado actual (83 grupos; 63 GT y 20 HN)

| Situación | Grupos | Dictamen exacto |
| --- | ---: | --- |
| Cerrados por ACK y readback independiente | **32** | `ALREADY_CONSOLIDATED_AND_VERIFIED` |
| Alias con registros de visitas u otros dominios | **34** | `HOLD_ALIAS_OWNED_VISITS` |
| Múltiples IDs canónicos de HR en mismo grupo autorizado | **11** | `HOLD_MULTIPLE_HR_CANONICAL` |
| Segunda cuenta usada recientemente | **2** | `HOLD_SECONDARY_RECENT_SIGNIN` |
| Cuenta principal sin prueba suficiente | **1** | `HOLD_KEEPER_NOT_VERIFIED` |
| Cuenta principal verificada, apta para preparación del lote | **3** | `KEEPER_VERIFIED` |
| **Total** | **83** | **51 pendientes; 32 cerrados** |

- HR externa viva en RUN actual: **238 shoppers / 792 visitas**; revisión `cdc40258...`; la revisión aprobada al crear el Excel era `4fc8def7...`. Se confirmó **139/139 correspondencia de pares y 97/97 nombres de perfiles HR sin drift**. Aun así, **no se autorizó automáticamente ninguna escritura a causa de la nueva revisión**; hace falta readback de equivalencia de campos y período sin confundir la nueva revisión con autorización nueva.
- El proveedor existente soporta `shopper.identity.adjudicate` con ACK, idempotencia, preservación de perfil, consolidación de teléfono con evidencia, transferencia de referencias de pagos/certificados/visitas/otras colecciones y pruebas de alias sin residuos. No extrapolar ese soporte a la certeza de que los 51 ya quedaron ejecutados. Hay que comprobar conservación de variantes de dirección y nombre/usuario antes de operar masivamente.
- Paula pide **una única corrida por lotes** para los grupos autorizados, con resultado nominativo **solo después de ACK/readback**; no desbloquear mediante heurísticas nuevas ni forzar conteos.
- Los múltiples canónicos HR deben conservar registros externos fuente y probar que el read model respeta el nuevo crosswalk antes de migrar (no reimportar ni modificar HR). Los casos con visitas necesitan migración transaccional y recuento antes/después. Los casos con segunda cuenta usada recientemente deben preservar la credencial seleccionada por prueba, sin supresión silenciosa de acceso. No abrir una nueva arquitectura.

## Certificación de módulos (última matriz exacta)

Matriz acumulativa de referencia: `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261104-V244.json`, 21 dominios:

- **5 MATCH**: `historical`, `identity-membership-roll-forward`, `phase-a-supporting-core`, `reports-admin-shopper`, `tenant-admin-config-branding`.
- **3 TRUE_FUNCTIONAL_DEFECT**: `canonical-hr-state-adapters`, `certifications`, `finance-core-liquidation-costs`.
- **1 COMPOSED_NOT_DEPLOYED**: `persistence-command-ack-boundary`.
- **12 con evidencia parcial en DEV/CI o aceptación humana pendiente**: `auth-protected-data-runtime`, `base-router-shell-cache`, `benefits`, `client-portal-reportkit`, `core-config-data-router-permissions`, `dashboard-operation`, `documents-resources`, `human-runtime-domain-consistency`, `projects-periods-hr-source-wizard-multiproject`, `questionnaire-shopper`, `shoppers-mi-visitas-profile`, `visits-review-postulations-reservations`.

No equiparar módulos parcialmente comprobados con FAIL, ni bajar los 21 PASS históricos sin drift de su dueño. El dato **5/21** corresponde a MATCH integral con la **candidata actual**, no a todo el trabajo históricamente probado. RUN2182 cierra el P0 focal de Stiven 10/10; se debe actualizar el `actionRequired` antiguo de `shoppers-mi-visitas-profile`, pero **no** promover todo el módulo por esa única prueba.

## Antirregresión y sincronización

**Todavía no se puede garantizar sincronización completa**: GitHub/candidato DEV y HR viva están identificados y su huella reciente coincide en las pruebas focales, pero faltan el readback independiente de 51 fusiones, las pruebas integrales de 16 dominios y los Gate 20/21 de un único artefacto. Las 3 tareas legacy de CI en rojo por pushes de control deben clasificarse según sus logs, no interpretarse como regresión funcional sin prueba.

Regla operativa: un escritor, una rama, matriz por 21 dominios contra último blob aprobado, fuente y entrypoint, una candidata y un manifest, sin `overlay`, sin recompilar tras certificar y sin volver a tocar módulos PASS sin drift demostrado. Cualquier fallo se clasifica según el Addendum, se corrige en el owner exacto y se repite su gate; el progreso histórico no se resetea.

## Próxima acción exacta / owner / autorizaciones

1. **Identidades I3:** preparar y ejecutar secuencialmente un solo lote del padrón de 51 grupos aprobados, con preflight de cada caso, snapshot de los 7 dominios, selección de keeper segura, comando provider, ACK, dos replays sin escrituras, control de historiales y sesión shopper; registrar cerrado, pendiente y razón por grupo. La autorización humana de identidad **ya existe**; no pedirla de nuevo. Si un caso amenaza perder visitas o acceso, se conserva HOLD focal sin afectar el resto.
2. **Expedientes:** resolver avisos solo contra los registros que siguen abiertos tras el readback, sin conteos mezclados de duplicados/revisiones/fusionados; comprobar que desaparecen los ya resueltos y que queda únicamente revisión real.
3. **Módulos:** readback de 21 dominios contra matriz y OWNER, promover solo con pruebas E2E/roles/HR/finanzas correspondientes, mantener los PASS históricos.
4. **Cierre I3:** cuestionarios 15 preguntas Admin/Shopper, test de persistencia de intentos y versión, historia financiera y cuentas por pagar, navegación y carga real, no postulación/duplicación, elegibilidad HR GT/HN y visual E2E. Gate20 y Gate21 compartirán un mismo manifest y artefacto inmutable.
5. **I4:** solicitar autorización **solo cuando I3 sea GO**; producción `tya-plataforma.web.app` no tocada.

**Fuentes del Project:** conservar las 12 originales como autoridad histórica. Agregar este checkpoint aditivo y, si se crea, la planilla privada de reconciliación de grupos. No sustituir documentos congelados ni emitir otro plan rector paralelo.
