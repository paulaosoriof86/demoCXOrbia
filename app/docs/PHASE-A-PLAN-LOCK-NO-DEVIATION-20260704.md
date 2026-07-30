# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `P0_C6_CREDENTIAL_CONTINUITY_ROOT_CAUSE_FIXED__NAMESPACED_DRYRUN91_PASS__WAITING_COMBINED_AUTHORIZATION__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura vinculante:
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final;
- `cxorbia-backend-dev` = backend DEV canónico;
- Hosting DEV existente = `cxorbia-backend-dev.web.app`, target `cxorbia-dev`;
- proyecto padre `cinepolis`; meses = periodos;
- sandbox C4 = no destino;
- no crear otro Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`.

Para candidatas frontend continúa `EXECUTION_LANE_READY → AUDITORÍA → GO/P0 → APPLY_DELTA_DIRECTLY`.

## 3. Cortes protegidos — no reabrir
- Corte 1 / 2A: FROZEN/APROBADO.
- Corte 3: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- HR histórico canónico: 14 periodos /616 visitas hasta julio 2026.
- R17N FINAL DEV: 1,406/1,406 data writes y readback; mismatch0.
- Corte 5 `CX.data`: project=`cinepolis`, periods14, visits616, currentPeriod=`2026-07`, source=firestore, fallback=false PASS.
- No repetir históricos ni reabrir snapshots superados.

## 4. Fuente/identidad materializada
- HR hasta julio:208/208 refs shopper listas →194 perfiles canónicos únicos.
- Legacy shoppers:120 profile creates materializados;22 updates HOLD;7 legacy HOLD.
- Certificaciones:77 materializadas +1 HOLD.
- 616 visitas,572 controles de liquidación.
- Agosto HN HOLD por inconsistencia país/tab.

## 5. Corte 6 — Auth/RBAC/Rules
Bloque técnico previo ya ejecutado y preservado:
- 5/5 claim updates autorizados sobre cuentas técnicas existentes;
- Rules canónicas desplegadas/readback PASS;
- Firestore data writes0;
- readiness previo operador7/cliente2/shopper3.

El selector visual de rol nunca reemplaza Firebase Auth como autoridad.

## 6. Hosting DEV previo
Se reutilizó el mismo site `cxorbia-backend-dev`/target `cxorbia-dev`.
- nuevo Firebase0;
- nuevo Hosting0;
- deploy previo1/1 consumido;
- release/version FINALIZED;
- entrypoint explícito remoto PASS.

La autorización anterior está consumida y no cubre un nuevo deploy.

## 7. P0 Corte 6 — continuidad de credenciales
### P0 demostrado
La visual DEV presentó `Correo + Contraseña`, aunque el producto TyA opera con `Usuario + Contraseña`. Firebase Auth real sí es necesario; correo visible obligatorio no.

### Causa raíz completa
1. Credenciales legacy no habían sido materializadas en Auth canónico.
2. El primer inventario offline trataba username como llave global y podía colisionar staff con shopper.
3. El browser adapter también necesitaba namespace para resolver el mismo username de perfiles diferentes.

### Corrección
- namespaces `staff` / `shopper`;
- visible: `Tipo de acceso + Usuario + Contraseña`;
- provider: email sintético determinístico interno por `tenant+namespace+username`;
- no exponer email técnico;
- no guardar password/token/UID;
- claims verifican role/namespace/tenant/project y shopperId exacto.

No crear Gmail nuevo como workaround.

## 8. Credential handoff legacy — source-safe
El export legacy se procesa localmente y no se conecta la base anterior al runtime nuevo.

Inventario v3:
- shopper source282;
- safe shopper credential groups109;
- exact duplicate records collapsed93 solo con username normalizado + legacyId + mismo hash;
- ambiguous groups18 /records77 HOLD;
- missing password2 /missing login1 HOLD;
- staff4: superadmin1/coordinador2/demo1;
- encrypted bundle113;
- PII/login/password/hash legibles en repo/evidencia0.

## 9. Dry-run provider read-only — PASS
`READY_FOR_EXACT_AUTH_IMPORT_AUTHORIZATION`.

- input113;
- elegibles91 = shopper88 + super1 + coordinador2;
- shopper exact legacy match88;
- 21 shoppers sin perfil canónico exacto por `legacyShopperId`: HOLD;
- demo staff: HOLD;
- UID collision0;
- internal-email collision0;
- hash contract SHA256 rounds1;
- `FAIL_CLOSED_NO_OVERWRITE`;
- provider/Auth/Firestore/Rules/Hosting writes0.

El dry-run inicial de 12 queda superseded por la corrección de namespaces y no debe ejecutarse.

## 10. Próximo write exacto — requiere autorización
### 10.1 Auth import
Importar máximo91 identidades legacy elegibles a Firebase Auth DEV:
- 88 shopper;
- 1 super;
- 2 coordinador.

Reglas:
- conservar contraseña existente mediante hash import;
- password reset0;
- deletes0;
- overwrite0;
- claims exactos;
- readback obligatorio91/91;
- Auth total esperado17→108;
- cualquier drift/collision/fallo parcial = HOLD.

### 10.2 Hosting DEV condicionado
Solo después de `PASS_EXACT_AUTH_IMPORT_READBACK`:
- un único redeploy adicional al mismo site/target existentes;
- publicar browser adapter namespaced `Usuario + Contraseña`;
- remote verify de browser-auth, entrypoint y proof;
- nuevo Firebase/Hosting0;
- Firestore data/Rules/Storage/HR/legacy writes0.

Ambos requests están `enabled=false` y pasaron sus gates estáticos/no-write.

## 11. Gate actual
`AUTORIZACIÓN COMBINADA EXACTA → AUTH IMPORT MÁX91 → READBACK → SI PASS, UN REDEPLOY ADICIONAL MISMO HOSTING DEV → REMOTE VERIFY → VISUAL CON CREDENCIALES TYA EXISTENTES → FREEZE CORTE6`.

No pedir credenciales técnicas DEV. No compartir passwords en conversación.

## 12. Después de FREEZE Corte 6
Prioridad inmediata por meta de producción:
`REFRESH HR → RESOLVER AGOSTO HN → VALIDAR PERIODO/VISITAS → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.

No repetir los 1,406 writes históricos.

## 13. Corte 7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, cuestionario configurable y evidencias protegidas. Make/Gemini solo con gate y revisión humana. No debe retrasar cutover si la parte no activada no bloquea la operación Phase A autorizada.

## 14. Corte 8 — preproducción/cutover
Requiere cortes previos congelados, refresh delta final, rollback, smoke integral y autorización específica de producción. Cutover sobre el mismo Hosting/URL público `tya-plataforma`; no cambiar URL.

## 15. Claude/prototipo
- No nueva candidata.
- No tocar `app/modules/*` desde backend.
- La UX de login debe ser genérica y configurable; no exponer provider/email técnico.
- Solo tarea focalizada si aparece P0 frontend reproducible.
- P1/P2 no bloqueantes se preservan: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

## 16. Academia
Actualizar manuales/cursos/rutas con: Auth real detrás del acceso, namespace de perfil, usuario ≠ email obligatorio, recuperación/cambio, scopes tenant/proyecto/rol, shopperId exacto, dedupe seguro, import/readback y fail-closed.

## 17. Estado seguro
R17N:1,406 Firestore writes ya cerrados. Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1. Bloque credential-continuity actual: Auth imports0; password resets0; deletes0; Hosting adicional0; Firestore data0; Rules0; Storage/HR/legacy/payments/Make/Gemini0; merge=false; producción=false; PII/credenciales crudas repo/artifacts0.
