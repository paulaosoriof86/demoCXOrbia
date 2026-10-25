# CXOrbia - Seed piloto ficticio V58 cargado DEV

## 2026-07-01 03:51:27 - Rules DEV publicadas y seed piloto ficticio V58 cargado
- ARCHIVO: firestore.rules
- TIPO: publicado en Firebase DEV
- QUE CAMBIO: se publicaron reglas Firestore V58 unicamente en Firebase DEV cxorbia-backend-dev.
- POR QUE: el seed V58 habia quedado parcialmente bloqueado por PERMISSION_DENIED en tenant root, periods, applications y shopperStats.
- ARCHIVO: firebase/seeds/cxorbia-v58-tya-julio-pilot-seed.json
- TIPO: carga DEV controlada
- QUE CAMBIO: se reintento la carga del seed piloto ficticio V58 despues de publicar rules DEV.
- IMPACTO EN FRONTEND: ninguno directo. No se tocaron /app/modules por este paso.
- RESTRICCIONES: no Hosting, no produccion, no Orbit, no datos reales, no secretos impresos.
- PENDIENTE: smoke read-only contra Firestore y validacion preview/backend con tenant tya.