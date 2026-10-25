# CXOrbia — reconciliación Phase A del backend canónico DEV

- Fecha: 2026-07-29T23:19:42.490Z
- Proyecto: `cxorbia-backend-dev`
- Decisión: `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`
- Modo: solo lectura; provider writes=0; sin PII.

## Verdad esperada Phase A

- Periodos: junio 2025 a julio 2026 = 14.
- Cada periodo: GT 34 + HN 10 = 44 visitas.
- Total canónico esperado: 616 visitas.

## Reconciliación

- Proyectos canónicos esperados: 28.
- Proyectos canónicos encontrados: 26.
- Proyectos canónicos faltantes: 2: cinepolis-julio-26, cinepolis-julio-26-hn.
- Visitas observadas en proyectos canónicos encontrados: 574.
- Visitas esperadas para esos mismos proyectos: 572.
- Desviaciones de conteo: cinepolis-abril-26 35/34 (+1); cinepolis-junio-26-hn 11/10 (+1).
- Proyectos no canónicos/piloto: 3: julio-pilot(1 visitas), r1(36 visitas), tya-piloto(8 visitas).
- Visitas no canónicas/piloto: 45.
- Total Firestore observado: 619.

## Shoppers y certificaciones

- Shoppers ya existentes en backend canónico: 215.
- Colecciones de certificaciones materializadas: 0.
- Shoppers con campos embebidos de certificación/curso/Academia: 0.
- Resultado: certificaciones legacy deben refrescarse de forma dirigida; shoppers legacy deben compararse contra los existentes, no recrearse.

## Implicación operativa

- Faltan 44 visitas canónicas correspondientes a los proyectos faltantes, antes de considerar desviaciones.
- Hay 2 visita(s) de exceso dentro de proyectos canónicos encontrados que deben revisarse por llave HR/sourceRow antes de cualquier write.
- Si se resuelven esos excesos y se incorporan los proyectos faltantes con sus conteos esperados, el histórico canónico queda en 616 visitas, que coincide con el source lock de 616.
- Las 45 visitas de proyectos piloto/no canónicos no se borran por inferencia; quedan separadas para revisión y no deben confundirse con histórico HR canónico.

## Seguridad

- Firestore/Auth/Storage/Rules/Hosting writes: 0.
- Producción/merge: false.
- Ninguna identidad shopper ni valor sensible fue exportado.
