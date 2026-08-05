# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__CLOUD_V7_HOLD__LAB_SOURCE_ONLY_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Corrección documental

Pendiente cerrado:

- no volver a describir V6 como empalmada;
- distinguir materialización provisional de empalme aprobado/completado.

## 2. Cloud V7 — bloqueantes P0

### P0-1 — paquete fuera de alcance

La entrega contiene 259 archivos y una aplicación completa. Debe regresar como delta estrecho con `app/app.js`, `app/styles/layout.css`, manifest, reporte y evidencias.

### P0-2 — responsive del Login

Corregir superposición del panel orbital y formulario en `768×1024`, `412×915` y `390×844`.

## 3. Cloud V7 — P1/P2

- manifest con hashes;
- cinco capturas reales;
- comparación V6/V7;
- evidencia 1/2/8/12 países;
- reporte específico;
- doce países sin cortar botón/registro;
- fallback seguro de banderas;
- retirar documentación histórica y manifests antiguos.

## 4. Carril de empalme

```text
EXECUTION_LANE_READY_FOR_APPLY = false
V7_GO = false
SEND_TO_EMPALME = false
```

Después de recibir la corrección:

1. extraer ZIP;
2. confirmar checkout autenticado y rama viva;
3. comparar delta exacto;
4. auditoría sintáctica, semántica y visual;
5. únicamente con GO sin P0, aplicar delta directamente.

## 5. Laboratorio — preparación source-only cerrada

Ya quedaron creados:

- contrato del runner;
- schema de evidencia;
- gate source-only;
- matriz Admin/Operaciones + Shopper;
- política `AUDIT-*`;
- fingerprints;
- cleanup exacto;
- decisiones PASS/FAIL/P0 cleanup.

Pendiente antes de ejecutarlo:

- candidata frontend final aprobada;
- empalme completado;
- source/static final PASS;
- único Hosting DEV;
- autorización aplicable de escrituras temporales;
- snapshot y runner real.

No ejecutar antes del deploy DEV final.

## 6. Primer release slice

`ADMIN/OPERACIONES + SHOPPER`.

Validar después del deploy autorizado:

- Hoja de Ruta e histórico;
- Dashboard;
- Visitas/Disponibles;
- Postulaciones y ficha;
- Shoppers;
- Reservas/asignación;
- Finanzas Phase A;
- Mi Perfil, certificaciones, Mis Visitas, histórico y pagos Shopper.

Portal Cliente continúa en carril paralelo.

## 7. Deuda viva no bloqueante por sí sola

- overlay A+B superseded;
- PDF puede omitir gráficas;
- Excel básico.

## 8. Secuencia exacta

```text
CORRECCIÓN CLOUD V7
→ DELTA ESTRECHO + EVIDENCIAS
→ EXECUTION_LANE_READY
→ AUDITORÍA FINAL
→ GO SIN P0
→ APPLY_DELTA_DIRECTLY
→ SOURCE/STATIC FINAL + GATE DEL LABORATORIO
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ CHECKPOINT HUMANO
→ CUTOVER AUTORIZADO
```

## 9. Estado seguro

- empalme V6 aprobado/completado: no;
- empalme V7: 0;
- laboratorio browser/runtime: 0;
- entidades `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- provider writes: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
