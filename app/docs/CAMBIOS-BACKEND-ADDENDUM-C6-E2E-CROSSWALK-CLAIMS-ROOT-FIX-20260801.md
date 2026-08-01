# CAMBIOS-BACKEND — Corte 6 · root fix E2E de claims Shopper y crosswalk canónico

**Fecha:** 2026-08-01  
**Estado:** `C6_E2E_CROSSWALK_CLAIMS_ROOT_FIX_APPLIED__QA_METRIC_CONFLATION_REMOVED__PENDING_REAL_USERS_GATE__NO_PRODUCTION`

## 1. Bloque exacto
Se continúa únicamente en la rama viva `docs-tya-v6-v71-audit`, PR #7, mediante aplicación directa. No se creó rama, PR, candidata, proyecto Firebase, Hosting, workflow ni metodología nuevos.

Objetivo inmediato: cerrar el gate real de un usuario staff y un usuario shopper antes de cualquier nuevo deploy, conservando acumulativamente Dashboard, hoja de ruta, estados, histórico, identidad, Finanzas, Reportes y Reservas.

## 2. Fallo original reproducido
El gate privado real encontró:

`HOLD_SHOPPER_R109_U88_C0_D0_H0_S0`

Interpretación source-safe:
- 109 registros de credenciales Shopper evaluados;
- 88 usuarios Auth existentes encontrados;
- 0 claims aceptados como objetivo canónico por el selector anterior;
- el proceso se detuvo antes de seleccionar perfil, probar hash o iniciar sesión;
- deploy omitido;
- autorización no consumida;
- cero writes y producción intacta.

## 3. Causa raíz original
Los claims Auth existentes conservan el `shopperId` operacional/planificado usado durante la importación. La evidencia de identidad vigente resuelve ese ID hacia el documento Shopper canónico mediante `VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json`.

El selector E2E anterior solo aceptaba el claim cuando `claim.shopperId` ya era directamente un `canonicalShopperId`. Por tanto ignoraba el empalme técnico exacto `plannedShopperId → canonicalShopperId`, aunque ese mismo empalme es el contrato aprobado que utiliza el read model para unificar identidad e histórico.

No era correcto cambiar claims, crear usuarios ni reescribir perfiles para satisfacer la prueba. El gate debía consumir el mismo crosswalk canónico de la plataforma.

## 4. Archivo principal modificado
### `tools/qa/cxorbia-c6-existing-users-e2e-credentials-v2.mjs`

Corrección aplicada:
- construye `plannedShopperId → canonicalShopperId` solo para filas `REUSE_EXISTING_CANONICAL_SHOPPER`;
- conserva el `shopperId` real del claim para validar la sesión Auth;
- deriva separadamente el `canonicalShopperId` para perfil, histórico y conteo esperado de visitas;
- permite claims ya canónicos o claims planificados resueltos por crosswalk;
- no utiliza nombre, teléfono ni correo para identidad;
- no modifica Auth, claims, contraseñas, Firestore ni HR;
- no expone IDs, usuarios, contraseñas, hashes ni tokens en evidencia pública.

Validaciones fail-closed vigentes:
- toda fila resuelta debe tener `plannedShopperId`, `canonicalShopperId` y un peso de visitas válido;
- un mismo ID planificado no puede apuntar a dos destinos;
- `conflictRefs` debe ser 0;
- el número de referencias resueltas debe coincidir con el mapa;
- el conteo global source-reported `visitMatchesUniqueShopper` debe existir y ser mayor que cero;
- el shopper seleccionado debe resolver a un perfil canónico existente y tener al menos una visita mapeada.

## 5. Hallazgo del primer rerun y corrección metodológica
El rerun protegido falló antes del navegador con:

`VISIT_CROSSWALK_VISIT_TOTAL_MISMATCH`.

El deploy fue omitido, la autorización permaneció sin consumir y hubo cero writes. No fue una regresión de plataforma ni una inconsistencia demostrada de HR/Firestore: fue una aserción QA demasiado estricta que comparaba dos métricas con distinta semántica:
- suma de `hrVisitCount` agrupada por referencias resueltas;
- conteo global `visitMatchesUniqueShopper` reportado por la auditoría de cruces visita por visita.

Se eliminó únicamente esa igualdad inválida. Las dos métricas continúan registrándose por separado y no se fuerza una equivalencia no definida por el contrato. Se preservan todos los controles de conflicto, identidad exacta, perfil existente y visitas propias.

## 6. Archivos auxiliares normalizados
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs`: wrapper único hacia el selector v2 canónico;
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials-v3.mjs`: eliminado porque reconstruía el vínculo desde una colección paralela y podía divergir del crosswalk aprobado;
- `tools/qa/tya-c6-dev-users-real-e2e.mjs`: persistencia de código de fallo source-safe y comprobación separada de claim shopper y shopper canónico, sin exponer datos sensibles.

## 7. Validación previa y seguridad
- UTF-8 preservado;
- `/app/modules/*`: sin cambios;
- `/app/core/*`: sin cambios;
- proveedor/data writes: 0;
- producción/merge: false;
- los gates fallidos fueron fail-closed: deploy omitido y autorización no consumida.

La validación con usuarios reales solo puede ejecutarse en el gate protegido porque las credenciales, el envelope y la cuenta de servicio no se exportan ni se colocan en el entorno local.

## 8. Gate acumulativo vigente
Secuencia autorizada y fail-closed:

`SELECT EXISTING STAFF + SHOPPER VIA EXACT CROSSWALK → LOCAL REAL-USERS E2E → GOLDEN DOMAIN/FINANCE/SHOPPER/REPORTS GATES → PROVIDER READ-ONLY PREFLIGHT → 1x HOSTING DEV SOLO SI TODO PASS → REMOTE REAL-USERS E2E → HUMAN VISUAL ACUMULATIVA`.

El deploy queda después del E2E local. Un nuevo FAIL no consume la autorización ni modifica el proveedor.

## 9. Invariantes acumulativos protegidos
- HR viva: 14 periodos/616 visitas;
- julio: 44 total, GT 34, HN 10, realizadas 40, cuestionario 38, submitidas 33, fuera de rango accionable 1;
- identidad Shopper exacta y única;
- Dashboard, fases, detalle, histórico, portal y Finanzas consumen el mismo read model;
- Movimientos, Liquidaciones y Beneficios mantienen periodo y fuente canónicos;
- Reportes no pueden perder datos ni funciones ya aprobadas;
- tres refresh no pueden duplicar ni mover estado funcional;
- Reservas permanece fail-closed hasta fuente real;
- cero cambios frontend/core desde backend.

## 10. Clasificación
- **Reusable CXOrbia:** resolución de claims de origen a identidad canónica mediante crosswalk técnico auditable y fail-closed; no equiparar métricas agregadas sin contrato semántico.
- **Exclusivo TyA:** IDs y conteos de la evidencia actual TyA/Cinépolis.
- **Claude/prototipo:** el portal y los módulos deben consumir identidad canónica; no reimplementar dedupe ni mapping visual.
- **Academia:** diferenciar identidad de autenticación, identidad operacional e identidad canónica; diferenciar peso agregado por referencia de conteo global de visitas cruzadas.
- **Sin impacto Claude:** selección privada de credenciales y ejecución del workflow protegido.

## 11. Siguiente bloque exacto
`TRIGGER SAME AUTHORIZED REAL-USERS GATE → READ RESULT → DOCUMENT PASS/FAIL → SOLO PASS HABILITA HUMAN VISUAL/FREEZE C6`.

No se inicia agosto, postulaciones públicas, preproducción ni producción mientras Corte 6 no tenga PASS acumulativo y aprobación humana.
