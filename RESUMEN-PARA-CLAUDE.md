# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__88_USERNAME_DELTA_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL 1,406/1,406: no repetir.
- Corte5 `CX.data`: cinepolis,14 periodos,616 visitas,current2026-07 PASS.
- Auth import/readback91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- PR#7 draft/open/no merge; producción `tya-plataforma` no tocada.

## 2. P0 visual sigue abierto
La visual humana demostró:
- Shopper entraba con `shopperId=null`;
- Admin estaba sobre `display_name_only`, no sobre perfil protegido;
- username/teléfono/email/otros campos no estaban disponibles en esa ruta;
- histórico/KPI subcontaban estados canónicos.

No congelar Corte6 todavía.

## 3. Read-only real ejecutado — PASS
Evidencia `CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`:
- Firestore shoppers:340;
- nombre visible:313;
- phone:123;
- email:39;
- username/login:0;
- documento:0;
- banco/pago:0;
- certificación embebida:0.

Auth:
- usuarios108;
- rol shopper92;
- claims shopper con shopperId91;
- perfiles existentes para esos claims91/91;
- missing profile0.

Visitas:
- 616/616 con shopperId;
- 194 IDs shopper distintos;
- perfiles existentes194/194;
- estados: submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

Conclusión: identidad/histórico canónico sí están resolubles. El principal problema visual era el carril de datos + semántica KPI, no ausencia de las 616 visitas.

## 4. Runtime fix preparado — sin deploy
Cambios focales de integración, no rediseño de módulos:
- `app/core/backend-config-preview-dev.js`: el token protected ya no es degradado por `forceHumanVisualSourceSafe()`;
- `app/adapters/tya-live-source-refresh-watch.js`: source-safe watcher no sobrescribe `CX.data` en protected runtime;
- `app/core/backend-protected-dev-mode.js`: aliases de campos reales y `shopperStats/visitsForShopper` canónicos en protected lane; reconoce `submitida`; nunca sintetiza password.

Gate GitHub read-only ejecutó `node --check` y marcadores anti-regresión: PASS.

## 5. Username exacto — dry-run PASS
El mismo bundle cifrado usado para Auth fue descifrado solo en memoria.

Resultado:
- bundle shopper109;
- match exacto `legacyShopperId`88;
- binding Auth claim→perfil exacto88/88;
- username Firestore actualmente0;
- delta `fill-missing-only` username exacto: **88**;
- conflictos0;
- 21 sin perfil exacto continúan HOLD.

No hubo write. Para materializar los 88 hace falta autorización Firestore específica.

## 6. Password
Firebase Auth no devuelve password actual. El handoff conserva hashes, no plaintext recuperable.

No guardar password en JS/repo/Firestore. Claude no debe mostrar un password inventado. La ficha debe mostrar username + estado de credencial; contraseña inicial solo si existe prueba segura de que coincide, o reset controlado bajo gate Auth.

## 7. Datos adicionales del shopper
Teléfono/email ya existentes en Firestore deben aparecer al usar protected runtime.

Campos de la plataforma vigente que hoy no están materializados (por ejemplo documento/banco si existen en el export real) se recuperan por export/import cifrado y exact matching. Nunca conectar la base vieja ni deduplicar por nombre/teléfono.

## 8. Histórico/KPI — regla para Claude
No rediseñar `app/modules/shoppers.js`.

El backend protegido ya prepara semántica completa. Si después del siguiente deploy la UI todavía no refleja el dato:
- conservar tarjetas/KPI/drill actuales;
- usar facetas/estados canónicos;
- `submitida` cuenta como ejecución histórica realizada;
- historial = todas las visitas por `shopperId`, no solo periodo visual ni nombre.

## 9. Siguiente bloque
`PREPARAR DELTA FIRESTORE USERNAME88 SIN EJECUTAR + RECONCILIACIÓN SEGURA DE PERFIL EXTRA DESDE EXPORT → AUTORIZACIÓN FIRESTORE/AUTH SOLO SI APLICA → REDEPLOY HOSTING DEV NUEVO → VISUAL PROTEGIDA → FREEZE C6`.

No avanzar a agosto mientras P0 siga abierto.
