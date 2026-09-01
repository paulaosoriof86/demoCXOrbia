# ACADEMIA — Impacto C6 Deterministic Technical Suffix Read-only HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · TyA · Academia

## Patrón reusable

Una identidad visible amigable puede requerir una excepción técnica cuando no es única. La excepción debe:

- aplicarse solo a colisiones demostradas;
- ser estable y reproducible;
- no contener datos personales;
- derivarse de una llave canónica, no del nombre visual;
- conservar al titular técnico inequívoco cuando existe;
- ampliar longitud solo ante colisión;
- ser calculada por backend y no por interfaz;
- detenerse ante evidencia insuficiente.

## Caso TyA

La regla evaluada fue:

```text
nombre.apellido
nombre.apellido.<sufijo no PII>
sufijo = hash estable de tenantId + shopperId
longitud = 4, luego 6 u 8 solo ante colisión
```

Resultado read-only:

- 71 apellidos completados por consenso multi-fuente;
- 12 apellidos activos todavía pendientes;
- 65 grupos reales y 142 identidades activas;
- 52 titulares conservan el login sin sufijo;
- 90 identidades reciben sufijo de 4 caracteres;
- cero colisiones de sufijo o target login;
- un perfil multi-Auth continúa empatado.

## Manuales y cursos

No se actualizan todavía credenciales, rutas ni capturas, porque no hubo materialización ni deploy. Cuando el gate final sea PASS, Academia deberá explicar:

- por qué algunos shoppers tienen un sufijo;
- que el sufijo no representa DPI, teléfono, fecha ni información personal;
- que el usuario debe usar exactamente el identificador asignado;
- que los administradores no deben editarlo manualmente fuera del flujo autorizado.

## Notificaciones

No se emitieron notificaciones. La futura comunicación de credenciales deberá usar el alias final materializado, sin exponer emails internos ni detalles técnicos del hash.

## Estado

Impacto documental registrado. Cero Auth, contraseñas, Firestore, HR, notificaciones, deploy o producción.
