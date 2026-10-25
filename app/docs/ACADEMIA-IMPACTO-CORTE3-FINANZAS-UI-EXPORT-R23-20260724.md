# Academia — Impacto Corte 3 Finanzas UI/export R23

**Fecha:** 2026-07-24  
**Estado:** pendiente de implementación/profundización en prototipo; no publicación automática.

## 1. Conceptos que deben enseñarse por separado

- visita operativa;
- vínculo financiero exacto;
- fila pendiente de revisión;
- honorario;
- boleto;
- combo;
- reembolso total;
- liquidación;
- por cobrar;
- evidencia candidata de pago;
- pago confirmado;
- lote;
- exportación PDF/Excel.

La regla central del curso/manual debe ser: **una visita existente no obliga a fabricar una fila financiera exacta y una liquidación no equivale a pago**.

## 2. Ruta Admin/Operativo

La lección debe explicar:

1. seleccionar proyecto y periodo;
2. verificar país y moneda;
3. comparar inventario de visitas con filas financieras exactas;
4. revisar colas de vínculo y monto;
5. distinguir evidencia candidata de pago confirmado;
6. validar honorario, boleto, combo y total;
7. abrir el detalle por país;
8. generar PDF/Excel;
9. comprobar que exportación y pantalla coincidan;
10. escalar un conflicto sin sobrescribirlo.

Checklist esperado:

- 44 visitas HR no se interpretan automáticamente como 44 filas financieras;
- los casos no exactos permanecen en revisión;
- `Pagado` exige fuente, fecha, lote, confirmación y auditoría;
- moneda y país no se mezclan;
- cero pagos confirmados se representa como cero, no como ausencia ambigua.

## 3. Ruta Shopper

La lección debe explicar:

1. diferencia entre honorario y reembolso;
2. cómo leer Por cobrar y Pagado;
3. por qué un monto puede seguir en revisión;
4. qué significa `pending_source_confirmation` en lenguaje operativo;
5. cómo consultar el detalle por visita;
6. cuándo escalar una diferencia.

## 4. Errores frecuentes

- asumir que liquidación significa depósito realizado;
- sumar boleto/combo al honorario sin separar conceptos;
- mezclar monedas;
- presentar evidencia candidata como pago;
- ocultar una fila en revisión;
- alterar manualmente un monto para hacer coincidir totales;
- confiar en un PDF/Excel sin contrastarlo con la pantalla.

## 5. Interactividad y edición

Pendientes para Academia/prototipo:

- checklist interactivo Admin/Operativo;
- caso práctico con 44 visitas, 42 vínculos exactos y 2 revisiones;
- glosario clickeable;
- preguntas de validación;
- manual y curso como objetos distintos;
- versión del contenido asociada al cambio financiero R23;
- notificación a roles afectados cuando se publique;
- revisión humana antes de publicar cualquier borrador asistido por IA.

## 6. Evidencia técnica de referencia

- Run `30074835544`.
- Artifact `8589444193`.
- Digest `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.

## 7. Estado seguro

Documento únicamente. No activa Academia runtime, Gemini, notificaciones, Hosting, producción, importaciones ni pagos.
