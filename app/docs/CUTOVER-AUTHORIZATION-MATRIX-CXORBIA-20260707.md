# Cutover authorization matrix - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se intento crear un script de contrato para autorizaciones de cutover, pero la llamada fue bloqueada por controles de seguridad de la herramienta.

No se afirmara que ese script quedo creado.

Como alternativa segura, se crea esta matriz documental para dejar clara la ruta de cierre y las autorizaciones necesarias.

## Objetivo

Separar con precision que esta autorizado, que esta preparado y que requiere autorizacion distinta antes de moverse a un nivel superior.

## Niveles de movimiento

### 1. Staging preview

Estado: autorizado previamente por Paula para preview/staging controlado con integraciones apagadas.

Requiere:

- gates en verde;
- workflow staging disponible;
- URL de staging confirmada;
- smoke post-staging.

### 2. Produccion demo controlada

Estado: no autorizado todavia.

Requiere:

- staging validado;
- smoke post-staging aprobado;
- copy honesto confirmado;
- decision explicita de Paula.

### 3. Produccion real operativa

Estado: no autorizado.

Requiere autorizacion separada y documento especifico.

No se debe asumir por autorizacion de staging.

### 4. Merge final

Estado: no autorizado.

Requiere autorizacion separada y revision final de PR.

### 5. Integraciones reales

Estado: no autorizado.

Requiere autorizacion separada por proveedor y gate.

### 6. Import real

Estado: no autorizado.

Requiere fuente limpia validada, dry-run y autorizacion separada.

## Que necesito de Paula

No necesito revision de logica ahora.

Solo necesito accion de Paula si:

- aparece URL de staging;
- el workflow de staging falla;
- falta configuracion externa del workflow;
- Paula decide autorizar produccion demo, produccion real, merge final, integraciones reales o import real.

## Clasificacion del bloque

### Reusable CXOrbia

La matriz es reusable para futuros clientes como regla de cutover por niveles.

### Exclusivo cliente

No contiene logica exclusiva del cliente actual.

### Claude/prototipo

No cambia UI. Puede informar a Claude que los estados de movimiento deben ser visibles y honestos: staging, demo controlada, produccion real, integraciones e import.

### Academia

Academia debe explicar a administradores la diferencia entre preview/staging, demo controlada, produccion real e integraciones reales cuando afecte su rol.

### Sin impacto Claude

No hay cambio visual directo.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
