# CXOrbia Recovery — checkpoint canónico acumulativo I3 V2

**Fecha:** 5 de noviembre de 2026, Guatemala. **Iteración:** I3. **Estado:** HOLD.  
**Fuente y producto:** `09eed4f012f9ad04e49d53569aabd86bd4c832a9`, árbol `e6f941c511272dfb0d258e935d7c1526c83b31cb`.  
**DEV exacto preservado:** Hosting `sites/cxorbia-backend-dev/versions/3b675f7bcc8b07e6`; runtime `cxorbia-live-hr-dev-00347-jmn`.  
**Producción:** `https://tya-plataforma.web.app/` LEGACY_ORACLE / `DO_NOT_TOUCH`. No I4 ni autorización productiva.  
**Autoridad:** aditivo sobre [V1](CXORBIA_RECOVERY_CHECKPOINT_CANONICO_2026-11-05_I3_V1.md) y todas las fuentes/locks Recovery; no anula decisiones ni PASS históricos.

## Resultado material nuevo: lote DEV de 37 fusiones

- **Control commit:** `2b23686be39958cee0983b131ae7f56c8c0f430a`, padre `62c50c4770f0e29bd289e4f31dcf60b8e80b3b73`, dos archivos exclusivos: ejecutor DEV de cohorte y ampliación de su workflow existente. No se modificaron archivos de producto ni infraestructura.
- **RUN:** <https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42063057316> — `success`.
- **Artefacto:** GitHub Actions `13434525370`, digest SHA256 `fed08e9024d90a58caa37b3dd57cfe8297410e585f923586c0f96d5ed64280fb`.
- **Decisión exacta:** `PASS_VERIFIED_DEV_BATCH_WITH_FOCAL_HOLDS`; 139/139 pares identificados, 97/97 nombres externos comprobados, 83/83 grupos censados, HR revisión `cdc40258e9806b5d0ff1e09dd19b19743b76ee3dd22ac7f849fac538c3340dac` (238 shoppers, 792 visitas; período derivado `cinepolis-2026-11`).
- **37/37 nuevos grupos intentados y fusionados:** 26 GT y 11 HN; 70 alias/identificadores técnicos consolidados con preservación de variantes de nombres, contactos, direcciones y usuario en perfiles de origen; 201 documentos de visitas, 184 liquidaciones y 44 registros de certificación retargeted por el proveedor.
- **Seguridad y conservación:** 37 ACK provider + 74 replays idempotentes con cero escrituras; membresía/cuenta keeper, login/email, crosswalk, links, receipts, campos originales y montos históricos comprobados tras cada comando. Cero escritura directa Auth/Firestore/HR y cero deploy.
- **32/83 anteriores** siguen verificados y no se repitió su adjudicación. **69/83** es el total de grupos cerrados de la cohorte; **14/83** permanecen pendientes. Stiven de RUN2182 es adicional a esos 83.

### Los 37 nuevos casos cerrados (códigos privados; nombres en el censo de Biblioteca)

`F-002`, `F-005`, `F-009`, `F-010`, `F-014`, `F-018`, `F-023`, `F-029`, `F-038`, `F-041`, `F-043`, `F-045`, `F-049`, `F-052`, `F-053`, `F-054`, `F-058`, `F-060`, `F-065`, `F-066`, `R-001`, `R-003`, `R-015`, `R-024`, `R-031`, `R-033`, `R-038`, `R-040`, `R-043`, `R-048`, `R-050`, `R-051`, `R-053`, `R-057`, `R-059`, `R-067`, `R-072`.

### Los 14 pendientes reales (sin convertir la ausencia de homónimos en licencia para perder acceso/visitas)

- **11 grupos de múltiples canónicos de la HR externa:** `F-015`, `F-017`, `F-024`, `F-032`, `F-034`, `F-061`, `R-009`, `R-027`, `R-045`, `R-055`, `R-064`. Requieren probar continuidad de ambos source IDs con un solo crosswalk antes de seleccionar el canónico y trasladar visitas/finanzas, sin modificar ni reimportar HR.
- **2 cuentas secundarias con ingreso reciente:** `F-055`, `F-064`. Preservar la cuenta/usuario que realmente debe seguir autenticando sin retirar silenciosamente acceso reciente.
- **1 keeper sin prueba suficiente de credencial:** `R-018`. Demostrar principal activo/contraseña antes de adjudicar; no confundir mismo nombre con acceso confirmado.
- La confirmación humana de Paula para los 139 pares ya existe; **no pedir 14 nuevas autorizaciones de identidad**. Solo elevar una pregunta si el sistema no puede demostrar de forma autónoma qué credencial permanece.

## Certificación de 21 módulos

La matriz actual es `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261105-V245.json`, sucesora completa y acumulativa de V244 conservada como evidencia histórica; no se degradó ningún PASS:

- **5 MATCH exactos:** historical, identity-membership-roll-forward, phase-a-supporting-core, reports-admin-shopper, tenant-admin-config-branding.
- **3 TRUE_FUNCTIONAL_DEFECT históricos pendientes de cierre total:** canonical-hr-state-adapters, certifications, finance-core-liquidation-costs.
- **1 COMPOSED_NOT_DEPLOYED:** persistence-command-ack-boundary.
- **12 parcialmente probados**, requeridos hasta E2E de rol, aceptación u otra cláusula faltante. La fusión de 37 casos es un PASS de identidad y conservación, **no promociona por sí sola los 16 módulos no MATCH**.
- **Stiven:** RUN2182 Admin/Shopper 10/10 y 56 rutas/44 clics PASS; RUN2183 acceso con contraseña/reingreso PASS, barrido posterior sufrió timeout. La cadena `Stiven 10 vs 0` en el `actionRequired` de V244 es **histórica/superada**; V245 y el puntero operativo la sustituyen por la evidencia 10/10 sin alterar V244 sellada.
- **Pruebas source locales focales (05/11):** proveedor de shoppers `63/63 PASS`; proyecto/período `17/17`; documentos/PDF viewer `26/26`; historial GT/HN `3/3`; certificaciones de período `5/5`; Mis Visitas/pagos `4/4`; otras pruebas de roles, autorización, postulaciones, reportes y disponibilidad PASS. El test histórico `cxorbia-i3-hr-reconcile-identity-preflight.test.mjs` devolvió `7/10 PASS` por **tres expectativas antiguas de HOLD** frente al comportamiento posterior de autoconciliación compatible `provider_auto_compatible` (la nueva política tiene casos PASS en la batería de 63). Clasificar ese desajuste de contrato QA por source-owner antes de declarar producto regresado. Dos suites requieren dependencias/emulador no disponibles en esta ejecución local; no cuentan como FAIL de producto ni como PASS.

## Sincronización y siguiente acción exacta

La sincronización integral sigue **HOLD**, pero el registro de identidades ya tiene ACK real para 69/83 grupos. El cursor de continuidad ahora apunta a este V2, a la matriz V245 y al RUN 42063057316; RUN2172/estado Stiven 10/0 se conserva solo como historia.

1. **I3 identidad:** trabajar **los 14** por owner exacto, iniciando por los 11 múltiples canónicos mediante prueba de read model multi-HR y migración protegida (manteniendo HR externa intacta). Después resolver dos accesos recientes y una prueba de keeper; un solo carril y predicado reutilizable, sin preguntarle a Paula por cada nombre.
2. **Expedientes:** recargar Admin en DEV, recuento vivo por estatus real después de 37 ACK. El aviso histórico de 272 expedientes técnicos incluía casos/alias, no 272 personas ni 272 fusiones; resolver/bajar solo las revisiones realmente abiertas. Owner `app/core/router.js` + `app/modules/shoppers.js`, cambio únicamente si P0 funcional demostrado con TEST/DEV.
3. **Certificación:** ejecutar cláusulas faltantes contra exactamente el mismo artefacto DEV por rol Admin/Shopper/Cliente y GT/HN: cuestionario de 15 preguntas, versión/publicación/intentos, histórico financiero/liquidaciones, HR/cartera, postulación/asignación sin duplicados, performance y DOM/visual. Actualizar matriz sin resetear PASS históricos. Gate20/21 siguen HOLD hasta artefacto único inmutable.
4. **Producción I4:** no tocar `tya-plataforma.web.app` hasta I3 GO y autorización explícita.

**No se ejecutó:** nuevas ramas, overlay, reimport, cambio de producto, rollback, deploy a producción ni modificación de HR externa.
