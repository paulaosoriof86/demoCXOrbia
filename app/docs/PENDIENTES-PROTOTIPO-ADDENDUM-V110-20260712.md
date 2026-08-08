# PENDIENTES DEL PROTOTIPO — ADDENDUM V110

Fecha: 2026-07-12

## Estado

Los dos P0 del paquete V109→V110 quedaron `PASS_COMPROBADO`.

No se genera un nuevo paquete Claude porque únicamente permanecen P1/P2 acumulables.

## P1 — Finanzas / hardening local

Archivo principal futuro: `app/core/data.js`.

1. Normalizar `pais` y `currency` con `trim()` antes de validar.
2. Deduplicar IDs dentro de una misma llamada a `payVisits()`.
3. Rechazar de forma idempotente visitas ya procesadas/liquidadas/pagadas cuando se invoque el método directamente.
4. Mantener inválidos sin estado, lote, fecha, movimiento ni automatización.
5. Ajustar copy cuando `processed=0`: no iniciar el mensaje con `Lote registrado como pagado`.

Estos puntos no bloquean la baseline V110 porque el flujo UI normal usa IDs únicos, filtra elegibles y retira la visita después de procesarla. Sí deben cerrarse antes de pagos/backend real.

## P1 — Manifest/inventario total

El manifest V110 valida correctamente 138 archivos, pero omite sin declarar:

- `docs/MANIFEST-V109.json`;
- `docs/REPORTE-CORRECCION-V108.md`.

En el próximo source lock formal:

- declarar todas las exclusiones;
- diferenciar runtime, evidencia y documentos históricos;
- no presentar un subconjunto verificable como inventario total.

## P2 — Contrato de retorno

Normalizar el retorno de `payVisits()` para exponer de forma explícita:

- `processed`;
- `reviewRequired`;
- `movementsCreated`;
- `batchIds`;
- motivos por registro.

V110 usa equivalentes `pagadas`, `detalle` y `reviewRequired`; el comportamiento funcional está comprobado.

## No reabrir

- país real del shopper en Academia;
- fail-closed de shopper sin país;
- KPIs sobre contenido visible;
- validación previa de datos incompletos;
- separación GT/GTQ y HN/HNL;
- IDs determinísticos;
- scores finitos/umbrales;
- responsive;
- Beneficios;
- certificaciones;
- cache demo/real;
- shell/navegación.

## Próxima revisión Claude

Acumular estos P1/P2 con futuros hallazgos. Crear paquete solo si aparece un P0 comprobado o Paula lo solicita expresamente.
