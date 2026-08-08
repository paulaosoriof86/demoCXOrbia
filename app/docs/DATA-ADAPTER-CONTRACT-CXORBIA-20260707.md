# Data adapter contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para la interfaz del data adapter CXOrbia.

Archivo creado:

- `tools/contracts/cxorbia-data-adapter-interface-contract.mjs`

## Objetivo

Preparar el cambio futuro desde almacenamiento local hacia backend real sin romper los modulos del prototipo.

El contrato define una interfaz comun para adapters y mantiene separacion entre UI, adapter y backend.

## Metodos requeridos

- `list`
- `get`
- `set`
- `update`
- `remove`
- `query`
- `transaction`

## Adapters considerados

- `localStorage`: estado actual local.
- `firestore`: backend futuro apagado por gate.
- `mockStaging`: preview para pruebas controladas.

## Reglas clave

- Todos los adapters deben preservar la misma interfaz.
- Firestore queda apagado hasta autorizacion y evidencia.
- El punto de conexion debe ser unico y controlado.
- Los modulos UI no deben cambiar para adaptarse al backend.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para futuros clientes porque separa UI, adapter y backend real.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

No cambia UI, pero Claude debe mantener la interfaz de datos estable y no introducir dependencias directas a backend dentro de modulos.

### Academia

Sin cambio funcional directo.

### Sin impacto Claude

No hay cambio visual directo.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Firestore real, sin imports, sin lectura de secrets y sin datos sensibles.
