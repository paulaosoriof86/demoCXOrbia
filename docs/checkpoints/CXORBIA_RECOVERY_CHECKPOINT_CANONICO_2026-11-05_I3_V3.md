# CXOrbia Recovery — checkpoint canónico I3 V3, readback Admin y censo privado

**Fecha:** 2026-11-05 (Guatemala). **Iteración:** I3. **Estado:** HOLD.  
**Sucesor aditivo:** [I3 V2](CXORBIA_RECOVERY_CHECKPOINT_CANONICO_2026-11-05_I3_V2.md), que conserva inalterados RUN42063057316, 37 fusiones nuevas, 69/83 verificadas, 14 pendientes, HR externa y 5/21 MATCH.  
**Producción:** `DO_NOT_TOUCH`; `authorizationI4=false`. Producto DEV `09eed4f012f9ad04e49d53569aabd86bd4c832a9`, Hosting `3b675f7bcc8b07e6`, runtime `cxorbia-live-hr-dev-00347-jmn` sin nuevos despliegues.

## Comprobación adicional en Chrome autenticado

1. En pestaña existente de Chrome, sesión Administración, proyecto Cinépolis, periodo `NOV 2026`, el indicador Shoppers antes de refrescar mostraba **272 expedientes técnicos de revisión de identidad**.
2. Una recarga explícita mostró primero `Cargando tu sesión`, luego `Sincronizando operación` y `Validando fuente operacional`; tras completar la hidratación apareció **206 expedientes técnicos** en el rail. **Diferencia real en pantalla: -66**; no equivale a 66 personas ni a los 14 grupos pendientes del censo.
3. Página Shoppers tras refrescar: **209 perfiles en este proyecto**, **95 activos** (6 meses), **114 inactivos**, **0 referencias protegidas**, **1 perfil completo**, **208 incompletos** y **19 perfiles visibles con revisión**. El aviso de 206 agrupa expedientes técnicos/alias en la cola de proveedor; el 19 identifica filas visibles marcadas en la UI, y 14 son grupos HOLD de la cohorte aprobada. No sumar ni equiparar los tres universos.
4. Inspección focal read-only de la ficha visible `Ramses Salinas` (cohorte aprobada `F-045` previamente MERGED_VERIFIED): mantiene **4 visitas**, pero marca `Revisar identidad`. El modal ofrece motivo `SHOPPER_HR_NORM_NAME_PHONE_CANDIDATES_REVIEW_REQUIRED`. **No se adjudica automáticamente que sea la misma revisión resuelta**: confirmar `reviewId` y lista de IDs contra ACK del proveedor antes de cerrar alerta o marcar defecto. Se cerraron los modales sin enviar ninguna decisión.
5. Resultado UI: **PASS de actualización del contador tras hidratación y de navegación Admin**, **HOLD de conciliación semántica de expedientes**; esta observación no promueve un módulo entero de los 21 ni certifica financieramente los 209 perfiles.

## Censo privado actualizado y verificado

- V2 de la hoja privada: `CXORBIA_I3_IDENTIDADES_83_GRUPOS_CENSO_PRIVADO_2026-11-05_V2_69_CERRADOS.xlsx`.
- Biblioteca: <https://chatgpt.com/library?file_id=libfile_ed0533ff08b48191b4e2b809fb70d6db&account_id=personal>.
- Reconstruido mecánicamente desde los 83 códigos exactos de la fuente privada anterior y `result.json` de RUN42063057316; validación **83/83** y partición **32 anteriores + 37 nuevas + 14 HOLD**; pestañas `Fusionados 69`, `Pendientes 14`, `Cohorte 83`, `Evidencia RUN` y control ejecutivo. Original privado preservado inmutable.

## Siguiente acción exacta (sin nuevo permiso por identidad)

1. Resolver por owner de proveedor los **11** HOLD `MULTIPLE_HR_CANONICAL`: cruzar `sourceShopperId`, keeper y todas las visitas/finanzas con la autoridad HR externa, aceptar únicamente conservación demostrada. Seguir con **2** `SECONDARY_RECENT_SIGNIN` y **1** `KEEPER_PASSWORD_PROOF_NOT_UNIQUE` sin desactivar acceso real no probado.
2. Conciliar los **206 expedientes técnicos** con provider ACK/resolutions y versiones vivas, separando flags que correspondan a las 37 fusiones, alias residuales, otras fuentes/no cohortes y verdaderos casos nuevos. Si hay badge obsoleto, clasificar `MAPPING_FAILURE` o `FUNCTIONAL_DEFECT` con owner exacto `app/core/router.js` / `app/modules/shoppers.js`; corregir solo el P0 demostrado y revalidar no ocultar alertas genuinas.
3. Completar el contrato E2E de los **16 módulos no MATCH** en misma fuente/artefacto DEV (Admin/Shopper/Cliente, GT/HN, cuestionarios, HR, asignaciones, finanzas e histórico), sin degradar los 5 MATCH. Gate20 y Gate21 siguen HOLD.
4. I4 sustitución productiva solo tras I3 GO, artefacto inmutable y autorización explícita.

**Sin cambios:** producción, HR externa, autenticación/contraseñas, permisos, archivos del producto, candidata, hosting o runtime. Esta V3 es un checkpoint de evidencia, no un cambio de metodología ni release.
