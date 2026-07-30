# Firebase DEV

Esta carpeta contiene insumos para pruebas controladas del backend nuevo.

## Archivos

- `seed-tya-piloto.json`: dataset ficticio y anonimizado para probar la estructura Firestore del tenant `tya`.

## Uso previsto

El archivo de seed no se importa automáticamente. Sirve como referencia para cargar manualmente o con script posterior la estructura mínima del piloto.

## Restricciones

- No usar datos reales en esta fase.
- No cargar evidencias ni documentos privados.
- No conectar la base anterior como backend vivo.
- No desplegar a `tya-plataforma.web.app` sin autorización.
- Mantener T&A como tenant, no como lógica fija del prototipo.

## Validación esperada

Antes de activar `CX.BACKEND.enabled`, verificar:

1. Reglas Firestore revisadas.
2. Tenant `tya` creado.
3. Proyecto `tya-piloto` creado.
4. Visitas y evaluadores piloto cargados.
5. Usuario admin DEV listo.
6. Storage sigue cerrado mientras esté pendiente por Blaze.
