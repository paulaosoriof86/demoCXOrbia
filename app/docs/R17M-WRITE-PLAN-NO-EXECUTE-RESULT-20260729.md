# R17M — Write plan exacto, NO ejecutar

Fecha: 2026-07-29

## Decisión
`PASS_R17M_WRITE_PLAN_NO_EXECUTE__LEGACY_SHOPPER_CERT_REFRESH_PENDING`

R16E quedó cerrado y se preparó el paquete de materialización exacto sin ejecutar provider writes.

## Estrategia de menor riesgo
Se conserva `cxorbia-backend-dev` como backend canónico. La topología canónica se prepara en paralelo a la topología DEV previa period-country, sin borrar esta última, para mantener rollback. `CX.data` solo cambiará al read-path canónico después de idempotencia y smoke.

No se crea otro Firebase.

## Fuente congelada
- R16E run `29282169628` / job `90741969389` SUCCESS;
- artifact `8743659430`;
- digest `sha256:290b2eb9f956bb8af422ffae8832aa617125d70eab244188f206bd682ad68584`;
- plan `r16d_f471a6b486f3a269b0dd`;
- plan SHA `a9fe01f72d84908ed0c1663dde6c25e1a45ae9b57454536cec949ab20f9cd7d3`;
- clasificación R16E: 1,414 create / 1 update / 0 noop / 0 record-review / 244 extras preservados.

## Grupos exactos R17M
1. `op_00001` tenant update — **HOLD**. Diferencias: `configurable`, `name`, `schemaVersion`. No sobreescribir tenant existente por rutina.
2. `op_00002` proyecto padre `cinepolis` create — candidato después de idempotencia.
3. `op_00003` HR import reference create — candidato después de idempotencia.
4. `op_00004..op_00017` 14 periodos — candidatos después de idempotencia.
5. `op_00018..op_00227` 210 shoppers — **HOLD** hasta refresh legacy y diff por llave estable contra 215 shoppers existentes / 236 referencias HR protegidas.
6. `op_00228..op_00843` 616 visitas — candidatos canonical-shadow HR-first, después de idempotencia; julio incluye 34 GT + 10 HN.
7. `op_00844..op_01415` 572 liquidaciones/control — candidatos después de idempotencia; `paymentControlOnly=true`, 0 pagos confirmados/inferidos.

Subtotal potencial previo a shoppers y tenant review: 1,204 creates = proyecto 1 + HR import 1 + periodos 14 + visitas 616 + liquidaciones 572. **No están autorizados todavía.**

## Preservación
- 29 project docs existentes: preservar;
- 215 shopper docs existentes: preservar;
- pilotos `julio-pilot`, `r1`, `tya-piloto`: preservar;
- `sprint5-visit-mutation-no-real-data`: HOLD_NO_DELETE;
- `hr-58fb469666080189`: HOLD_NO_DELETE.

## Fuente HOLD
`AGOSTO 26 HN`: 34 filas, todas País=GT aunque la pestaña es HN. No materializar ni sincronizar. No bloquea julio.

## Refresh legacy requerido antes de autorización final
Solo:
- shoppers nuevos o actualizados;
- certificaciones ya presentadas/aprobadas/reprobadas/pendientes;
- visitas NO se recuperan de legacy: fuente HR.

Prompt listo: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## Gate siguiente
1. refresh legacy shoppers/certificaciones;
2. diff por llave estable;
3. reconstruir plan con delta actualizado;
4. idempotencia/hash offline;
5. gate de binding `CX.data` a paths canónicos;
6. solicitar autorización únicamente para conteos/grupos exactos que sigan elegibles.

## Hosting final
Se verificó en el repo legacy `paulaosoriof86/cxorbia-tya-plataforma` que `.firebaserc` apunta al proyecto Firebase `tya-plataforma`. Ese es el proyecto del Hosting público a preservar en el cutover final; no se toca en R17M.

## Seguridad
- provider reads R17M: 0;
- Firestore/Auth/Storage/HR writes: 0;
- deletes/imports/deploys: 0;
- producción/merge: false;
- `executeAllowed=false`.

Evidencia: `app/docs/evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json`.
Validator reusable: `tools/reconciliation/tya-r17m-write-plan-no-execute-validate.mjs`.
