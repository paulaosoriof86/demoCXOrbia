# Resumen para Claude — binding operativo TyA después de HR viva

Fecha: 2026-07-10

## Contexto que no debe reiniciarse

- Source lock post-V96 ya empalmado.
- HR viva source-safe validada: 14 periodos, 28 tabs, 616 visitas, 213 shoppers protegidos.
- Cada periodo tiene GT 34 + HN 10.
- Firebase DEV actual no está limpio y no se conectará a Auth/Firestore.
- Cinépolis es proyecto configurable dentro del tenant TyA, no producto global.

## Paquete crítico para la próxima candidata

No rediseñar. Resolver únicamente estos bindings P0:

1. **Punto único `CX.data`:** cargar el payload `window.CX_TYA_HR_SOURCE_SAFE` antes del boot y adaptar arrays/métodos sin romper la interfaz existente. Cada periodo debe tener ID único; `projectId=cinepolis` debe permanecer como llave estable del proyecto.
2. **Certificaciones:** eliminar KPIs, nombres y fechas demo hardcodeados. Mostrar carryover histórico real/source-safe cuando exista; si el detalle aún no está consolidado, mostrar `pendiente de validación histórica`, nunca cifras ficticias.
3. **Finanzas/Liquidaciones:** eliminar lotes/evaluadores demo. Derivar control desde HR source-safe: honorario, boleto, combo, submitido, país, moneda y regla de junio ya documentada. Pago real sigue bloqueado.
4. **Estados demo residuales:** en el carril TyA, correo/notificaciones/soporte deben usar datos dinámicos o estado vacío/ejemplo claramente rotulado, nunca mezclarse con operación real.
5. **Indicador visible:** mostrar `DEV TyA · HR viva source-safe · no importado` y conservar copy honesto para Auth, Firestore, Make, Gemini y pagos.

## Validación esperada

- Dashboard, HR, visitas, postulaciones, shoppers, certificaciones, liquidaciones/pagos y cliente multi-proyecto muestran TyA/source-safe o estado pendiente honesto.
- No aparecen `Proyecto Retail`, `Cliente Retail`, `Evaluador 01`, lotes demo ni métricas 18/6 como si fueran reales.
- GT/HN y periodos mantienen 44 visitas por periodo.
- Junio 2026 mantiene 34 GT + 10 HN.
- No se altera la interfaz pública de `CX.data`.
- No se activa backend real, Auth, Firestore, imports o providers.

## Academia

Actualizar ruta por rol, manuales y checklists para explicar source-safe vs importado/conectado, certificación carryover y liquidaciones como control, no pago ejecutado.
