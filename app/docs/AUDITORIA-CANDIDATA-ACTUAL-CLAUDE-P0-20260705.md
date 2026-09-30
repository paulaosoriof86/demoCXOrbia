# Auditoria candidata actual Claude P0 - CXOrbia TyA

Fecha: 2026-07-05

## Candidata auditada

Archivos locales revisados:

- `Prototype development request CXOrbia V86.zip`
- `Prototype development request CXOrbia V87.zip`

Resultado: V87 y V86 tienen el mismo contenido en `/app`.

## Resultado tecnico

- Archivos `/app`: 97 vs 97.
- Agregados: 0.
- Eliminados: 0.
- Modificados: 0.
- Scripts en `index.html`: 61 total, 59 locales, 2 externos.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.
- JS total: 61.
- `node --check`: 0 errores.
- JS no cargados por `index.html`: `docs/migration/sample-fields.js`, `sw.js`.
- Mojibake detectado: 1 linea documental intencional en `docs/AUDITORIA-ENTREGA-CLAUDE.md`.

## Decision de auditoria

La candidata actual no debe convertirse en source lock porque no corrige P0. Es estable tecnicamente, pero conserva textos y promesas operativas que aparentan envios, sincronias o automatizaciones reales.

Clasificacion: `manual_review_required` con P0 critico pendiente.

## P0 critico vivo

Claude debe corregir solo textos/avisos que prometen operacion real sin backend activo:

1. `modules/postulaciones.js`
   - Evitar `WA enviado al shopper`.
   - Evitar `WhatsApp enviado`.
   - Evitar `HR sincronizada`.
   - Evitar `Solicitud enviada ... WhatsApp` si no hay envio real.
   - Usar textos tipo `notificacion preparada`, `pendiente backend` o `plantilla WhatsApp lista`.

2. `modules/dashboard.js`
   - Evitar `Correo enviado a ... shopper(s) (Make/Outlook)`.
   - Evitar `WhatsApp a ... (Make)` como si enviara.
   - Mantener solo `preparado`, `pendiente backend`, `WhatsApp Web listo` o equivalente.

3. `core/topbar.js`
   - Evitar `Correo enviado a ...`.
   - Cambiar a `Correo guardado/preparado; envio real pendiente backend`.

4. `modules/correo.js`
   - Evitar `Correo enviado` cuando no hay cuenta conectada real.
   - En modo demo usar `guardado en enviados demo` o `preparado; se enviara al conectar cuenta`.

5. `core/automations.js`
   - Cambiar `Cuestionario enviado` a `Cuestionario realizado/completado`.
   - Cambiar `HR actualizada/sincronizado a la HR` a `HR pendiente de sincronizacion backend`.

6. `core/manuales-data.js`
   - Ajustar referencias que prometen WhatsApp, correo, Make o Google Sheets reales.
   - Cambiar `cuestionario enviado` a `cuestionario realizado/completado`.

7. `modules/academia.js`
   - Bajar promesas de `sincronia automatica`, `sincroniza HR externa`, `mueve liquidacion`, notificaciones automaticas y envios reales.
   - Mantener Academia profunda, pero honesta: preparado, configurable o pendiente backend.

8. `core/liquidacion.js`
   - Comentarios deben distinguir `cuestionario realizado` de `submitido`.

## No pedir a Claude ahora

Por capacidad semanal limitada, no pedir:

- redisenos visuales;
- Academia profunda completa;
- P1/P2;
- backend;
- Firestore/Auth/Storage;
- Make/Gemini reales;
- refactor;
- cambios masivos;
- nuevas funcionalidades.

## Criterio de aceptacion

La candidata siguiente solo pasa si:

1. Tiene delta real.
2. Corrige P0 de honestidad operativa.
3. No rompe scripts.
4. No introduce errores de sintaxis.
5. No toca backend.
6. No promete integraciones reales no activas.

## Decision final

Enviar a Claude paquete acumulado critico P0. No source lock. No produccion. No empalme hasta nueva auditoria.
