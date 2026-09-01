# R17N FINAL — plan actual hasta julio · NO EXECUTE

- Referencias shopper actuales: 208/208 con target.
- 201 reutilizan shopper canónico existente; 2 enlazan perfil legacy a crear; 5 crean perfil desde identidad real HR vigente.
- Perfiles legacy create: 120; perfiles HR current create: 5.
- Certificaciones create: 77; hold: 1.
- Visitas: 616/616 listas.
- Controles liquidación: 572/572 listos; pagos=0.
- Writes listos exactos: 1406.
- Firestore/Auth/Storage/HR/provider writes ejecutados: 0.
- Deploy/merge/producción: 0.

- Idempotence hash: f03cd3e5c225cac80525329c8c09775bd3dbbf24ace025b7a30f77c219404e2e PASS.
- Siguiente gate: autorización explícita por grupos/conteos exactos; antes de los 5 perfiles HR-only se revalida la misma fuente viva en memoria.
