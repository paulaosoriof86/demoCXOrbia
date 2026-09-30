# RESUMEN PARA CLAUDE — Addendum C6 Provider Revalidation HOLD

**Fecha:** 2026-08-05  
**Impacto frontend:** ninguno aplicado.

## Conectado y preservado

- Login Shopper normal: `nombre.apellido`.
- Excepción autorizada únicamente ante colisión activa: `nombre.apellido.<sufijo técnico no PII>`.
- Política de sufijo: SHA-256 sobre `tenantId + NUL + shopperId`, longitudes 4/6/8.
- Contraseña contractual: `Nombre123*`.
- Sin membership Shopper.
- Autoridad: Firebase Auth + claims exactos + `shopperId` canónico.

## Resultado backend read-only

El crosswalk corregido alcanzó `101 mapped / 8 unmapped`. Quedan 12 perfiles activos sin apellido técnico source-safe y un perfil multi-Auth empatado. La clasificación resultante es `65 grupos / 142 identidades activas`. El plan de 340 filas no es ejecutable.

## Ajustes frontend

Ninguno. No modificar módulos, diseño, formularios, rutas ni mensajes para ocultar o compensar el HOLD backend.

## Academia y manuales

No documentar aún como comportamiento disponible el sufijo técnico ni publicar cifras de usuarios corregidos. La política sigue sin materializar en Auth.

## Próximo punto de empalme

Esperar la clasificación source-only de los 13 HOLD y la reconciliación `65/142` versus `64/141`. No existe autorización para desplegar el formulario Shopper ni ejecutar repair Auth.
