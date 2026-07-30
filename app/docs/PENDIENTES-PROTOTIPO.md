# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `C6_P0_PROTOTYPE_AUTOENTRY_FIX_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN/APROBADO; Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL:1,406/1,406; no repetir.
- Corte5 Firestore/CX.data: `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Auth legacy import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.
- No nueva candidata/base/Hosting/rama/PR.

## 2. P0 visual actual — build publicado NO aprobado
La última captura humana demuestra que el build publicado todavía altera el prototipo: al elegir `Administración / Coordinación` agrega un formulario `Usuario + Contraseña` que antes no existía y que además queda parcialmente fuera del viewport.

No pedir a Paula que use esas credenciales, haga scroll, comparta password ni vuelva a probar ese build.

Causa localizada:
- `app.js` conserva el auto-entry de perfil;
- `backend-browser-auth.js` intercepta `selectRole()` cuando Auth preview está habilitado y muestra el credential step.

## 3. Fix ya aplicado en rama
Para la **validación humana DEV**:
- restaurado el auto-entry original al seleccionar perfil;
- `humanCredentialPrompt=false`;
- provider/Auth no participa en la UI humana;
- HR source-safe se conserva explícitamente como dataset visual;
- baseline verificada: `cinepolis`,14 periodos,616 visitas;
- todas las mutaciones siguen bloqueadas;
- diagnóstico rotula `HR source-safe · validación visual` y `Auth validado por gate separado`.

Auth/RBAC/Rules no se eliminan ni se debilitan: permanecen como gates técnicos separados para el backend real.

## 4. Gate técnico PASS sin deploy
`29b7f9404a9c2f144145fe24d5cf048f753c1e75` → `success · PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE`.

La autorización de Hosting previa está consumida; por eso el Hosting público DEV sigue mostrando el build rechazado hasta nueva autorización expresa.

## 5. Claude/prototipo
No nueva candidata. No tocar `app/modules/*` por este P0. Patrón reusable:
- no transformar Auth/backend en UI adicional;
- conservar el comportamiento aprobado del prototipo;
- separar test humano de UX y gate provider;
- producción mantiene Auth real detrás del flujo operativo y recuperación de acceso.

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
Después del FREEZE Corte6: refresh HR → resolver HOLD Agosto HN → validar periodo/visitas → materializar solo delta agosto. No rematerializar histórico.

## 9. Academia/manuales
DEV humano: perfil → entrada automática; proveedor/Auth no se enseña como paso de usuario. Producción: acceso real aprobado, recuperación/cambio, scopes y troubleshooting sin exponer provider técnico.

## 10. Estado seguro / pendiente bloqueante único
Desde este P0: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false.

Pendiente único: `AUTORIZAR 1 REDEPLOY FOCAL DEL MISMO HOSTING DEV → REMOTE SMOKE → VISUAL → FREEZE C6`.
