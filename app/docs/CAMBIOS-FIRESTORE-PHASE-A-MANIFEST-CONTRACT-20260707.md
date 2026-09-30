# Cambios Firestore Phase A manifest contract

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable de manifest Firestore Phase A.

## Archivos creados

- `tools/contracts/cxorbia-firestore-phase-a-manifest-contract.mjs`
- `app/docs/FIRESTORE-PHASE-A-MANIFEST-CONTRACT-CXORBIA-20260707.md`
- `app/docs/CAMBIOS-FIRESTORE-PHASE-A-MANIFEST-CONTRACT-20260707.md`

## Reusable CXOrbia

- Colecciones logicas por tenant/proyecto.
- Llaves requeridas por alcance.
- Gates apagados por defecto.
- Base nueva y limpia preparada sin conexion real.

## Exclusivo cliente

- Nada exclusivo del cliente actual.

## Claude/prototipo

- No cambia UI.
- Claude debe conservar entidades y copy compatible con visitas, postulaciones, asignaciones, shoppers, certificaciones, beneficios, revision humana, integraciones y Academia.

## Academia

- Debe poder referenciar reglas y entidades por tenant/proyecto.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Firestore real, sin imports y sin datos sensibles.
