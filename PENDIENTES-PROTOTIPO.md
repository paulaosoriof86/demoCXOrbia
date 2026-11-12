# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`

## Estado

**Score formal: 60% / 40%.** I4 cerrado = 85%; I5/go-live = 100%. La continuidad canónica está sincronizada y el source de `PROTECTED_RUNTIME_SINGLE_AUTHORITY` ya tiene corrección focalizada; falta gate runtime/E2E, por lo que el porcentaje no cambia todavía.

## No reabrir

I1/I2/I3/I4-A/I4-B, Auth ya construido, Shopper, Finance V2/historical, multi-proyecto/no-code, documentos, reservas y Academia no se reconstruyen por defecto. I4-C/D/E permanecen protegidos.

## Defecto runtime localizado y corregido en source

El watcher HR vivo del carril humano autenticado podía aplicar source-safe a `CX.data` antes de que la autoridad protegida Auth + Firestore + HR terminara de componerse. Se agregó lock de arranque al watcher: no aplica HR in-place hasta que `CX_PROTECTED_AUTH_HR_AUTHORITY` esté aplicado y la fuente canónica esté establecida.

## Pendiente activo inmediato

`PROTECTED_RUNTIME_SINGLE_AUTHORITY_GATE_AND_REAL_PHASE_A_E2E`:

1. probar el orden de autoridad en `app/index-backend-dev.html`;
2. verificar Admin y Shopper reales con claims/membership/identidad exacta;
3. verificar Mi Perfil, histórico, certificaciones, visitas, beneficios y pagos;
4. verificar Finanzas: Mayo 44/44; Junio 2/44, 42 pendientes, Q451; `liquidada != pagada`;
5. confirmar cero fallback demo/source-safe viejo y cero bypass de persistencia;
6. gatear conteos contra fuente vigente, no 616/216/44 históricos;
7. E2E visible de la misma build;
8. solo si pasa, cerrar I4 → 85% y abrir I5.

## Claude/prototipo

No generar nueva candidata ni tocar frontend por esta corrección. Solo un hallazgo visual reproducible y localizado posterior al E2E puede crear tarea frontend. `cliente-extra.js`/exports sigue como hallazgo separado a clasificar, no como causa de esta convergencia.

## Academia

Sin reconstrucción. Alinear manuales/cursos después del cierre I4 con el comportamiento realmente probado.

## Seguridad

0 deploy, 0 merge, 0 producción, 0 provider writes, 0 Make/Gemini, 0 ejecución bancaria.

## Pendientes Recovery después de Hosting DEV RUN2437 — 11-nov-2026

- [x] VRM-328: corrección fuente transversal Mi Perfil Activas versus Mis Visitas, QA local y publicación Hosting DEV de `e2458f4` comprobada; nuevo Hosting `8dea702589084bcf`, Cloud Run previo conservado. Recibo canónico RUN2437 en `docs/checkpoints/CXORBIA_I3_VRM328_HOSTING_ONLY_DEV_RUN2437_ACK_20261111.json`.
- [ ] B2/B3: comprobar hash exacto del archivo Shopper servido, sesión Shopper autenticada y paridad Activas 0 / Mis Visitas 0 para visita realizada+submitida; presentar evidencia visual a Paula sin atribuir PASS humano automático.
- [ ] B1/B2/B3: aceptación integral restante; B4/B5/B6/B7 mantienen PASS humano y no se recertifican sin drift exacto.
- [ ] B8: fuente bancaria específica de pagos septiembre 31-oct antes de modificar liquidaciones o declarar pagado; octubre por pagar y noviembre devengando.
- [ ] B9: regresión transversal única de 21 dominios, Gate20/21 en HOLD hasta evidencia real, no forzar 21/21.
- [ ] ROLA: diseño configurable cuatro países y hojas de ruta mensuales por país con permisos de coordinadores; no sustituir HR actual ni configurar solo en código.
- [ ] I4/producción: sin autorización; no tocar `tya-plataforma.web.app`, reglas, Auth, Storage, Make, pagos ni HR.
