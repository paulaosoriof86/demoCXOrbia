# Resumen para Claude - Addendum tenant y ficha dinamica

Fecha: 2026-07-04

## Bloque backend completado

Se documentaron dos temas nuevos:

1. Perfil del tenant/cliente de CXOrbia y modulos habilitados por tenant.
2. Ficha de postulacion dinamica con datos provenientes de HR, configuracion, reglas calculadas, override o fallback manual.

## Archivos creados

- `app/contracts/tenant-profile-module-entitlements-phase-a.tya.contract.json`
- `app/contracts/postulation-card-dynamic-data-source-phase-a.tya.contract.json`
- `app/docs/TENANT-PROFILE-MODULE-ENTITLEMENTS-PHASE-A-TYA-20260704.md`
- `app/docs/POSTULATION-CARD-DYNAMIC-DATA-SOURCE-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-BACKFILL-BACKEND-BLOCKS-TO-DATE-20260704.md`

## Para prototipo

Cuando Claude vuelva:

- No mostrar todos los modulos a todos los tenants si la configuracion los oculta.
- Distinguir tenant/cliente de CXOrbia de clientes finales de la consultora.
- Ficha de postulacion debe ser dinamica y shopper-visible.
- No mostrar al shopper taxonomia interna como requisito cliente vs medicion interna salvo que sea necesario explicar una regla.
- Datos como escenario y disponible desde pueden venir de HR y cambiar.
- Tipo tecnico de cuestionario es interno; shopper solo debe ver accion correcta.

## Academia

Se creo backfill para que Academia cubra tambien todo lo ya trabajado en backend, no solo lo que se haga desde ahora.

## Estado seguro

Sin cambios frontend, sin runtime, sin Firestore real, sin Auth real, sin HR real, sin Make real, sin deploy y sin produccion.
