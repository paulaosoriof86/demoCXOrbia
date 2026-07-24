# RESUMEN PARA CLAUDE — Addendum Corte 3 UI/export R23 PASS

**Fecha:** 2026-07-24  
**Decisión:** no se demuestra una corrección nueva obligatoria en `app/modules/**`.

## 1. Qué quedó conectado y comprobado

En la entrada Backend DEV:

- Finanzas y Beneficios consumen la misma colección financiera canónica source-safe;
- `CX.data` conserva su interfaz;
- mayo de 2026 mantiene 44 visitas HR y 42 filas financieras exactas;
- las 2 visitas no vinculadas exactamente no se convierten en liquidaciones inventadas;
- 79 revisiones de vínculo, 2 revisiones de monto y 37 evidencias candidatas permanecen separadas;
- ningún registro aparece pagado;
- el contrato de visita falla cerrado con `pending_source_confirmation`;
- la especificación de exportación tiene países, columnas y gráfica;
- Beneficios muestra honorarios, reembolsos, por cobrar y pagado desde la verdad canónica.

## 2. Qué no debe cambiar Claude

- No convertir 44 visitas en 44 filas financieras por obligación visual.
- No marcar `pagada` por existir una liquidación o evidencia candidata.
- No resolver automáticamente las dos filas en revisión.
- No hardcodear Cinépolis como regla global.
- No modificar adapters, snapshots, runners, contratos, gates ni fuentes reales/sanitizadas.
- No prometer PDF/Excel final visualmente aprobado antes de la revisión real.

## 3. Pendientes frontend vivos

Solo actuar cuando exista evidencia reproducible y localizada:

1. responsive parcial en tablas/fichas;
2. verificar que el PDF real renderice la gráfica;
3. mejorar el formato operativo del Excel real;
4. reemplazar la etiqueta técnica visible `sourceAccessMode` por copy comercial/honesto donde aún aparezca;
5. mantener estados de pago claros: liquidación, por cobrar, en revisión y pagado son conceptos distintos.

El gate técnico no justifica reescribir `modules/finanzas.js` ni `modules/beneficios.js`.

## 4. Validación esperada para una futura corrección Claude

- mismo periodo, país y moneda;
- mismos conteos canónicos;
- 0 pagos inferidos;
- exportaciones con datos idénticos a UI;
- no exposición de filas en revisión como exactas;
- sin regresión en V174, Corte 1 o Corte 2A;
- Academia/manuales actualizados por rol si cambia copy, flujo o exportación.

## 5. Evidencia

- Run `30074835544`.
- Job `89423207982`.
- Artifact `8589444193`.
- Digest `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.

## 6. Estado seguro

No se autoriza Hosting, deploy, merge, producción, import, proveedores, pagos ni modificaciones de frontend a partir de este documento.
