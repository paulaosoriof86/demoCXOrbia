# CXOrbia — probe read-only de 2 excesos HR/Firestore

- Fecha: 2026-07-29T23:33:12.081Z
- Proyecto Firebase: `cxorbia-backend-dev`
- Modo: read-only; provider writes=0; sin nombres/emails/teléfonos/documentos.

## cinepolis-abril-26

- Esperado: 34; observado: 35; delta: +1.
- sourceRow presentes/únicos: 35/35; rango 0..35.
- Duplicados sourceRow: ninguno.
- Gaps sourceRow: 1.
- Duplicados sourceKey: ninguno.
- Source sheets: ABRIL 26.
- Mapa sourceRow→documentId: 2:hr-94466495d87a0d3d, 3:hr-fb3a347bd3a7ed85, 4:hr-6d0d3d40b8b3d381, 5:hr-862c23e646605e28, 6:hr-6a2298bd05ee88bc, 7:hr-8cb24d032fc4a44f, 8:hr-1508cd6cd58d6836, 9:hr-ac7e44dfcbf18de8, 10:hr-201a235fb3b22a37, 11:hr-7d0083dcba89148e, 12:hr-4e08d5f53c2966a5, 13:hr-f1f77dd7775744d2, 14:hr-019164f5d22fc032, 15:hr-6dbf99069903295c, 16:hr-1dfb5d65ad2ed210, 17:hr-2083745ba8c8a0ec, 18:hr-05e72ed19d9d5c57, 19:hr-f34e2fb28be887c8, 20:hr-2d5532fdb2b8302d, 21:hr-6e45241ffe5a9880, 22:hr-169f606288372023, 23:hr-ef26fcd2f3148823, 24:hr-42875a99acff1123, 25:hr-658e4703ffa3e308, 26:hr-f79c65b40b34571c, 27:hr-577e06288974050e, 28:hr-14dfad39f7fbedc8, 29:hr-5823f5744d6793a3, 30:hr-b562720e4f1082bb, 31:hr-cb9a62a79d186be5, 32:hr-0190796980c3585a, 33:hr-215f5f816f5c9b6e, 34:hr-7420e6bd4a8deb96, 35:hr-27fbb39acb6543e6, null:sprint5-visit-mutation-no-real-data.
- Registros con shopperId: 35.

## cinepolis-junio-26-hn

- Esperado: 10; observado: 11; delta: +1.
- sourceRow presentes/únicos: 11/11; rango 2..12.
- Duplicados sourceRow: ninguno.
- Gaps sourceRow: ninguno.
- Duplicados sourceKey: ninguno.
- Source sheets: JUNIO 26 HN.
- Mapa sourceRow→documentId: 2:hr-a0b66347030dc42b, 3:hr-074e8762c5ef6e7a, 4:hr-263956c31dab71bd, 5:hr-6697d557acb579b3, 6:hr-cbcf3f481473da98, 7:hr-bb069c82c275d882, 8:hr-02ad5397e4106202, 9:hr-ed4a63cafe53712d, 10:hr-fc81c63167fa1de0, 11:hr-efdd1b6c1c01f566, 12:hr-58fb469666080189.
- Registros con shopperId: 11.

## Conclusión

`TWO_OVERAGES_LOCATED__REVIEW_STABLE_KEYS_BEFORE_ANY_WRITE`

No se borra ni modifica nada con este probe. Cualquier corrección requiere contraste con HR/source lock y autorización de write.
