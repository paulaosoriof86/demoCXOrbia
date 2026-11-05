# CXOrbia Recovery — checkpoint canónico I3 V4 · 83/83 identidades y recertificación reactivada

**Corte:** 2026-11-05, Guatemala. **Iteración I3:** `HOLD` para Phase A/producción. **Predecesor:** [V3](CXORBIA_RECOVERY_CHECKPOINT_CANONICO_2026-11-05_I3_V3.md), preservado inmutable junto a sus cifras históricas. **Producto fuente inmutable:** `09eed4f012f9ad04e49d53569aabd86bd4c832a9` / tree `e6f941c511272dfb0d258e935d7c1526c83b31cb`. **Producción:** `DO_NOT_TOUCH`, I4 no autorizada. Esta versión reemplaza V3 únicamente como *puntero de continuidad actual*, no borra recibos históricos.

## Cierre de la cohorte autorizada de identidad, con ACK y readback

**PASS `83/83`, quedan `0/83` grupos aprobados sin fusionar.** Ejecución real protegida DEV [RUN42080118914](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42080118914), artefacto **13439729089**, SHA-256 ZIP `7d407e9e4fc493793e247eee917406fd5b3d2d6d833d7816df5e6b37a947bda1`, decisión `PASS_VERIFIED_DEV_83_OF_83_APPROVED_GROUPS`.

- Cohorte previa: 69 grupos ya verificados; esta intervención: **14 fusiones nuevas, 14 ACK + 14 readbacks independientes**. 43 alias vinculados, 70 visitas, 33 liquidaciones, 17 conciliaciones de pagos y 4 certificaciones históricas conservadas/reasignadas. 335 escrituras por proveedor con ACK; 28 replays idempotentes sin escrituras repetidas.
- La revisión exacta de HR externa usada fue `cdc40258e9806b5d0ff1e09dd19b19743b76ee3dd22ac7f849fac538c3340dac` (238 shoppers, 792 visitas, periodo actual `cinepolis-2026-11`). `hrWrites=0`, `credentialResets=0`, `directAuthWrites=0`, `directFirestoreWrites=0`, `deployments=0`, producción sin cambios.
- Invariantes de cada grupo: un único membership canónico, cero memberships alias residuales, inicio de sesión conservado, variantes de perfil y crosswalk conservados, ninguna fila histórica afectada eliminada y montos preservados.

| Códigos aprobados | Identidad humana fusionada | País |
| --- | --- | --- |
| F-015, F-016 | Elsy Hernández / Elsy Nikole | GT |
| F-017, F-019 | Emanuel / Emmanuel Ruiz | GT |
| F-024, F-025, F-027, R-019 | Geovani / Geovanny / Giovanni Pineda | GT |
| F-032, F-033 | Jary José / Jary Rodas | GT |
| F-034, F-035, F-036, R-023 | Jenifer / Jennifer / Jennipher Murga | GT |
| F-055, R-063 | Fernando Cárcamo | HN |
| F-061, F-062, R-069 | Manuel Eguigure / Equigure | HN |
| F-064, R-070 | Rocío Vica / Vilca | HN |
| R-009, R-010, R-011, R-012 | Daniel García | GT |
| R-018 | Freddy Hernández | GT |
| R-027, R-028, R-029, R-030 | José Sarat | GT |
| R-045, R-046, R-047 | Patricia Ordóñez | GT |
| R-055, R-056 | Aldo Núñez | HN |
| R-064, R-065 | Freddy Hernández | HN |

**Aprobación nominal de Dirección, aún pendiente de materialización:** la cuenta correcta debe quedar **Jhennypher Murga** (todas las variantes asociadas); la otra **Rocío Vilca**, usuario/login **`rocio.vilca`**. Las fusiones actuales conservaron credenciales y los nombres provenientes de HR sin inventar ni regenerar contraseñas. Para materializar estas dos correcciones sin que la próxima sincronización las revierta, primero corresponde identificar y editar de forma acotada la **HR operacional verdadera** (ID configurado en entorno `CXORBIA_HR_LIVE_SHEET_ID`, en código solo existe alias enmascarado `1h307t...vU4`), y después ejecutar el flujo autorizado de readback de nombre/login en proveedor y Auth. El Drive conectado no exhibió esa HR multitab; el resultado titulado `HR Guatemala - Sincronizacion Google Sheets` corresponde a **otro ID/estructura** y no debe alterarse. Hasta comprobarlo, `NAME_LOGIN_CORRECTION=HOLD`, no confundir con `IDENTITY_FUSION=PASS`.

**Distinción de universos:** los 14 pendientes del censo **sí son cero**. Los **206 expedientes técnicos** y **19 perfiles con badge** son valores de una observación Admin anterior al RUN42080118914; no se vuelven cero por inferencia. Deben leerse de nuevo y conciliarse por ID/causa con la cola del proveedor; existe caso focal Ramses Salinas F-045 con fusión probada y badge de revisión independiente.

## Recertificación de ejecuciones que antes se omitían

1. Ajustados los 4 disparadores existentes para la fuente exacta `09eed4f…`; alineados 3 scripts QA con la fuente actual, sin desbloquear jobs de despliegue/mutación. La prueba de editor Admin selecciona ahora el **periodo del banco real** en lugar de asumir el mes activo de HR; no se modificó el producto.
2. Sobre control `f8ac7b744d8fbd65679d0e846e7950703c9b8037`, **4/4 workflows completados en PASS:**
   - D05 positivo QA/idempotencia: [RUN42081974057](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42081974057)
   - D05 publicación protegida negativa: [RUN42081974109](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42081974109)
   - VRM286 acceso Admin read-only DEV: [RUN42081974152](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42081974152)
   - D05 editor Admin real y rechazo 409 sin falso éxito: [RUN42081973891](https://github.com/paulaosoriof86/demoCXOrbia/actions/runs/42081973891)
3. Además, 29 suites fuente ejecutadas localmente con **287/287 PASS**; dos suites de reglas Firebase no ejecutables localmente por faltar emulador (clasificación `ENVIRONMENT_FAILURE`, no PASS ni defecto funcional demostrado). No promover un módulo completo solo por su prueba focal.
4. **Estado oficial de módulos: 5/21 `MATCH`, 16/21 aún no completamente certificados.** La matriz `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261105-V245.json` sigue siendo la clasificación por módulos; estos recibos la complementan como avances de cobertura, no adulteran el contador.

## Sincronización, regresiones y siguiente paso exacto

- **Sincronía de controles comprobada:** único repo y rama de Recovery, una sola fuente producto fijada, 4 workflows referidos a esa fuente, recibo de fusiones y HR revision rastreables. Se corrigen dos causas de **pruebas omitidas/falsos FAIL** (SHA fuente de QA obsoleto y elección implícita de mes), sin introducción de nuevos productos, ramas, overlays o despliegues. Este checkpoint V4 debe estar apuntado desde `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` y verificarse por readback en HEAD remoto.
- **Sincronía operacional completa: NO CERTIFICABLE aún.** Faltan correcciones canónicas de nombre/login aprobadas por Paula, conciliación real de expedientes/flags remanentes y 16 módulos con E2E por rol GT/HN + HR/finance + Gate20/21 y artefacto único. El 5/21 no refleja falta de trabajo, sino que no hay evidencia integral suficiente para subir el número honestamente.
- **Siguiente ejecución I3 (no requiere una nueva aprobación de fusión):** resolver fuente real HR y dos nombres/logins con ACK/readback; contrastar cola Admin y proveedor caso a caso sin limpiar alertas legítimas; ejecutar lote de pruebas E2E de módulos por owners exactos, actualizar matriz solo con pruebas completas; luego decidir I3 GO/HOLD. I4 solo con GO + artefacto inmutable + autorización explícita. No usar la pasada de 14 grupos como permiso para tocar otros expedientes no aprobados.

**Cambios de esta intervención:** solo controles/QA y fusiones mediante proveedor DEV; **no cambios** en HR, runtime, Hosting, código fuente del producto ni producción. No restaurar los conteos históricos 69/83 o 14 pendientes como si fueran el estado actual.
