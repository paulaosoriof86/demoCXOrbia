# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_PROVEN_DOUBLE_LOGIN_FORCED_AUTH_GATE__AUTH91_PRESERVED__NO_NEW_DEPLOY__NO_PRODUCTION`

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
- HR histórico canónico:14 periodos/616 visitas hasta julio 2026.
- R17N FINAL DEV:1,406/1,406 data writes y readback; mismatch0.
- Corte 5 `CX.data`: project=`cinepolis`, periods14, visits616, currentPeriod=`2026-07`, source=firestore, fallback=false PASS.
- Auth legacy import:91/91 readback PASS.
- No repetir históricos ni reabrir snapshots superados.

## 4. Fuente/identidad materializada
- HR hasta julio:208/208 refs shopper listas →194 perfiles canónicos únicos.
- Legacy shoppers:120 profile creates materializados;22 updates HOLD;7 legacy HOLD.
- Certificaciones:77 materializadas +1 HOLD.
- 616 visitas,572 controles de liquidación.
- Agosto HN HOLD por inconsistencia país/tab.

## 5. Corte 6 — Auth/RBAC/Rules preservado
-5/5 claim updates autorizados sobre cuentas técnicas existentes;
- Rules canónicas desplegadas/readback PASS;
- Firestore data writes0;
- Auth legacy exacto91/readback91/91 PASS;
- password resets/deletes/overwrite0;
- namespaces `staff/shopper` preservados.

Firebase Auth sigue siendo la autoridad. El selector visual de rol nunca reemplaza Auth.

## 6. P0 actual — doble login introducido por el gate browser Auth
La validación visual humana demostró que el flujo desplegado no es aceptable.

Hecho:
- aparece una pantalla separada `Acceso seguro` con `Tipo de acceso + Usuario + Contraseña` antes del login normal;
- el gate fue introducido por `app/core/backend-browser-auth.js`;
- ese archivo intercepta `CX.app.showLogin()`, limpia sesión al cargar y fuerza overlay en preview;
- `backend-config-preview-dev.js` fuerza `interactive-session`;
- `backend-firebase.js` autentica antes de cargar datos;
- `app/app.js` conserva el login normal del producto.

Conclusión: la migración Auth91/91 es válida, pero la integración visual quedó desviada. **Firebase debía quedar detrás del adapter y no convertirse en un segundo login.**

El P0 queda documentado en `CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`.

## 7. Corrección obligatoria antes de FREEZE Corte6
`UN SOLO LOGIN VISIBLE`:
1. mantener Firebase Auth/claims como autoridad;
2. no mostrar un gate backend previo separado;
3. restaurar silenciosamente una sesión Firebase válida;
4. no limpiar sesión por rutina al cargar;
5. si se requieren credenciales, integrarlas en el mismo flujo normal del producto;
6. no exponer identificadores/provider internos;
7. logout invalida sesión; refresh normal no repite autenticación innecesaria;
8. errores de credencial vs scope/namespace deben diferenciarse de forma segura.

Paula no debe repetir la prueba del gate actual, compartir password ni ejecutar PowerShell.

## 8. Gate actual
`P0 FOCAL SINGLE-LOGIN → GATES LOCALES/ESTÁTICOS → AUTORIZACIÓN ÚNICA DE REDEPLOY DEV SOLO SI PASS → SMOKE REMOTO → VALIDACIÓN VISUAL → FREEZE CORTE6`.

No existe autorización vigente para otro Hosting deploy; la autorización previa ya fue consumida.

## 9. Después de FREEZE Corte6
Prioridad inmediata:
`REFRESH HR → RESOLVER AGOSTO HN → VALIDAR PERIODO/VISITAS → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.

No repetir los1,406 writes históricos.

## 10. Corte 7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, cuestionario configurable y evidencias protegidas. Make/Gemini solo con gate y revisión humana. No debe retrasar cutover si la parte no activada no bloquea Phase A.

## 11. Corte 8 — preproducción/cutover
Requiere cortes previos congelados, refresh delta final, rollback, smoke integral y autorización específica de producción. Cutover sobre el mismo Hosting/URL público `tya-plataforma`; no cambiar URL.

## 12. Claude/prototipo
- No nueva candidata general.
- No tocar módulos no relacionados.
- Existe ahora un P0 frontend reproducible y localizado: reconciliar el login normal con Auth real para eliminar el doble login.
- La UX debe ser genérica/configurable; provider/email técnico no visible.
- P1/P2 preservados: PDF/gráficas, Excel/formato, reportKit/exportaciones y copy de fuentes.

## 13. Academia
Actualizar manuales/cursos/rutas para enseñar un único acceso visible; Auth/provider detrás del adapter; recuperación/cambio, scopes tenant/proyecto/rol, shopperId exacto, dedupe seguro y troubleshooting.

## 14. Estado seguro
R17N cerrado; Auth91/91 preservado. Desde el hallazgo P0 no se ejecutaron Auth writes, Firestore data writes, Rules, Hosting deploy, Storage/HR/legacy/payments/functions/Make/Gemini, merge ni producción.
