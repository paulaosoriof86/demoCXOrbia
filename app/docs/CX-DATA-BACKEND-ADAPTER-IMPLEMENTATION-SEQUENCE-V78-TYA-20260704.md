# CX.data backend adapter implementation sequence V78 TyA

Fecha: 2026-07-04

## Proposito

Definir la secuencia tecnica para pasar del scaffold inactivo al adapter futuro sin romper el prototipo V78.

## Secuencia

### Fase 1 - Inventario cerrado

- Mantener `CX-DATA-INTERFACE-INVENTORY-V78-TYA-20260704.md` como fuente de verdad.
- No agregar metodos sin confirmar uso real.
- Si V79 o superior llega, auditar contra V78 antes de cambiar esta lista.

### Fase 2 - Compatibilidad

- Usar `backend-adapter.compat.v78.disabled.js` como mapa de forma.
- Confirmar entradas y salidas por metodo.
- Mantener fallback seguro.

### Fase 3 - Adapter inactivo

- Mantener `backend-adapter.v78.disabled.js` sin importarlo.
- No reemplazar `CX.data` todavia.
- No usar credenciales ni SDK real.

### Fase 4 - Punto unico de conexion

- Definir un solo archivo de conexion futuro.
- No cambiar modulos.
- No reescribir core existente salvo autorizacion explicita del punto unico.

### Fase 5 - Backend DEV preview

- Conectar solo lecturas preview.
- Mantener escrituras bloqueadas o bajo autorizacion preview especifica.
- Mantener source selector visible para soporte.

### Fase 6 - Validacion funcional

- Validar dashboard.
- Validar visitas.
- Validar postulaciones.
- Validar shoppers.
- Validar seleccion de proyecto.
- Validar fallback local.

## Hard stops

- No produccion.
- No Auth real.
- No Storage evidence.
- No Make notifications.
- No pagos finales.
- No estados operativos finales.
- No cambios visuales desde backend.

## Estado

- Secuencia documental.
- Sin cambios visuales.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
