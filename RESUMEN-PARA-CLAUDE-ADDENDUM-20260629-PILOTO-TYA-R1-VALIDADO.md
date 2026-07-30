# RESUMEN-PARA-CLAUDE-ADDENDUM-20260629-PILOTO-TYA-R1-VALIDADO

## Contexto

Se completo la ruta de prueba de migracion T&A hacia Firestore DEV, pasando por normalizacion, transformacion, carga piloto y preview local controlado.

## Resultado actual

Paula confirmo que el preview local del piloto T&A `r1` quedo funcionando correctamente.

## Pipeline completado

1. Export T&A colocado en ruta local privada.
2. Inspeccion de estructura: export tipo mapa.
3. Normalizacion a arrays intermedios.
4. Validacion normalizada exitosa.
5. Transformacion al modelo Firestore.
6. Inspeccion de calidad.
7. Carga piloto DEV autorizada.
8. Lectura posterior Firestore DEV validada.
9. Preview local controlado r1 funcionando.

## Conteos Firestore DEV del piloto

- `visits_r1`: 36.
- Paises: GT 33, HN 3.
- Shoppers del piloto: 26.
- Visitas con shopper: 36.
- Visitas sin shopper: 0.
- Estado migrado: `disponible` 36.

## Restricciones conservadas

- No Hosting.
- No produccion.
- No merge.
- No adapter global.
- No Storage/evidencias.
- No cambios en `/app/modules`.

## Pendientes para Claude/frontend

- Revisar PWA: boton de instalar como app debe disparar instalacion directa cuando el navegador lo permita y usar favicon/logo del cliente o tenant activo.
- Corregir o terminar modulos incompletos del prototipo, especialmente `Configuracion`, sin romper el punto de conexion backend.
- Si se actualiza la base frontend, repetir preview local r1.

## Pendientes backend/migracion

- Mejorar mapeo de estados historicos: por ahora las 36 visitas quedaron `disponible`.
- Decidir si se limpia DEV antes de validacion final, porque ahora conviven seed previo y piloto `r1`.
- Antes de carga amplia, ampliar por lotes y validar conteos en cada lote.
