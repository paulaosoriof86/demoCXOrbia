# Academia — impacto Corte 6 · acceso aprobado vs gates provider

**Fecha:** 2026-07-30  
**Estado:** `AUTOENTRY_HUMAN_VISUAL_REMOTE_PASS__PENDING_FINAL_VISUAL`

## Criterio reusable
La validación humana demostró dos veces que Firebase/Auth no debe transformarse en pasos visibles añadidos al prototipo:
1. no debe existir una pantalla previa `Acceso seguro`;
2. tampoco debe agregarse `Usuario + Contraseña` al seleccionar perfil cuando ese no es el flujo aprobado.

Para el **preview humano DEV**, el flujo correcto es: seleccionar perfil → entrar automáticamente al recorrido de ese rol. La HR source-safe es la fuente visual explícita; Auth/RBAC se comprueba mediante gates técnicos separados.

Esto no elimina autenticación de producción. En operación real, Firebase Auth/claims permanece detrás del contrato de acceso aprobado, con recuperación/cambio de acceso y scopes; provider email, UID, claims y namespaces permanecen internos.

## Evidencia de Corte 6
Gate estático: `PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE` PASS con proyecto `cinepolis`,14 periodos,616 visitas.

La primera ejecución autorizada falló antes de cualquier deploy por un contrato interno desalineado entre preflight y direct-deploy. Se corrigió en `b9f5190babcc339735cda59291417df5aea6988f` y se reutilizó la misma autorización todavía no consumida.

Resultado remoto final:
`PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`.

- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- periodos=14;
- visitas=616;
- proyecto=`cinepolis`;
- Firebase Auth validado separadamente=true;
- preservedLegacyAuthUsers91;
- producción=false.

## Contenido que Academia debe reflejar
- diferencia entre validación UX DEV y autenticación real de producción;
- acceso por rol sin pasos técnicos inventados;
- recuperación/cambio de acceso cuando aplique en producción;
- tenant/proyecto/rol y shopperId exacto;
- mínimo privilegio y conflictos a revisión humana;
- troubleshooting: distinguir UI, credencial operativa y scope sin exponer provider técnico;
- no pedir passwords o cuentas técnicas para una prueba visual;
- gates de release deben verificar también coherencia contractual entre preflight y deploy.

## Siguiente actualización
Después de la validación visual humana final y FREEZE Corte6, registrar el flujo aprobado definitivo y continuar con Agosto delta sin reabrir histórico.
