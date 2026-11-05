# CXOrbia I3 | Jhennypher Murga — censo previo a fusión residual

**Estado:** `HOLD_PREFLIGHT`, sin fusión residual ejecutada; producción `DO_NOT_TOUCH`.

La aprobación humana del grupo Murga y los 83/83 grupos anteriores permanece válida. No existe evidencia de homónimo según Dirección, pero se exige reconciliar todas las identidades existentes antes de desactivar cuentas.

- Preflight administrativo previo de solo lectura `RUN42098615560`: 9 perfiles Murga reportados en el inventario de nombres, 3 membresías Auth activas, 46 referencias entre visitas, liquidaciones, conciliaciones y certificaciones. HR operativa: una identidad de Jhennypher Murga; 15 celdas de nombre previamente corregidas sin cambiar campos adicionales.
- Primer intento protegido `RUN42100585614`: `EXACT_MURGA_GRAPH_COUNT_DRIFT` antes del comando; el filtro de nombres contemplaba variantes demasiado estrechas. `providerAck=false`, cero fusión.
- Segundo intento protegido `RUN42101033456`: un selector por token completo de apellido y país GT detectó 11 perfiles, no los 9 del preflight anterior, y bloqueó la ejecución antes del comando; `providerAck=false`, cero fusión, cero reintentos destructivos.
- No inferir todavía si el diferencial 9 vs 11 es cambio temporal de datos o diferencia de clasificación de perfiles. No ampliar el conjunto de alias ni desactivar Auth hasta nuevo censo por identificador estable, estado de crosswalk y revisión HR independiente.
- Siguiente acción exacta: disparar el readback protegido ya existente Admin/HR/Auth y keeper en el commit actual, conciliar 11 perfiles y 46 referencias por identidad canónica; solo después proponer una ejecución única, idempotente, con ACK y lectura posterior. Rocío Vilca permanece separada, conservando su sesión reciente.

El bloqueo es `MAPPING_FAILURE` antes de escritura, no una regresión del producto ni pérdida de datos. Los 5/21 módulos MATCH y los 83/83 grupos anteriores no se alteran.

## Readback independiente posterior — RUN42101372355

El workflow existente de Administración/HR/Auth terminó **PASS** sin escrituras. El artefacto `13448638306`, `cxorbia-i3-residual-keeper-preflight/result.json`, registró revisión HR `63ddfdf36e347db63b36e26e24a010d20a99c63f6e36c6542d25497bc2f6f9ba`:

- Murga GT: **11 perfiles**, 1 identidad HR, **0 IDs de perfiles que coincidan directamente con el ID HR** (`unmatchedProfileCount=11`), 3 cuentas Auth activas, keeper candidato `jennypher.murga`, referencias 12 conciliaciones + 7 certificaciones + 9 liquidaciones + 18 visitas = **46**.
- Rocío Vilca HN: 5 perfiles, 2 identidades HR, 3 cuentas Auth, 15 referencias, sesión secundaria reciente: `HOLD_RECENT_SECONDARY_SESSION`.
- El inventario alternativo de nombres sigue mostrando nueve coincidencias Murga, porque selecciona campos distintos de los utilizados por el preflight de identidad. No confundir esos nueve con el conjunto canónico de 11.

**Nueva precondición:** conciliar el ID HR con el perfil Firestore/keeper y crosswalk antes de invocar `identityAdjudicate`; no cambiar un literal de 9 a 11 ni ensanchar una fusión a ciegas. Estado de las dos fusiones residuales: **HOLD**, sin pérdida ni modificación de accesos, visitas o pagos.
