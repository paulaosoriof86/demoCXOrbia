# I3 — lectura compartida y refresco manual: entrega paralela

**Estado: HOLD.** Este paquete publica un correctivo mínimo probado, su captura MODULE_TRUTH y la revisión del consumo de lectura. No cambia la fuente activa, los controles, el transporte F3 ni una ejecución en curso.

## Estado incorporado de Work

El control `6fe5b16f2f4664d58b396767cca204b5d772ad75` admite la fuente compartida `ca94622046360c0122b79e8c4a27e2d72277277e` y conserva servido `d727f3be67a4430f08216dbb37cccba790f934f5`, runtime `00393-p54`, Hosting `607182bc22875d48`. La fuente compartida tiene 280 pruebas PASS y continúa pendiente de publicación DEV. No elimina todavía Make del transporte de lectura.

El F3 reducido está implementado en `fb7f80287f81691338fd868fc36881fc84781e0e`, con 267 pruebas técnicas PASS. La orden vigente conserva ese productor QA para la pareja d727 servida, con 250 créditos de recorrido y 100 de reserva. Su recibo de implementación no acredita todavía ACK remoto. Mantener la regla existente de sellar las pruebas activas antes de cambiar runtime y Hosting.

## Correctivo exacto listo

Owner de producto: `app/modules/visitas.js`, únicamente handler `vRefreshHR`. Owner de prueba: `tools/qa/cxorbia-i3-work-uat-a09b11-hr-admin-reconcile.test.mjs`. El bridge de autoridad permanece byte idéntico.

El botón **Actualizar desde HR** omitía `forceFresh` y anunciaba **HR viva actualizada** al recibir `ok:true`, incluso cuando la autoridad devuelta indicaba `externalReadCurrent:false`. El parche pide lectura fresca, exige autoridad aplicada y revisión coincidente, conserva el período histórico solicitado y usa un mensaje distinto para proyectos internos.

- [Scope y hashes](CXORBIA_I3_MANUAL_HR_REFRESH_SCOPE_20261125.json).
- [MODULE_TRUTH previo](CXORBIA_I3_MANUAL_HR_REFRESH_MODULE_TRUTH_20261125.json).
- [Parche de los dos owners](CXORBIA_I3_MANUAL_HR_REFRESH_PATCH_20261125.patch).
- [Prueba antes/después y 14 regresiones PASS](CXORBIA_I3_MANUAL_HR_REFRESH_PROOF_20261125.json).
- [Reproducción portátil](CXORBIA_I3_MANUAL_HR_REFRESH_PROOF_20261125.mjs).

La reproducción materializa los tres archivos fijados desde Git en un directorio temporal, aplica el parche sólo allí y ejecuta las pruebas. Desde la raíz del repositorio:

```bash
node docs/checkpoints/CXORBIA_I3_MANUAL_HR_REFRESH_PROOF_20261125.mjs .
```

La prueba es offline: handler y constructor reales, respuestas de autoridad simuladas. No certifica DEV, F3 ni persistencia externa. El parche **no está aplicado a la candidata ni desplegado**. El owner actual de visitas todavía coincide con su baseline `269ed1cfe8eb7c5f1f740f38af4d46217468e446`; no hay colisión con los cuatro owners de ca946220.

## Incorporación sin reiniciar

Al serializar la siguiente admisión de fuente, incorporar únicamente este delta probado mediante el carril existente y conservar la reparación compartida ca946220. La fuente nueva sigue siendo sucesora de la misma candidata. Conservar el productor y los recibos de cualquier F3/build ya despachado hasta consumirlos; no cambiar sus pins durante la ejecución. Si la publicación compartida aún no fue despachada, el escritor responsable puede componer ambos deltas y registrar la identidad exacta antes de publicarlos. Una publicación en curso debe terminar y conservar su evidencia.

No volver a ejecutar PASS aceptados por la existencia de este checkpoint. La comprobación nueva del botón debe acreditar lectura externa realmente fresca, misma revisión publicada y preservación de ámbito. No retirar ACK, lectura independiente, idempotencia ni restauración del F3.

## Lectura y coste

La revisión separa la lectura de la escritura. Legacy sirve un lector directo de Google Sheets y un intervalo de cinco minutos. Recovery usa Excel original y reutiliza la conexión delegada OneDrive de Make que ya tenía acceso. Esa elección no es una obligación de Firebase ni una prueba de coste óptimo.

La reparación ca946220 comparte el refresco entre sesiones, manteniendo cinco minutos. Una lectura directa autenticada de Microsoft evitaría créditos Make para ese transporte; sigue pendiente validar su acceso y renovación. La prueba de una identidad SharePoint existente devolvió 403 para el libro original y no permite afirmar que Graph sea imposible. La inspección no leyó credenciales.

El intervalo compartido se activa por peticiones de sesiones elegibles. No existe aquí una garantía de actualización autónoma cuando no hay clientes visibles. Tampoco se certifica push por celda ni latencia Excel→UI.

[Revisión económica explicada](CXORBIA_I3_HR_READ_ECONOMICS_20261125.md) · [Datos, supuestos y fuentes](CXORBIA_I3_HR_READ_ECONOMICS_20261125.json).

**Continuidad:** I3, HOLD. Producto raíz modificado por este paquete: ninguno. Evidencia nueva: comparación Legacy/Recovery, coste condicional, acceso directo puntual y correctivo manual de dos archivos con 14 PASS. F3 y publicación compartida continúan por la orden vigente; no se compra capacidad ni se ordena el recorrido completo de 1.184 créditos. Producción sigue sujeta a I3 GO e I4 sobre el artefacto exacto.
