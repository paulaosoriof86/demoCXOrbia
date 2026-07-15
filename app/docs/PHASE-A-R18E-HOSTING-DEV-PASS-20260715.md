# PHASE A R18E — FIREBASE HOSTING DEV PASS

Fecha: 2026-07-15

## Decisión

`PASS_HOSTING_DEV_V131_R18D_REMOTE_VERIFIED`

## Alcance autorizado y ejecutado

- Firebase project: `cxorbia-backend-dev`.
- Hosting target: `cxorbia-dev`.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Build: `v131-r18d-source-safe-20260715-r18e`.
- Baseline: V131.
- Source lock aggregate: `6e833331f5aa9ba9458ef0724756e72747352add3f8c6cc1fa327c96fadec348`.
- Commit exacto desplegado por el workflow: `fe9a498863dd8454c174971781e8dbbb606a3131`.
- Firebase Hosting version: `projects/87461567267/sites/cxorbia-backend-dev/versions/32e865ce08af0d99`.
- Workflow: `29442279729`.
- Artifact interno: `8353973665`.

## Gates ejecutados

1. Sintaxis de Finanzas y herramientas R18D.
2. Lectura HR viva source-safe.
3. Canonicalización R18A.
4. Aplicación de resultados existentes R11D/R14C/certificación R18B.
5. Binding source-safe V131.
6. Binding visible R18D.
7. Smoke local R18D.
8. Validación exacta de autorización.
9. Validación de la cuenta de servicio del proyecto DEV.
10. Verificación de acceso exclusivo a Firebase Hosting.
11. Deploy únicamente `hosting:cxorbia-dev`.
12. Verificación remota del proof exacto.
13. Smoke remoto R18D.
14. Eliminación de la credencial temporal del runner.

Todas las etapas terminaron `success`.

## Resultado remoto

- 14 periodos únicos.
- 616 visitas.
- Periodo activo `cinepolis-2026-07` con 44 visitas.
- 216 shoppers protegidos.
- 196 controles financieros exactos como `pending_financial_review`.
- 92 casos financieros en revisión.
- 1 revisión shopper.
- 1 revisión de certificaciones.
- 216 shoppers en HOLD de certificación.
- 0 pagos confirmados.
- 0 lotes de pago creados.
- 0 certificaciones carryover confirmadas.
- 0 solicitudes automáticas repetidas de certificación.
- Finanzas, Shoppers y Certificación renderizados.
- 0 errores de consola.
- 0 errores de página.
- 0 blockers.
- 0 warnings.

## Estado seguro

- Producción: no.
- Firestore writes: no.
- Auth writes: no.
- Storage writes: no.
- HR writes: no.
- Imports: no.
- Make: no.
- Gemini: no.
- Pagos: no.
- Runtime sync: no.
- Fuente: snapshot source-safe visible.

## Cierre técnico

El workflow R18D fue restaurado a smoke-only después del despliegue. Se eliminaron del repositorio la autorización y los workflows/marcadores temporales de uso único. No quedó un deploy automático activo.

## Siguiente paso

Validación visual humana de Paula sobre la URL exacta. Los hallazgos visuales deben clasificarse como:

- aprobado;
- diferencia visual/source-safe no bloqueante;
- error funcional reproducible.

No se reabren V131, R11D, R14C, HR, importadores ni R18D salvo evidencia funcional exacta.
