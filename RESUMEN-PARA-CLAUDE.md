# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL__P0_SHOPPER_IDENTITY_NULL__ADMIN_PROFILE_INCOMPLETE__NO_NEW_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes/readback; no repetir.
- Corte5 `CX.data`: `cinepolis`, 14 periodos, 616 visitas, `currentPeriodId=2026-07`, Firestore/fallback=false PASS.
- Auth import/readback 91/91 PASS; no repetir ni resetear por rutina.
- Corte6 claims5/5 + Rules PASS.
- PR #7 sigue draft/open/no merge; producción `tya-plataforma` no tocada.

## 2. Último redeploy DEV — PASS técnico, FAIL visual
El one-shot autorizado de Cloud Run + Hosting DEV fue ejecutado y consumido:
- Cloud Run revisión `cxorbia-live-hr-dev-00008-8mf`;
- Hosting version `sites/cxorbia-backend-dev/versions/22e81c2b783f697a`;
- release `sites/cxorbia-backend-dev/releases/1785467713768000`;
- remote smoke: 14 periodos, 616 visitas, auto-month PASS, 208 identidades display-name-only.

La validación humana posterior encontró un P0 real. Por tanto, **no congelar Corte 6**.

## 3. P0 PROVEN — Shopper entra sin shopperId
En `app/app.js`, `_isDevAccess()` no reconoce el host `cxorbia-backend-dev.web.app` en la ruta humana source-safe. El botón Shopper cae a `selectRole('shopper')` sin `shopperId`; fuera de demo la sesión queda `Evaluador (sin identidad)` y Mi Perfil/Mis Visitas fallan cerrado.

No corregir inventando `sh1` ni por nombre. La identidad debe venir de login/Auth + shopperId estable.

## 4. Perfil Admin incompleto
La ruta usada en la visual es HR source-safe y su overlay remoto es `display_name_only`. Sirvió para probar nombres, pero no es la ruta operativa final para perfiles completos.

Superadmin debe recibir desde backend protegido todos los campos autorizados existentes: nombre, username, teléfono/WhatsApp, correo, ubicación, documento, datos de pago cuando existan, certificaciones, liquidaciones/pagos, campos agregados por shopper y el histórico completo enlazado por `shopperId`.

Shopper solo ve su propio perfil/scope. Cliente no hereda datos personales de shoppers.

## 5. Credenciales TyA
Regla funcional preservada: username `nombre.apellido`; contraseña inicial histórica tipo `Nombre123*`.

Firebase Auth no permite recuperar la contraseña actual. No guardar passwords en claro en JS/repo/Firestore público. El perfil protegido debe mostrar username y estado de credencial; la contraseña inicial/legacy solo si está comprobada por fuente segura. Si no puede comprobarse, corresponde reset controlado al patrón, sujeto a autorización Auth específica.

Auth91/91 no se reimporta.

## 6. Plataforma vigente / legacy útil
Existe export reciente de la plataforma actual con `tya_shoppers_extra` y más datos de perfil. Recuperar esos datos solo por export/import; nunca conectar la base vieja.

Conciliar por IDs/evidencia estable. Hay duplicados/conflictos históricos, por lo que nombre/teléfono no pueden ser llave única. Conflictos → revisión humana.

## 7. Histórico y KPI
El historial del perfil debe derivarse de las 616 visitas canónicas y enlazarse por `shopperId` estable.

`app/core/shoppers-store.js::shopperStats` usa hoy una lista estrecha de estados y puede subcontar históricos `submitida`/otros estados canónicos. Claude debe preservar el diseño de KPI/drill, pero la semántica debe venir del contrato/adaptador canónico, sin inferir estados.

## 8. Claude/prototipo
No generar candidata general ahora. Corrección focalizada requerida solamente si el backend protegido entrega los datos y la UI no los refleja:
- `app/modules/shoppers.js`: perfil completo autorizado; username/estado de credencial; campos reales; drill de KPI; histórico completo.
- `app/modules/misvisitas.js` / `miperfil`: mantener fail-closed sin shopperId; nunca fallback `sh1`.
- `app/app.js`: login Shopper debe resolver identidad real, no autoentrar como sesión anónima.

El prototipo manda; no rediseñar.

## 9. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones transversales;
- copy de fuentes/readiness.

No mezclar estos pendientes con el P0 Shopper.

## 10. Siguiente bloque
`PROTECTED-RUNTIME READ-ONLY VALIDATION → INVENTARIO DE CAMPOS PERFIL + CONCILIACIÓN EXPORT LEGACY → PLAN DELTA EXACTO → GATES AUTH/FIRESTORE SEPARADOS → REDEPLOY DEV SOLO CON NUEVA AUTORIZACIÓN → VISUAL → FREEZE C6`.

Documento de causa raíz: `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-VISUAL-FAIL-SHOPPER-IDENTITY-PROFILE-20260731.md`.
