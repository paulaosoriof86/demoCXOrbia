# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__CLOUD_V7_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Corrección documental

Pendiente cerrado mediante corrección:

- no volver a describir V6 como empalmada;
- distinguir materialización provisional de empalme aprobado/completado.

## 2. Cloud V7 — bloqueantes P0

### P0-1 — paquete fuera de alcance

La entrega contiene 259 archivos y una aplicación completa. No puede enviarse a empalme.

Debe eliminarse todo salvo:

- `app/app.js`;
- `app/styles/layout.css`;
- manifest;
- reporte;
- capturas y comparación solicitadas.

### P0-2 — responsive del Login

Corregir superposición del panel orbital y formulario en:

- `768×1024`;
- `412×915`;
- `390×844`.

Criterios:

- formulario debajo del panel oscuro;
- `INGRESO`, título, subtítulo, países y `PERFIL` visibles;
- primera tarjeta completa;
- órbita visible;
- cero scroll horizontal general.

## 3. Cloud V7 — P1

- crear `MANIFEST.json` con path, bytes y SHA-256;
- entregar las cinco capturas requeridas;
- entregar comparación V6/V7 en `1440×900`;
- entregar evidencia de 1/2/8/12 países;
- crear reporte V7 específico;
- evitar corte del registro en `1440×900` con 12 países;
- definir fallback seguro para banderas si falla `flagcdn.com`.

## 4. Cloud V7 — P2

- retirar documentación histórica del ZIP;
- retirar manifests antiguos;
- corregir mojibake en cualquier documento realmente incluido;
- validar si el footer `v1.0 · 2026 · Powered by Gravicentra CX` pertenece al criterio de marca.

## 5. Carril de empalme

```text
EXECUTION_LANE_READY_FOR_APPLY = false
V7_GO = false
SEND_TO_EMPALME = false
```

Después de recibir la corrección:

1. extraer ZIP;
2. confirmar checkout autenticado y rama viva;
3. comparar delta exacto;
4. ejecutar auditoría semántica, sintáctica y visual;
5. únicamente con GO y sin P0, aplicar delta directamente.

## 6. Backend/laboratorio pendiente

Sin cambio:

- runner real por UI normal;
- `CORE_OPERATIONS_ADMIN`;
- `SHOPPER_FULL_CYCLE`;
- consistencia cross-módulo;
- tres recargas y nueva pestaña;
- exportaciones/evidencia;
- fingerprints;
- cleanup exacto.

No ejecutar antes del único deploy DEV de una candidata visual aprobada.

## 7. Primer release slice

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

## 8. Deuda viva no bloqueante por sí sola

- overlay A+B superseded;
- PDF puede omitir gráficas;
- Excel básico.

## 9. Secuencia exacta

```text
CORRECCIÓN CLOUD V7
→ DELTA ESTRECHO + EVIDENCIAS
→ EXECUTION_LANE_READY
→ AUDITORÍA FINAL
→ GO SIN P0
→ APPLY_DELTA_DIRECTLY
→ SOURCE/STATIC FINAL
→ ÚNICO HOSTING DEV AUTORIZADO
→ LABORATORIO REAL
→ CLEANUP
→ CHECKPOINT HUMANO
→ CUTOVER AUTORIZADO
```

## 10. Estado seguro

- empalme V6 aprobado/completado: no;
- empalme V7: 0;
- Hosting/Cloud Run: 0;
- provider writes: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
