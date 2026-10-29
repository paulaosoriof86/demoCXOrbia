# CXOrbia Recovery I3 — readback aislado DEV crossfront · 2026-10-29

**Decisión:** `PASS_HOSTING_PREVIEW_EXACT_BYTES_AND_ISOLATION / I3 HOLD / Gate20 HOLD / Gate21 HOLD / I4 NO AUTORIZADO`.

## Fuente y transporte

- Rama única: `recovery/cxorbia-phase-a-20260831`.
- Fuente de producto y pruebas: `c2f8a00b3acb4b069ff254b266beb6008cfb0b3b`, tree `dedb1766036748f336dd3c7c90814ddc25066a0c`.
- Commit de activación **sólo control de transporte**: `fca28a2cc5b5752d58b0f516dc93c07d6ba29a9f` (no cambios en `app`, `backend`, `tools`, `firebase.json`, Firestore, reglas ni Storage respecto a la fuente fijada).
- GitHub Actions: `40895297870`, job `123522636994`, conclusión `SUCCESS`, 2026-10-29.
- Artefacto de readback: `12905993314`, digest `sha256:bf16f170c76122e1954661ae5018c967d537e7696194ecec97a28f2eda9c2953`.
- Preview aislada: `https://cxorbia-backend-dev--i3-recovery-1029-40895297870-30o7o5xu.web.app`.

## Verificaciones que efectivamente ejecutó el workflow

1. Fuente SHA/tree, blobs owner, rama, padre/control-only, destino Firebase DEV y prohibición I4: PASS.
2. Tests focales de Histórico/periodos/disponibilidad y proveedores de periodos/shoppers: PASS.
3. Hosting Preview: deploy PASS con fuente fijada, no rebuild funcional.
4. Comparación byte a byte de cinco archivos servidos (`index-backend-dev.html`, `core/data.js`, `modules/clientes.js`, `modules/historico.js`, `modules/proyectos.js`): PASS.
5. Comparaciones pre/post: release Hosting LIVE, revisión/tráfico Cloud Run, ruleset Firestore, hash de producción `tya-plataforma.web.app`: sin cambio, PASS.
6. No se ejecutaron escrituras de datos HR, Firestore, Auth ni Storage. Sólo se creó la Preview de Hosting DEV.

## Interfaz y UAT

Se abrió la nueva URL en Chrome local; cargó la pantalla de inicio de sesión y las tres opciones (Administración, Cliente, Shopper). **No se obtuvo sesión Admin autenticada en ese origen**. La autenticación que Paula tenía abierta en una Preview C8D2 anterior no constituye prueba de sesión en este nuevo subdominio. No se ejecutaron escrituras funcionales ni se cerró la sesión previa. Por ello, `authenticated DEV E2E = PENDING`, no `FAIL`.

La matriz V193 de 21 dominios y el plan de 82 tareas permanecen íntegros. El P0 de Histórico ya se sirve en esta Preview pero su comparación real GT/HN con HR viva requiere UAT. Persisten sin cierre autorizado los 3 defectos funcionales, los 2 compuestos no servidos y los dominios pendientes de confirmación humana. Conservar PASS históricos sin inferir PASS nuevo.

## Siguiente acción exacta

Reutilizar esta **misma Preview** y autenticar una sesión administrativa en ella; ejecutar el recorrido UAT transversal solo lectura con la revisión HR en común: proyectos/periodos/estados, Dashboard, visitas disponibles, identidades y asignaciones, histórico por país, pagos/beneficios/finanzas, certificaciones, recursos PDF y reportes. Registrar cada resultado con fuente+actor+período+país+revisión; en caso de FAIL aislar su owner histórico. **No promover a producción sin I3 GO y autorización I4 separada.**
