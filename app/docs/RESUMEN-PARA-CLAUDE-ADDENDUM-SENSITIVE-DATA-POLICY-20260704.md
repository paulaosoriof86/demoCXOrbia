# Resumen para Claude addendum - Sensitive data policy Phase A

Fecha: 2026-07-04

## Que hizo backend

Backend preparo una politica consolidada de datos sensibles antes de cualquier lectura o import real de fuentes.

Archivos agregados:

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `tools/migration/tya-sensitive-data-policy-validator.mjs`
- `app/docs/SENSITIVE-DATA-POLICY-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-SENSITIVE-DATA-POLICY-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-SENSITIVE-DATA-POLICY-20260704.md`

No se activo runtime, no se leyeron fuentes reales, no se escribio Firestore/Storage/HR y no se conecto Make/Gemini/correo real.

## Que debe reflejar Claude en el prototipo

1. No mostrar banco, documentos, NDA, adjuntos privados ni cuerpos crudos de comunicacion en vistas shopper.
2. En vistas admin, diferenciar:
   - dato visible;
   - dato protegido;
   - pendiente backend;
   - requiere autorizacion;
   - referencia privada/opaca.
3. Mis beneficios debe mostrar montos y estados sin informacion bancaria.
4. Correo/comunicaciones debe mostrar trazabilidad sin cuerpo crudo ni adjuntos privados.
5. Cuando una integracion este apagada, no prometer que Make, Gemini, correo, WhatsApp o Storage hicieron una accion real.
6. Si una fuente contiene datos sensibles, debe quedar como revision manual o pendiente de sanitizacion.

## Textos recomendados

Usar:

- `dato protegido`;
- `referencia privada`;
- `pendiente backend`;
- `requiere autorizacion`;
- `preview seguro`;
- `fuente sanitizada`;
- `revision manual`.

Evitar:

- `documento cargado` si no hay Storage real;
- `correo enviado` si no hay proveedor real;
- `WhatsApp enviado` si no hay envio real;
- `sincronizado` si no hay Make/HR real;
- `pago realizado` si no hay confirmacion real.

## Academia que debe actualizarse

Crear/profundizar:

1. Curso Admin: manejo de datos protegidos.
2. Curso Ops: import seguro y revision manual.
3. Curso Finanzas: pagos sin exponer banco.
4. Curso Shopper: privacidad y que datos ve/no ve.
5. Manual: que nunca se sube al repo.
6. Checklist antes de importar fuente.
7. Checklist antes de mostrar datos al shopper.
8. Checklist antes de activar integracion.
9. Glosario: sourceSafe, isSyntheticOrSanitized, containsRawSensitiveData, referencia opaca, dato protegido, dato visible, manual_review_required, gate.

## Lo que Claude no debe tocar

- `tools/migration`.
- `app/contracts`.
- Firestore/Storage/Auth rules.
- Make/Gemini/correo real.
- Import real.
- Datos reales.
- Backend gates.

## Estado seguro

Este bloque es documental/validator. No autoriza produccion, deploy, import real, Firestore, Storage, HR writes, Make, Gemini, correo real, WhatsApp real ni pagos.
