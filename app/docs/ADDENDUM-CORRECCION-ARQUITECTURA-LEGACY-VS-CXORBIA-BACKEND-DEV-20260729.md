# ADDENDUM — Corrección de arquitectura: legacy TyA vs backend DEV de CXOrbia

**Fecha:** 2026-07-29  
**Estado:** ACTIVO, CORRECTIVO Y PREVALENTE PARA LA DISTINCIÓN DE BASES/PROYECTOS

## 1. Corrección de interpretación

La expresión histórica **“base anterior / base vieja”** se refiere a la **plataforma TyA Consultores actualmente operativa y destinada a retiro**, no al proyecto `cxorbia-backend-dev`.

Queda prohibido volver a usar “base anterior” de forma ambigua.

## 2. Identidades correctas

### A. Plataforma legacy TyA Consultores — sistema a retirar
- Es la plataforma actualmente operativa que acumuló parches/fixes y cuya arquitectura no se copiará.
- De ella se recupera únicamente información válida y útil mediante exportación/delta controlado.
- Datos útiles: shoppers, certificaciones ya presentadas/aprobadas y otros carryovers limpios que no tengan mejor fuente canónica.
- Visitas/operación histórica y corriente continúan teniendo a HR como fuente principal cuando HR ya contiene la verdad necesaria.
- No se copia código, dashboard, arquitectura, parches, fixes ni lógicas defectuosas.

### B. `cxorbia-backend-dev` — backend DEV de CXOrbia / primer tenant TyA
- Es el backend DEV del producto CXOrbia que se venía construyendo desde junio de 2026.
- TyA Consultores es el primer tenant real de CXOrbia.
- Que `cxorbia-backend-dev` contenga datos NO demuestra contaminación legacy; es consistente con el trabajo ya realizado de tenant/proyectos/HR/shoppers/finanzas/etc.
- No debe tratarse como “base vieja excluida”.
- Antes de cualquier nueva materialización se debe inventariar en modo read-only y reutilizar lo ya existente.

### C. `cxorbia-tya-dev-260729-c4` — sandbox aislado Corte 4
- Fue creado por una interpretación incorrecta que equiparó `cxorbia-backend-dev` con la base legacy a excluir.
- Se conserva únicamente como **sandbox de validación técnica** del contrato `CX.data` read-only y de los P0 VIS-01/VIS-02/VIS-02B ya descubiertos/corregidos.
- No es el destino de materialización Phase A.
- No se cargan allí nuevamente shoppers, certificaciones, HR, finanzas ni históricos ya trabajados.
- No se crea otro proyecto Firebase por rutina.

### D. Hosting público actual de TyA
- La URL pública que ya utilizan los shoppers debe preservarse en el cutover final.
- La plataforma legacy será reemplazada por CXOrbia en ese Hosting cuando Phase A y los gates de producción estén completos.
- La identidad del proyecto Firebase que hoy posee ese Hosting se verificará antes del cutover; no se asume que sea igual a ninguno de los backends anteriores.

## 3. Ruta corregida hacia producción

`LEGACY TYA (solo delta útil)`  
`+ HR VIVA (visitas/operación)`  
`→ cxorbia-backend-dev / tenant tya (reutilizar lo ya construido)`  
`→ completar Phase A`  
`→ preproducción/smoke/rollback`  
`→ cutover de CXOrbia sobre el Hosting público actual de TyA`.

No se permite la ruta de reproceso:

`cxorbia-backend-dev → recrear todo en cxorbia-tya-dev-260729-c4 → volver a migrar a otro PROD`.

## 4. Delta legacy actualizado

El levantamiento legacy previo ya no puede considerarse corte final porque la plataforma siguió operando.

Siguiente recuperación legacy:
- **shoppers:** nuevos/actualizados desde el corte previo;
- **certificaciones:** nuevas presentadas/aprobadas desde el corte previo;
- **visitas:** no reextraer como fuente principal cuando la HR viva ya contiene el histórico/estado correspondiente;
- deduplicación por llave estable, nunca solo por nombre;
- conflictos a revisión humana;
- no exportar ni versionar datos sensibles crudos.

Para evitar depender de una fecha de corte incierta, el refresh puede exportar el universo sanitizado de shoppers + certificaciones y calcular el delta contra `cxorbia-backend-dev`, sin volver a exportar toda la plataforma legacy.

## 5. Gate inmediato

1. Inventario read-only de `cxorbia-backend-dev` sin valores sensibles ni provider writes.
2. Determinar exactamente qué ya existe y qué falta.
3. Corregir documentación/configuración que excluía erróneamente `cxorbia-backend-dev`.
4. Preparar refresh legacy limitado a shoppers/certificaciones.
5. Continuar Phase A desde el faltante real, no desde cero.

## 6. Preservación de los fixes aprendidos en el sandbox

Se conservan como patrones reutilizables:
- fail-closed sin fallback demo/localStorage;
- backend vacío como estado válido;
- null-safety proyecto/período;
- limpieza de shell/DOM en role-switch;
- gate anti-dangling-script de entrypoint.

Estos fixes deben incorporarse al camino canónico sin convertir el sandbox en la nueva base del tenant.

## 7. Clasificación

- **Reusable CXOrbia:** separación legacy/origen de migración vs backend canónico; delta incremental; sandbox no equivale a destino.
- **Exclusivo TyA:** legacy TyA, tenant `tya`, backend `cxorbia-backend-dev` y Hosting público actual.
- **Claude/prototipo:** no nueva candidata por esta corrección; preservar fixes core ya probados.
- **Academia:** documentar estrategia de migración incremental y cutover sin cambio de URL pública.
- **Sin impacto Claude:** inventario provider read-only y reconciliación documental.

## 8. Estado seguro

Sin producción, merge, Hosting nuevo, Firestore/Auth/Storage/HR writes, imports, Make/Gemini, pagos ni materialización en este addendum.
