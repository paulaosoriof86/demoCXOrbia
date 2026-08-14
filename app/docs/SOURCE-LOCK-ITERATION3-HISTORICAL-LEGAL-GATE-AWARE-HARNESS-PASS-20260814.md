# SOURCE LOCK — ITERATION 3 HISTORICAL SHOPPER LEGAL-GATE-AWARE HARNESS PASS — 2026-08-14

**Estado:** `LOCKED__I3_HISTORICAL_AUTH_HISTORY_LEGAL_GATE_AWARE_HARNESS_PASS__PROVIDER_GATE_REQUIRED`

## Contexto exacto

Último provider run consumido: `31835742956`, job `94881540163`, sobre la misma candidata `docs-tya-v6-v71-audit` / PR #7.

El run pasó:

- checkout del SHA exacto autorizado;
- gate de Paula;
- source preflight / patch same-candidate;
- service account DEV privada;
- resolución del mismo único Shopper histórico exacto;
- un credential reset exacto autorizado;
- preservación de UID/claims/shopperId/profile/history y otras identidades `0`;
- reconciliación exacta de membership/crosswalk;
- arranque del proxy del source exacto.

El E2E histórico llegó a contexto Firebase Shopper autenticado y a `CX_PROTECTED_AUTH_HR_AUTHORITY.applied===true`, pero luego falló por timeout esperando `#nav-aprendizaje`. El checkpoint histórico no llegó a materializarse y Admin/new Shopper quedó SKIPPED.

## Causa de contrato del harness

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` exigía de forma incondicional que Academia y Certificación ya estuvieran visibles **antes** de cerrar el subgate de identidad + HR + historia.

El producto, en cambio, permite que `CX.app.enter()` difiera `CX.router.mount()` cuando `CX.confidencialidad.pending(CX.session.role)` está activo. Por tanto, una primera entrada con NDA/confidencialidad pendiente puede ser una sesión Auth/HR/historia válida y, al mismo tiempo, no tener todavía los nodos de navegación montados.

Ese desacople era una fuente de falso negativo del harness y podía volver a consumir una credencial histórica sin preservar el progreso.

## Corrección source-only aplicada

Archivo: `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`.

1. El gate exacto de Auth/tenant/project/shopperId, exact identity, reviewQueue, HR authority, sourceRef e historia se valida **antes** de cualquier expectativa de navegación.
2. El runner consulta el mismo contrato de producto `CX.confidencialidad.pending('shopper')` usado por `CX.app.enter()`.
3. Si el gate legal está pendiente:
   - exige que el contrato de confidencialidad exista;
   - exige que el diálogo legal sea realmente visible;
   - conserva el mismo principal autenticado;
   - marca el workspace como `legal-gate-pending`;
   - difiere Academia/Certificación sin declararlas PASS ni FAIL todavía.
4. Si el gate legal NO está pendiente, Academia y Certificación siguen siendo obligatorias y se validan igual que antes.
5. El runner **no acepta, firma, guarda ni automatiza el NDA**. `acceptanceAutomated=false` queda explícito.
6. No se usa `force:true`, no se debilita Auth y no se agrega ningún write API.

## Gate source

Validación source-only ejecutada sobre el archivo corregido:

- `node --check`: PASS;
- no `CX.app.selectRole()` en ejecución real: PASS;
- credenciales humanas reales + contexto Auth canónico: PASS;
- HR authority + exact identity + reviewQueue + history: PASS;
- rutas Academia/Certificación preservadas para workspace montado: PASS;
- conciencia del gate legal: PASS;
- cero automatización de consentimiento: PASS;
- cero APIs de provider write/deploy: PASS.

Marker: `PASS_I3_HISTORICAL_LEGAL_GATE_AWARE_SOURCE`.

## Seguridad

Este cierre fue exclusivamente source/docs. **No ejecutó otro reset ni ningún Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos write, deploy, merge o producción.**

La autorización del run `31835742956` permanece consumida/parked. No existe retry automático.

## Impacto

- **Reusable CXOrbia:** separa identidad/historia de un gate legal configurable sin saltarse dicho gate.
- **Exclusivo TyA:** el futuro reset, si se autoriza, sigue limitado al mismo Shopper histórico exacto TyA/Cinépolis.
- **Claude/prototipo:** no rediseñar login, NDA, Academia ni Certificación; la corrección es del harness de validación.
- **Academia:** no declarar rutas activas por esta corrección; si existe NDA pendiente, su validación queda diferida hasta aceptación humana legítima.
- **Sin impacto Claude:** no cambia diseño visual ni flujo funcional del producto.

## Estado productivo

I3 sigue sin cerrar: **GO-LIVE 35% completado / 65% pendiente**. No se otorgan puntos parciales.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.

Si Paula autoriza ese gate, debe permitir exactamente un nuevo reset del mismo UID histórico exacto, certificar inmediatamente identidad/HR/historia con el harness legal-gate-aware y congelar el checkpoint sanitizado antes de Admin/new Shopper. Cero aceptación legal automatizada, otras identidades, fuzzy matching, providers prohibidos, deploy, merge o producción.
