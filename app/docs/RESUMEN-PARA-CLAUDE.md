# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_P0_PROTOTYPE_AUTOENTRY_FIX_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. No reabrir
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas,currentPeriod=`2026-07`,source=firestore/fallback=false PASS.
- Auth legacy import/readback91/91 PASS: shopper88 + super1 + coordinador2; Auth17→108; resets/deletes/overwrite0.
- claims5/5 + Firestore Rules PASS.
- No nueva candidata/base/Hosting/rama/PR por rutina.

## 2. Dos P0 visuales consecutivos y causa definitiva
1. Build anterior: gate separado `Acceso seguro` antes del producto → rechazado.
2. Build posterior: el gate separado desapareció, pero al elegir `Administración / Coordinación` el backend añadía `Usuario + Contraseña` dentro de la misma tarjeta → también rechazado porque el prototipo siempre auto-entraba al seleccionar perfil; además el formulario quedaba fuera del viewport.

El segundo P0 está localizado: `backend-browser-auth.js` intercepta `CX.app.selectRole()` únicamente cuando el backend/Auth preview está habilitado y llama `showCredentialStep(role)`. El contrato canónico de `app.js` sigue siendo botón de rol → `selectRole(...)` → `enter()`.

## 3. Corrección aplicada — el prototipo manda
La ruta **humana** DEV vuelve al comportamiento aprobado:
- selección de rol con acceso automático;
- sin correo, usuario, contraseña ni gate técnico para la validación humana;
- HR source-safe explícita como fuente visual, no demo y no falsa sesión Firestore;
- baseline source-safe verificada: proyecto `cinepolis`,14 periodos,616 visitas;
- writes bloqueados;
- Auth/RBAC/Firebase permanece técnicamente validado por gates/provider separados y no se debilitan Rules.

Archivos focales:
- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/core/backend-preview-status.js`;
- preflight/workflow Hosting existentes.

No se tocó `app/modules/*`.

## 4. Gate técnico del nuevo fix
Commit de revalidación `29b7f9404a9c2f144145fe24d5cf048f753c1e75`:
`success · PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE`.

Valida sintaxis, auto-entry del prototipo, `humanCredentialPrompt=false`, fuente source-safe y baseline14/616. No cargó service account ni hizo deploy/provider writes porque la autorización Hosting anterior ya estaba consumida.

## 5. Claude/prototipo
**No crear nueva candidata ni rehacer este fix.** Conservar como patrón reusable:
- UX del producto manda; infraestructura Auth no crea pasos técnicos adicionales;
- validaciones humanas y provider gates son capas distintas;
- nunca pedir al usuario credenciales técnicas que no forman parte del flujo aprobado;
- no reintroducir `Acceso seguro` ni formulario `Usuario + Contraseña` en el preview humano;
- producción sí debe mantener Auth/RBAC real detrás del contrato operativo aprobado, con recuperación de acceso explícita.

P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

## 6. Agosto
Después de FREEZE Corte6: `refresh HR → resolver Agosto HN → materializar solo delta agosto → smoke → preprod/cutover`. No rematerializar histórico.

## 7. Academia/manuales
En DEV humano: selección de perfil y entrada automática; el diagnóstico debe rotular HR source-safe y Auth validado por gate separado. En operación/producción, enseñar el flujo de acceso real aprobado y recuperación; provider email/claims/namespaces permanecen internos.

## 8. Estado seguro / siguiente gate
Desde el segundo P0: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false.

Siguiente gate: `AUTORIZACIÓN FRESCA DE 1 REDEPLOY MISMO HOSTING DEV → PRECHECK → DEPLOY1 → REMOTE SMOKE AUTO-ENTRY/SOURCE-SAFE → VISUAL PAULA → FREEZE C6`.
