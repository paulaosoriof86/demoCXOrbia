# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `V7_2_RECEIVED_PREFLIGHT__FINAL_AUDIT_AND_DIRECT_APPLY_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuente de verdad

Mandan, en este orden:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. manifiesto de composición canónica;
5. PR #7 y HEAD vivo.

Los estados C6 previos permanecen como historia protegida, pero no describen el bloqueo actual.

## 2. Protegido y no reabrir sin regresión reproducible

- Corte3 FROZEN.
- R17N 1,406/1,406.
- Corte5: 14 periodos y 616 visitas.
- Auth/claims/Rules y continuidad de 91 identidades.
- Login único DEV.
- HR viva y cambio automático de periodo.
- Dominio/semántica canónica.
- Finanzas/Liquidaciones root fix.
- Portal Shopper canónico.
- Reservas fail-closed.
- Composición source/static y contrato del Laboratorio PASS.

## 3. Bloqueo actual único

V7.1 no fue empalmada por P0 responsive reproducible y evidencia incompleta.

V7.2 fue recibida y pasa preflight de paquete, pero todavía no tiene auditoría final ni carril file-aware listo para auditoría+aplicación atómica en la misma sesión.

No existe todavía una candidata visible `ACTIVE_CANONICAL_BASELINE`.

## 4. Pendientes inmediatos y orden obligatorio

1. `EXECUTION_LANE_READY` con ZIP V7.2 extraído y checkout autenticado de `docs-tya-v6-v71-audit`.
2. Auditoría final focalizada V7.2; no auditoría general.
3. Generar evidencia real de cinco viewports y escenarios 1/2/8/12 países.
4. Si GO sin P0, aplicar directamente solo el delta aprobado.
5. Emitir manifest/build-lock/verificador del nuevo HEAD.
6. Reejecutar source/static + gate del Laboratorio sobre el mismo HEAD.
7. Un único Hosting DEV.
8. Laboratorio real acumulativo Admin/Operaciones + Shopper, con `AUDIT-*`, snapshots, cleanup y evidencia.
9. Validación humana de una sola URL/candidata.
10. Freeze y cutover autorizado.

## 5. V7.2 — recepción verificada

- SHA-256 `d3b7551b3b0b30e1b071dfc74beb20009c9c523c2955cce760148da6b8727686`.
- 23,243 bytes.
- 4 entradas.
- Delta declarado: `app/app.js` y `app/styles/layout.css`.
- El correctivo CSS responsive solicitado está presente.
- Capturas contractuales: ausentes; deben producirse durante auditoría.

## 6. Mejor versión por módulo

No se construirá manualmente por copia y pega. El manifiesto canónico ya fija autoridad por archivo y preserva las mejores versiones de Dashboard, Visitas, detalle, revisión, postulaciones, reservas, shoppers, Mis Visitas, certificación, cuestionario, beneficios, documentos, Finanzas, Liquidaciones, Cliente, ReportKit, Academia, Auth, HR y adapters.

V7.2 solo puede modificar Login responsive. No puede reemplazar módulos aprobados ni crear una shell paralela.

## 7. Pendientes que no bloquean el primer corte

- PDF con gráficas incompletas en algunas rutas.
- Excel con presentación básica.
- ajuste del mapa esperado de cuatro rutas con nombres de archivo alternos.
- Portal Cliente continúa en paralelo sobre la misma candidata.
- WhatsApp requiere fuente real y autorización de integración.

Se documentan como P1/P2 y no justifican nueva candidata, rama o deploy adicional.

## 8. Datos actuales después del freeze visual

- resolver solo deltas reales posteriores al histórico protegido;
- conservar shoppers/certificaciones sin deduplicar por nombre;
- mantener conflictos en review queue;
- no repetir import histórico;
- no inferir pagos, lotes o certificaciones;
- agosto se procesa como delta autorizado, no como recarga total.

## 9. Academia

El freeze debe actualizar rutas por rol, manuales, cursos, checklists, glosario, errores frecuentes y notificaciones. Manual y Curso siguen siendo objetos distintos.

## 10. Estado seguro

- empalme V7.2: 0;
- Hosting nuevo/redeploy: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
