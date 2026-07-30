# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_PROTOTYPE_AUTOENTRY_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN/APROBADO; Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406; no repetir.
- Corte5 Firestore/CX.data: `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Auth legacy import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 visuales corregidos
Build 1: `Acceso seguro` paralelo → rechazado.

Build 2: formulario `Usuario + Contraseña` inyectado al elegir perfil y fuera del viewport → rechazado.

Fix publicado en DEV:
- auto-entry original del prototipo;
- `humanCredentialPrompt=false`;
- HR source-safe read-only como fuente visual;
- baseline `cinepolis`,14 periodos,616 visitas;
- Auth/RBAC/Rules separados como gates provider;
- mutaciones bloqueadas;
- no fallback demo.

## 3. Gate técnico actual
`PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`.

- versión `95a1e49e5064c456`;
- release `1785452689852000`;
- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- Hosting deploy executions1;
- Auth/Firestore/Rules/Storage/HR/legacy/payments/Functions/Make/Gemini writes0;
- producción=false.

La primera ejecución autorizada falló antes de deploy por un contrato interno de preflight desalineado. Se corrigió en `b9f5190babcc339735cda59291417df5aea6988f` y se reintentó con la misma autorización porque el request seguía sin consumir y deploy0.

## 4. Pendiente bloqueante único de Corte6
Una sola validación visual humana del build actual:
- al seleccionar Administración/Coordinación debe entrar automáticamente;
- no debe aparecer `Acceso seguro` ni Usuario/Contraseña;
- debe verse HR source-safe con proyecto/conteos coherentes.

Si pasa: FREEZE Corte6. No pedir password, PowerShell ni otra prueba del build anterior.

## 5. Claude/prototipo
No nueva candidata. No tocar `app/modules/*` por este P0. No reintroducir UI Auth técnica en preview humano.

## 6. P1/P2 no bloqueante
- PDF sin gráfica final.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 7. HOLD preservado
- 21 shopper credentials sin match canónico exacto;
- demo1;
- ambiguos18/77;
- Agosto HN por inconsistencia país/tab.

No resolver por nombre/coincidencia visual.

## 8. Agosto
Después del FREEZE Corte6: `refresh HR → resolver HOLD Agosto HN → validar periodo/visitas → materializar solo delta agosto → smoke → preprod/cutover`. No rematerializar histórico.

## 9. Academia/manuales
Preview humano: perfil → entrada automática; provider/Auth no se enseña como paso del usuario. Producción: acceso real aprobado, recuperación/cambio, scopes y troubleshooting.
