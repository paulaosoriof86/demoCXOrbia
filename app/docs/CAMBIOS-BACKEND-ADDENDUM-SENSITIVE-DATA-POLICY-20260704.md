# Cambios backend addendum - Sensitive data policy Phase A

Fecha: 2026-07-04

## Bloque completado

Politica consolidada de datos sensibles para banco, documentos/DPI, NDA, correo, WhatsApp, adjuntos y evidencias privadas.

## Archivos creados

1. `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define categorias sensibles, politica Phase A, rutas privadas futuras, restricciones de repo, import, Firestore, Storage, comunicaciones, Gemini y Make.
   - Por que: el tracker recomendaba cerrar politica de datos sensibles antes de cualquier lectura local de fuentes reales.

2. `tools/migration/tya-sensitive-data-policy-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: valida que la politica mantenga gates apagados y revisa opcionalmente inputs sinteticos/sanitizados para detectar nombres de campos sensibles.
   - Por que: bloquea que un preview use campos sensibles antes de autorizacion.

3. `app/docs/SENSITIVE-DATA-POLICY-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta reglas, categorias, permitidos, prohibidos, uso del validador, pendientes backend, pendientes Claude y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-SENSITIVE-DATA-POLICY-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists, glosario y notificaciones de Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Storage writes.
- Sin HR writes.
- Sin Make/Gemini/correo real.
- Sin pagos reales.
- Sin datos sensibles.

## Phase A que avanza

- Permite avanzar con validadores e importadores usando solo fuentes sinteticas/sanitizadas.
- Define que banco, identidad, NDA, comunicaciones crudas y adjuntos privados no entran al repo ni a previews visibles.
- Protege Mis beneficios, liquidaciones, shopper history, correo y CRM antes de cualquier fuente real.

## Pendientes backend derivados

1. Integrar esta politica como gate de validators de assignment sync, shopper history, email, CRM y liquidaciones.
2. Revisar reglas Firestore/Storage privadas antes de autorizar escrituras reales.
3. Definir en futuro si datos privados se excluyen, cifran o guardan en rutas restringidas.
4. Preparar redaccion/sanitizacion de fuentes reales cuando Paula autorice.

## Pendientes prototipo/Claude derivados

1. Mostrar estados honestos: protegido, pendiente backend, requiere autorizacion, referencia privada.
2. No exponer banco, documentos, NDA, cuerpos crudos ni adjuntos privados.
3. Mis beneficios debe mostrar montos/estados sin informacion bancaria.
4. Correo/comunicaciones debe mostrar trazabilidad sin cuerpos crudos.
5. Academia debe incluir curso/manual/checklists/glosario de datos sensibles.

## Siguiente bloque recomendado

Preview validator de assignment sync/conflicts, usando esta politica como gate para rechazar campos sensibles.
