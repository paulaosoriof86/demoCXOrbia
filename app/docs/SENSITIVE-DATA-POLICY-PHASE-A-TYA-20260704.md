# Sensitive data policy Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque backend recomendado antes de cualquier lectura local de fuentes reales: politica consolidada de datos sensibles para banco, DPI/documentos, NDA, correo, WhatsApp, adjuntos y evidencias privadas.

Este bloque no autoriza import real, Firestore real, Storage real, correo real, Make, Gemini ni pagos. Solo define el gate y el validador documental.

## Archivos creados

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `tools/migration/tya-sensitive-data-policy-validator.mjs`

## Politica Phase A

Para Phase A, los datos sensibles deben quedar excluidos, tokenizados o referenciados de forma opaca hasta que existan:

1. reglas Firestore/Storage revisadas;
2. claims/roles confirmados;
3. rutas privadas por tenant;
4. proceso de autorizacion explicito;
5. decision de cifrado o exclusion;
6. auditoria de acceso por rol.

## Categorias sensibles

### Identidad

- DPI/documentos;
- pasaporte;
- NIT/tax id;
- direccion completa;
- fecha de nacimiento;
- firma.

### Banco/pagos

- banco;
- cuenta;
- numero de cuenta;
- IBAN/SWIFT si aplica;
- credenciales o datos de pago;
- documentos bancarios.

### Legal

- NDA firmado;
- contrato firmado;
- imagen de firma;
- escaneos legales.

### Contacto

- correo personal crudo;
- telefono crudo;
- WhatsApp crudo;
- direccion cruda.

### Comunicaciones

- cuerpo crudo de correo;
- cuerpo crudo de WhatsApp;
- audio crudo;
- grabaciones.

### Adjuntos/evidencias privadas

- adjuntos crudos;
- escaneos de identidad;
- constancias bancarias;
- NDA firmado;
- evidencias privadas no sanitizadas.

## Permitido en preview operativo

Solo campos operativos minimos, sin datos privados crudos:

- `tenantId`;
- `projectId`;
- `shopperId`;
- nombre visible o alias;
- pais/ciudad;
- estado;
- certificacion;
- visita/HR row;
- asignacion;
- periodo/quincena;
- montos operativos sin banco;
- moneda;
- referencias opacas como `sourceSafeRef` o `sourceLockRef`.

## Prohibido en repo

No subir al repo:

- exports HR crudos con columnas sensibles;
- datos bancarios;
- documentos de identidad;
- NDA firmados;
- conversaciones crudas;
- adjuntos privados;
- recibos reales con informacion bancaria;
- API keys o secretos.

## Firestore/Storage futuro

Las rutas privadas futuras quedan documentadas, pero no habilitadas.

Antes de habilitar se requiere:

- reglas por tenant y rol;
- claims Auth;
- revision de acceso shopper/admin/finance;
- no exponer URLs publicas;
- signed URLs o control de acceso equivalente;
- auditoria de acceso.

## Correo y comunicaciones

Para Phase A:

- no almacenar cuerpos crudos de correo/WhatsApp;
- permitir trazabilidad con referencias opacas;
- mantener proveedor agnostico;
- usar fallback manual cuando el proveedor real no este conectado;
- no prometer envio real si solo existe preview o registro local.

## Gemini/IA

Gemini no debe procesar documentos crudos sensibles hasta que exista un proceso aprobado de redaccion/sanitizacion, revision humana y gate explicito.

## Uso del validador

Sin input:

```bash
node tools/migration/tya-sensitive-data-policy-validator.mjs
```

Con input sintetico/sanitizado:

```bash
node tools/migration/tya-sensitive-data-policy-validator.mjs --input path/to/source-safe-preview.json
```

El input seguro debe incluir:

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "rows": []
}
```

Si aparecen nombres de campos sensibles, el validador debe devolver `review_required`.

## Pendientes backend derivados

1. Revisar reglas Firestore/Storage privadas antes de habilitar cualquier escritura real.
2. Definir si datos privados se excluyen, cifran o guardan en rutas restringidas.
3. Preparar redaccion/sanitizacion para cualquier fuente real futura.
4. Integrar esta politica con validators de liquidaciones, shopper history, email y CRM.
5. Mantener Make/Gemini/correo real apagados hasta payloads seguros.

## Pendientes Claude/prototipo

1. No mostrar campos bancarios, documentos, NDA ni adjuntos privados en vistas shopper.
2. En Admin, diferenciar dato disponible, dato protegido, dato pendiente de autorizacion y dato no cargado.
3. Mostrar estados honestos: `protegido`, `pendiente backend`, `requiere autorizacion`, `referencia privada`.
4. En Mis beneficios, mostrar montos y estados sin datos bancarios.
5. En correo/comunicaciones, mostrar trazabilidad sin cuerpos crudos ni adjuntos privados.
6. En Academia, explicar politica de datos sensibles por rol.

## Impacto Academia

Academia debe crear o actualizar:

- curso Admin: manejo de datos protegidos;
- curso Ops: import seguro y revision manual;
- curso Finanzas: pagos sin exponer banco;
- curso Shopper: privacidad y que datos se muestran;
- manual: que nunca se sube al repo;
- checklist: antes de importar fuente;
- checklist: antes de mostrar datos al shopper;
- glosario: sourceSafe, referencia opaca, dato protegido, dato privado, dato visible.

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
