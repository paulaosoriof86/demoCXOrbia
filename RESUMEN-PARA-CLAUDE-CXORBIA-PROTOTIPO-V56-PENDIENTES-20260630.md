# RESUMEN-PARA-CLAUDE-CXORBIA-PROTOTIPO-V56-PENDIENTES-20260630

## Contexto

Paula compartió el ZIP `Prototype development request CXOrbia V56.zip` y la bitácora `CAMBIOS-PROTOTIPO.md`.

La rama backend/migración en GitHub sigue siendo:

```text
feat/firebase-backend-dev-config-20260627
```

Esta rama es de backend/migración a Firebase DEV, no es la rama limpia del prototipo. Por esa razón, el ZIP completo V56 no debe importarse sobre esta rama.

## Backend DEV ya completado

- Firebase DEV: `cxorbia-backend-dev`.
- Tenant: `tya`.
- Reglas Firestore DEV publicadas.
- Auth DEV ficticio creado.
- HR histórico V4 cargado.
- `shopperBenefits` calculados cargados en Firestore DEV.
- Resultado carga beneficios: estado OK.
- Registros escritos: 572.
- GT: 441 beneficios.
- HN: 131 beneficios.
- Batches ejecutados: 2.

## Alcance respetado

- No se marcaron pagos reales.
- No se escribieron `paymentLots`.
- No se escribieron `financialMovements`.
- No se escribieron `reconciliations`.
- No se publicó Hosting.
- No se tocó producción.
- No se hizo merge.
- No se modificó `/app/modules`.

## Actualización prototipo V56 revisada

1. Manuales: fix crítico para que Manual Maestro abra correctamente a pantalla completa.
2. Temas: nuevos estilos corporativos gris oscuro, gris claro, índigo y teal.
3. Documentos pasa conceptualmente a Recursos del proyecto.
4. Recursos: visor pantalla completa con PDF, imagen y video embebidos.
5. Academia: lecciones tipo documento embebido.
6. Recursos y Academia: generación/mejora con IA usando `CX.ai.ask`.
7. Importador: iterar/refinar análisis IA con instrucciones del usuario.
8. Finanzas: pago de lote genera egreso por shopper, no movimiento consolidado genérico.
9. Cuestionario interno: al enviarse sincroniza estado de visita a `cuestionario/submit`.
10. IA multi-proveedor y `CX.ai.ask` siguen siendo base del prototipo.

## Pendientes para rama limpia del prototipo

- Importar o reconciliar V56 únicamente sobre una rama limpia del prototipo.
- Validar que el fix de Manual Maestro no dependa de cambios backend de esta rama.
- Revisar estilos corporativos nuevos sin mezclar cambios de Firebase DEV.
- Mapear el cambio conceptual de Documentos a Recursos del proyecto.
- Validar visor pantalla completa para PDF, imagen y video embebidos.
- Validar lecciones de Academia como documento embebido.
- Confirmar que Recursos y Academia usen `CX.ai.ask` sin activar adapter global en esta rama backend.
- Revisar el flujo de iteración/refinamiento IA del Importador.
- Revisar el ajuste de Finanzas para egresos por shopper en rama prototipo, sin marcar pagos reales desde esta rama.
- Validar sincronización del cuestionario interno con estado de visita `cuestionario/submit`.

## No aplicar en esta rama

- No importar el ZIP completo V56 sobre `feat/firebase-backend-dev-config-20260627`.
- No conectar app principal.
- No activar adapter global.
- No modificar `/app/modules`.
- No modificar `/app/core` del prototipo.
- No publicar Hosting.
- No hacer deploy.
- No hacer merge.
- No tocar producción.
- No tocar datos reales.
