# AUDITORÍA FORENSE — CANDIDATA CXORBIA V109
## Decisión: BLOQUEADA por dos P0 comprobados
Fecha: 2026-07-12

## Alcance

Candidata: `Prototype development request CXOrbia V109.zip`.
Comparada contra V108 y el paquete exclusivo V108→V109.
Repo `paulaosoriof86/demoCXOrbia`, rama `docs-tya-v6-v71-audit`, PR #7 draft/open/no merge.

## Reproducibilidad

- V108: 132 archivos.
- V109: 139 archivos.
- 8 archivos modificados, 8 agregados y 1 manifest anterior retirado.
- Sintaxis JS/MJS: PASS.
- Manifest V109: 135 archivos, 0 diferencias, aggregate `9823c3a55e031d1bd3d00b18ee3e54a220a2d09011647dd2c28452d814913a1f`, exit code 0.
- Portal Cliente finite scores: PASS.
- Finanzas GT/GTQ frente a HN/HNL con datos completos: PASS.
- Responsive heredado V108: no reabierto.

## P0 1 — Academia expone cursos de ambos países al shopper

Claude marcó `academia_pais_gt_hn` como PASS porque un shopper sin `scopePaises` ve los dos países del proyecto. Ese criterio no corresponde a lo solicitado.

`CX.acadData.ctx()` usa `scopePaises` si existe; en caso contrario usa todos los países del proyecto. La sesión shopper estándar no trae `scopePaises`, aunque el shopper sí tiene `pais` en el catálogo.

Prueba independiente sobre el código V109:

```json
{
  "shopper": {"id":"shGT","pais":"GT"},
  "ctx": {"tenantId":"tenant-x","projectId":"retail","paises":["GT","HN"],"rol":"shopper"},
  "cursoGTVisible": true,
  "cursoHNVisible": true
}
```

Impacto: fuga de contenido, manuales, rutas o certificaciones por país; afecta Academia y Phase A TyA.

Corrección mínima: para shopper resolver `shopperId`→`shopper.pais`, usar solo ese país y fallar cerrado si no puede resolverse. No usar todos los países del proyecto como fallback para shopper.

## P0 2 — Finanzas procesa registros sin país/moneda

Claude marcó PASS porque el fallback visual de un registro sin `loteId` crea una fila de revisión. El flujo real `payVisits()` no queda cubierto.

En V109, `payVisits()` reemplaza faltantes por `—` en la clave, genera `loteId`, marca la visita `liquidada`, asigna `fechaPago` y crea un movimiento `Pagado`.

Prueba independiente:

```json
{
  "entrada": {"id":"MISS","projectId":"retail","pais":"","currency":"","honorario":100},
  "resultado": {
    "pagadas":1,
    "estadoVisita":"liquidada",
    "loteId":"L-3QTLJQP0",
    "movimientoEstado":"Pagado",
    "movimientoPais":"",
    "movimientoMonto":-100
  }
}
```

Impacto: dato incompleto procesado como pago/preview, lote y movimiento financiero inválidos.

Corrección mínima: validar ID, proyecto, país, moneda y monto antes de agrupar; inválidos no cambian estado, no reciben lote/fecha, no crean movimiento ni automatización y se devuelven en `reviewRequired` con motivo.

## Pendientes no críticos

- El modal Academia todavía dice que no existe catálogo de usuarios/Auth aunque existe `cx_users`; debe decir que requiere otra sesión autenticada. P2.
- ID local perezoso de actores antiguos: aceptable como preview; Auth real sigue pendiente. P2.
- Claude no ejecutó Node, pero la auditoría independiente sí ejecutó el verificador y pasó. No bloquea.

## Decisión

V109 no se empalma. Los dos P0 afectan control de acceso por país y seguridad operativa de pagos.

No reabrir: finite scores, lotes multi-moneda con datos completos, IDs determinísticos, responsive, Beneficios, certificaciones, cache demo/real y manifest.

Siguiente candidata: V110 con solo estos dos P0.

## Clasificación

- Reusable CXOrbia: fail-closed de scopes y validación previa de pagos.
- Exclusivo TyA: separación GT/HN y GTQ/HNL.
- Claude/prototipo: `academia.js`, `data.js`, `finanzas.js`.
- Academia: impacto directo y crítico.
- Sin impacto Claude: backend, gates, migración y proveedores permanecen intactos.