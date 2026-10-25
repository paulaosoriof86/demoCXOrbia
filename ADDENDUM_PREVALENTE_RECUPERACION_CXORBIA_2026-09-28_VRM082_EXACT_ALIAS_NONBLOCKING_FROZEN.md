# ADDENDUM FROZEN — VRM-082 EXACT ALIAS / NON-BLOCKING CONTROL POLICY

Fecha: 2026-09-28
Estado: FROZEN
Iteración: I3 Functional Closure
Producción: DO_NOT_TOUCH

## Evidencia vigente

Run 555 (36416972904) probó que las 12 identidades que Run 551/554 reportaron como ADMIN_REAL_SHOPPER_IDENTITY_NOT_RENDERABLE:
- tienen correspondencia exactAlias única;
- tienen identityMap hacia un único shopper canónico;
- tienen 0 ambigüedades;
- tienen 12/12 nombres equivalentes a la autoridad HR bajo normalización;
- no requieren recreación de shopper;
- no demostraron pérdida de visitas, perfil o identidad.

El defecto probado fue un falso negativo del gate terminal: rowFor no respetaba identityMap/exactAliases antes de comparar displayName.
El control fue corregido sin cambiar product source. Run 556 ya no reportó VRM-082 como primer bloqueo.

## Regla no bloqueante

Una discrepancia Admin/HR de display identity NO bloqueará Fase A cuando TODAS estas condiciones sean verdaderas:
1. el sourceShopperId HR resuelve por identityMap/exactAliases a exactamente un canonicalShopperId;
2. no existe ambigüedad ni duplicidad de perfil/membership/Auth;
3. el nombre humano HR y el nombre canónico son equivalentes bajo normalización permitida (mayúsculas/minúsculas y tildes);
4. las visitas, histórico, KPIs y asignaciones continúan ligados al canonicalShopperId correcto;
5. la autenticación del shopper no depende de recrear la identidad;
6. no existe write a HR para corregirlo;
7. el defecto está aislado a visualización/control de correspondencia.

Si alguna condición falla —identidad faltante, alias ambiguo, visitas asignadas a otro shopper, doble Auth, doble perfil, login imposible o pérdida de histórico— sigue siendo P0 y sí bloquea.

## Regla anti-duplicado

NO recrear un shopper existente para resolver un alias/crosswalk.
NO crear un segundo Auth/profile/membership si el shopper HR ya resuelve a una identidad canónica.
La corrección debe hacerse por crosswalk/identity adjudication/control.

## Creación automática desde HR

El runtime de HR ejecuta reconcileAuthoritativeShoppers() en cada revisión fresca.
createShopperCommandProvider.reconcileSnapshot() usa durableUpsert() de forma idempotente:
- crea/reutiliza perfil durable;
- crea/reutiliza membership shopper;
- crea/reutiliza Auth y claims cuando corresponde;
- crea/reutiliza shopperIdentityCrosswalk;
- conserva alias exactos;
- reporta identityReviewRequired en conflictos en lugar de fusionar por nombre.

La revisión 8c12bb... reportó shopperCount=217, reconciledShopperCount=216, authCreated=0, idempotentReplays=13 y una única identidad en review por SHOPPER_CREDENTIAL_NAME_INCOMPLETE. authCreated=0 significa que en esa revisión concreta no faltaba crear un Auth nuevo; no significa que la capacidad automática esté deshabilitada.

## Alta manual

Admin > Shoppers conserva '+ Alta manual'.
El alta pide primer nombre, primer apellido y WhatsApp; país/ubicación, correo, edad y sexo son opcionales.
data.addShopper() exige provider ACK; después se ejecuta resetShopperCredential() y sólo muestra éxito cuando la creación y el acceso quedan confirmados.

La alta manual se usa para un shopper genuinamente nuevo de origen plataforma. No se usa para duplicar/recrear un shopper que ya existe en HR.

## Regla para postproducción

Si un shopper HR queda en identity review por datos incompletos, Gravicentra CX deberá incorporar una acción Admin explícita de resolver/adjudicar identidad sin recrear el shopper. Hasta que exista esa UI, la reparación se hace por el provider/crosswalk canónico, no mediante alta manual duplicada.
