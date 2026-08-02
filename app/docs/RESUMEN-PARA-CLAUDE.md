# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_UNIFIED_CUMULATIVE_RUNTIME_ROOT_FIX_CODE_APPLIED_PENDING_READONLY_RUNTIME_GATES`

## 1. Baseline única

Claude debe continuar sobre el HEAD vivo de `docs-tya-v6-v71-audit`. No puede crear una versión paralela, un shell reducido ni escoger módulos aislados.

La HR viva contiene todos los periodos de junio 2025 a julio 2026. Agosto todavía no existe. Ninguna UI puede usar el reloj del sistema para inventar un periodo.

## 2. Regresión que no se puede repetir

La entrada humana source-safe deshabilitó Auth y dejó inactivos adapters ya aprobados. Resultado:

- Shopper sin identidad;
- KPI/fases divergentes;
- histórico/comparativo incompleto;
- perfiles/certificaciones ausentes;
- Cliente y Finanzas degradados.

## 3. Contrato recuperado

La URL humana normal debe contener una sola experiencia:

- selección de perfil + Usuario/Contraseña en el mismo login;
- Firebase Auth/claims;
- HR viva para periodos/visitas/estados;
- Firestore exacto para perfil/PII/certificación;
- read model canónico;
- comparativo de todos los periodos;
- Portal Shopper exacto;
- Portal Cliente completo;
- Finanzas canónicas;
- honorario Cinépolis Q60 GT / L200 HN desde configuración cuando HR no trae monto.

## 4. Archivos backend protegidos

- `app/index-backend-dev.html`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`;
- `app/adapters/tya-protected-auth-hr-authority-bridge-v1.js`;
- `app/adapters/tya-cumulative-read-model-v2.js`;
- `app/adapters/tya-c6-domain-consistency-bridge.js`;
- `app/adapters/tya-canonical-shopper-portal-v2.js`;
- `app/adapters/tya-canonical-finance-read-model-v2.js`.

Claude no debe mover estas reglas a los módulos UI ni reintroducir carriles alternos.

## 5. Frontend preservado

`app/modules/*` no fue modificado. Las mejoras ya aceptadas de Dashboard, Histórico, Shoppers, Cliente, Academia y Finanzas deben consumir el runtime canónico; no deben reconstruirse desde cero.

## 6. Ajustes frontend pendientes solo si el runtime PASS los demuestra

- copy de estados financieros;
- presentación de review queue de identidades;
- detalle administrativo de certificación;
- formato final de PDF/Excel/exportaciones.

No corregirlos antes de comprobar la composición real.

## 7. Gate antes de otra candidata o deploy

Debe probar en la misma URL y sesión:

- staff/cliente/shopper autenticados;
- todos los periodos HR;
- KPI = fase = detalle;
- comparativo completo;
- identidad única;
- perfil/certificación/histórico;
- Cliente;
- Finanzas;
- tres recargas;
- cero writes.

## 8. Academia

Actualizar manuales para enseñar que la fuente viva gobierna todos los periodos y que una pantalla visible no es PASS si no comparte identidad, periodo y read model con el resto del producto.
