# SOURCE LOCK — C6 perfiles HOLD, autoridad HR viva y agosto

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_13_HOLD_PROFILES_IDENTIFIED_BY_FINGERPRINT__NAMES_NOT_RECOVERED__LIVE_HR_AUGUST_AUTHORITY_P0__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Perfiles que siguen sin conciliación

El plan provider v2.2 contiene exactamente 13 filas HOLD.

### 12 perfiles sin apellido autoritativo

```text
cc941934f90032aa48e8
9ed0cdabf3794b7ccf21
3451d618b5d6307b87da
80d716626b85e14778ea
8aea97650e97902f7616
32e2de62067ab6ecfb7b
b31bdc0c7514acbe25ba
4a59de15805804cbe398
cfbd0c519e59f40c6239
540c9e6b71440b393365
c01e0f344901f03e78d2
729eb0480d5ec2266a20
```

Clasificación contractual: `AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED`.

### 1 perfil con empate multi-Auth

```text
planProfileFingerprint=7cc28c78de9bfda01d14
multiAuthProfileFingerprint=d15356ed735e87a33e69
candidateFingerprintA=9b2b7ca1bd72c1301d29
candidateFingerprintB=4e6d26551d11db444bd0
score=5016/5016
margin=0
```

Clasificación contractual: `SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED`.

## 2. Nombres todavía no recuperados

Los artifacts vigentes omiten deliberadamente nombres, correos, UID, teléfonos y contraseñas. Se preparó un único probe focal read-only para recuperar nombres y actividad en artifact privado, pero el workflow terminó con estado `error` durante el empaquetado de salida.

No existe artifact recuperable ni evidencia suficiente para afirmar los nombres. Como el provider read pudo haberse iniciado antes del fallo, el request quedó consumido y congelado con `STOP_RETRY`; no se ejecutará un segundo intento sin autorización expresa nueva.

Commits del intento controlado:

```text
source probe=ac3351d3ea6d1ccabdccfc1f5f449fc35d394244
workflow=35e1a77565b14f3276c516f4ad25f3626a440ae3
request=c9c2f699592fcb6abe7a648a17dd4309a1dd3d2d
freeze no-rerun=bb14656be9711201d08ff67e8d231eb0498922c1
```

## 3. Política de disposición para acelerar

Paula puede decidir que un perfil muy antiguo no justifica reparación Auth. La disposición correcta no es borrar historia ni identidad, sino:

```text
ARCHIVE_LEGACY_NO_AUTH
EXCLUDE_FROM_AUTH_REPAIR
PRESERVE_HISTORY=true
PRESERVE_VISITS_CERTIFICATIONS_LIQUIDATIONS=true
LOGIN_ENABLED=false
```

No se descartará automáticamente ningún perfil. El empate multi-Auth no puede resolverse por antigüedad sin identificar primero la persona y su actividad.

## 4. Agosto y autoridad HR viva

La evidencia del 31 de julio ya demuestra una contradicción crítica:

```text
raw builder before enforcement: 30 tabs / 15 periods / 684 visits
registry after enforcement: 28 tabs / 14 periods / 616 visits
rejected tabs: AGOSTO 26 / AGOSTO 26 HN
provider metadata read: failed 403
registry autoDiscovery: false
latest accepted period: 2026-07
```

Por tanto, `latestPeriod=2026-07` no prueba que agosto no exista. Prueba que el runtime estaba usando un registro de pestañas desactualizado y rechazó agosto.

## 5. Regla prevalente de datos vivos

Toda verdad operativa e histórica de HR debe reconstruirse desde la HR viva y su revisión vigente.

- No se permite fijar conteos, periodos, estados ni histórico de HR como verdad permanente en código, Firestore o archivos estáticos.
- Si una fila histórica cambia en HR, la siguiente revisión viva debe reflejar el cambio.
- Archivos como `app/data/tya-hr-source-safe-current-through-july.js` y `app/data/tya-hr-source-safe-periods.js` solo pueden funcionar como bootstrap/last-known-good temporal, nunca como autoridad.
- Firestore puede conservar materialización, índices y trazabilidad, pero no puede sustituir a la HR viva para determinar el estado actual.
- Producción queda bloqueada mientras el endpoint vivo no confirme `2026-08`, ambas pestañas agosto GT/HN y una revisión fresca del proveedor.

## 6. Gate exacto para agosto

```text
PROVIDER METADATA LIVE PASS
→ AUTO-DISCOVER AGOSTO 26 + AGOSTO 26 HN
→ REBUILD ALL PERIODS FROM LIVE HR
→ latestPeriodKey=2026-08
→ active calendar period=2026-08
→ historical mutation test without fixed snapshot
→ same sourceRevision across Dashboard, Histórico, Visitas, Finanzas and Shopper
```

No debe hardcodearse agosto ni agregarse manualmente al registry como sustituto del metadata provider.

## 7. Estado seguro

```text
second provider attempt=0
provider writes=0
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 8. Siguiente decisión

1. Recuperar los nombres por una ruta source-only desde el bundle cifrado existente, si el bundle permite mapear inequívocamente los 13 fingerprints; o pedir autorización fresca para un único read-only focal corregido.
2. Paula decide por nombre cuáles se conservan para repair Auth y cuáles pasan a `ARCHIVE_LEGACY_NO_AUTH`.
3. En paralelo, corregir la autoridad HR viva para que agosto y cualquier cambio histórico provengan del proveedor en tiempo real.
