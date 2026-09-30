# Auditoria de revalidacion candidata actual Claude

Fecha: 2026-07-05

## Motivo

Claude recupero capacidad. Antes de enviar nuevo paquete correctivo, se revalido la candidata actual entregada por Paula contra el paquete inmediatamente anterior y contra los pendientes vivos.

## Resultado tecnico

- Archivos app candidata previa: 97.
- Archivos app candidata actual: 97.
- Agregados: 0.
- Eliminados: 0.
- Modificados frente al paquete previo: 3.
- Modificados: `modules/academia.js`, `modules/dashboard.js`, `modules/misvisitas.js`.
- JS revisados con `node --check`: 61.
- Fallas JS: 0.
- Scripts en `index.html`: 61.
- Scripts locales: 59.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.

## Decision

La candidata actual sigue siendo baseline auditada de continuidad backend, no source lock final ni produccion. Si vale la pena pedir a Claude una correctiva ahora, porque ya hay suficientes pendientes concretos, auditados y respaldados por nuevos bloques backend.

## Pendientes P0 aun vivos

1. `modules/cuestionario-shopper.js`: aun dice `marca la visita como cuestionario enviado`.
2. `modules/postulaciones.js`: aun contiene `HR sincronizada`.
3. `modules/postulaciones.js`: aun contiene `WhatsApp enviado`.
4. `modules/dashboard.js`: aun contiene un estado de `WhatsApp enviado`.
5. `modules/dashboard.js`: aun contiene `Correo enviado a ... shopper(s)`.
6. `modules/academia.js`: aun contiene `Sincronía automática`, `sincroniza la HR externa` y `mueve la liquidación`.
7. `modules/correo.js` y `core/topbar.js` tienen textos de correo enviado que deben revisarse con la regla de provider/mailbox gate.

## Senales de backend reciente aun no reflejadas en prototipo

- `availableFrom`: 0.
- `outboxStatus`: 0.
- `mailboxId`: 0.
- `formVersion`: 0.
- `externalFolderRef`: 0.
- `crmEntityId`: 0.

## Bloques backend nuevos que Claude debe incorporar semanticamente

1. Shopper communication history preview.
2. Shopper ranking/scoring preview.
3. Project/tenant rule versioning preview.
4. Rule change changelog/notification preview.
5. Release readiness snapshot preview.
6. Synthetic pack preview.

## Instruccion para Claude

Claude debe trabajar sobre la ultima baseline auditada, no sobre una version anterior. Debe corregir P0 sin tocar `app/contracts` ni `tools/migration`, conservar mejoras ya aceptadas y mantener estados honestos: preview, pending backend, provider pending, draft, manual review, blocked y gate off.

## Estado seguro

Reauditoria local/documental. Sin cambios frontend aplicados por backend, sin deploy, sin merge, sin produccion, sin import real, sin escrituras reales, sin proveedores reales y sin datos sensibles.
