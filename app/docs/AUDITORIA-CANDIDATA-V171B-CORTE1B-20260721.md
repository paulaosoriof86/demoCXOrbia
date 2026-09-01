# Auditoría focalizada candidata V171b — Corte 1B

Fecha: 2026-07-21
Decisión: `HOLD_P0_PROVEN_SHOPPER_IDENTITY_FAIL_OPEN`

## Identidad

- Candidata: `Prototype development request CXOrbiaV171b.zip`.
- SHA-256: `e655ea88950c8485a497b52b3870c9b18ebef98181e1662993ef496efc17d4e2`.
- Contenido: 261 entradas, 4,984,649 bytes sin comprimir.
- Paquete acumulado: 258 archivos dentro de `app/` y 15 archivos declarados como modificados entre V165 y V171.
- Rama viva preservada: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Aplicación a la rama: **no ejecutada**.

## Estado del carril

- ZIP visible y extraído: sí.
- Manifiesto e inventario: presentes.
- Checkout Git autenticado de la rama viva dentro del mismo workspace: no disponible.
- Estado: `EXECUTION_LANE_NOT_READY`.

No se declara GO ni se usa Contents API, blobs, trees, workflow transportador, nueva rama o nuevo PR. Sin embargo, la propia candidata contiene un P0 reproducible y autosuficiente que obliga a HOLD sin necesidad de empalmarla.

## Verificaciones que pasaron

- Cero rutas ZIP inseguras o traversal.
- Los hashes SHA-256 de los 15 archivos modificados coinciden con `MANIFEST.json` y `MANIFEST.sha256`.
- Los 67 JavaScript del paquete pasan `node --check`.
- `index.html`: 68 referencias locales, cero archivos faltantes y cero scripts duplicados.
- Los siete archivos V171 del ZIP incremental anterior son idénticos a los incluidos en V171b.
- Cero secretos detectados por patrones comunes.
- Cero hardcode de Cinépolis en los 15 archivos modificados.
- P0 anteriores corregidos estáticamente: resolver de router sin acceso crudo repetido; extensiones PDF/XLSX/PPTX resueltas por exportador; Panorama y Reportes Admin usan facetas canónicas; add-ons usan clave tenant+proyecto; geo-checkin queda pendiente de backend/Storage y exige foto+GPS; `mireportes` aparece en NAV Shopper.

## P0 reproducible — identidad Shopper fail-open

La corrección V170 exigía `cero sh1 fail-open` y que cualquier vista privada del Shopper falle cerrada sin `shopperId` verificable. V171b no cumple.

### 1. `app/modules/misvisitas.js`

La candidata conserva:

```js
const sid=(CX.session.user&&CX.session.user.shopperId)||'sh1';
const base=(data.visitsForShopper?data.visitsForShopper(sid):data.visitas());
```

Impacto:

- una sesión Shopper sin `shopperId` hereda la identidad `sh1`;
- si `visitsForShopper` no está disponible, la vista cae a `data.visitas()` y puede exponer todas las visitas del periodo;
- la vista permite ver y accionar visitas de otra persona.

Prueba reproducible ejecutada con el archivo real de la candidata:

- sesión: `{ role:'shopper', user:{ name:'Shopper Sin ID' } }`;
- fixture: `visitsForShopper('sh1')` devuelve `VISITA DE SH1`;
- resultado: el módulo llamó dos veces a `visitsForShopper('sh1')` y renderizó `VISITA DE SH1`.

Resultado: `P0_PROVEN` por exposición cruzada de datos/acciones de Shopper.

### 2. Otros caminos fail-open presentes en la candidata completa

- `app/modules/reservas.js`: `shopperId || 'sh1'`; una sesión sin identidad puede ver o crear reservas como `sh1`.
- `app/modules/midia.js`: filtra `v.shopperId===sid || estado asignada/agendada/realizada`; un Shopper puede recibir visitas activas de otras identidades en cronograma y “Tu próxima visita”.
- `app/app.js`: la selección Shopper usa `shopperId || 'sh1'`; debe quedar explícitamente restringida a modo demo o fallar cerrada en modo live/real.

Los dos primeros son P0 operativos del portal Shopper. `app.js` requiere guard de modo para no convertir un fallback demo en identidad real.

## Corrección mínima obligatoria

1. `misvisitas.js`: sin `shopperId`, devolver estado seguro y cero acciones; sin `visitsForShopper`, usar `[]`, nunca `data.visitas()`.
2. `reservas.js`: sin `shopperId`, cero filas, cero creación y cero aprobación como otra identidad.
3. `midia.js`: en rol Shopper, todas las visitas privadas deben filtrar exclusivamente por `v.shopperId===shopperId`; oportunidades generales pertenecen a `Visitas Disponibles`, no a “Mi Día”.
4. `app.js`: el fallback demo solo puede existir bajo un guard explícito `dataSource.mode==='demo'`; en live/real sin identidad debe bloquear el ingreso.
5. Gate global: dos shoppers distintos y una sesión sin ID; cada uno ve solo lo propio y la sesión sin ID ve cero datos privados.

## P1/P2 documentales

- Los campos `bytes` del inventario/manifiesto parecen contar caracteres, no bytes UTF-8; los hashes sí coinciden. Corregir el rotulado para evitar evidencia ambigua.
- La verificación visual de PDF/XLSX/PPTX permanece pendiente después de resolver el P0.

## Clasificación

- **Reusable CXOrbia:** aislamiento de identidad Shopper y fail-closed global.
- **Exclusivo TyA:** validación posterior con dos shoppers reales de proyectos TyA, sin hardcode de Cinépolis.
- **Claude/prototipo:** correcciones localizadas en `app.js`, `modules/misvisitas.js`, `modules/reservas.js` y `modules/midia.js`.
- **Academia:** documentar diferencia entre oportunidades disponibles y visitas privadas; sesión sin identidad no muestra datos.
- **Sin impacto Claude:** HR viva, Corte 1A, backend, adapters, contratos, Cloud Run, Hosting e IAM.

## Estado seguro

Sin commit de empalme, push de candidata, deploy, merge, producción, importaciones, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos.