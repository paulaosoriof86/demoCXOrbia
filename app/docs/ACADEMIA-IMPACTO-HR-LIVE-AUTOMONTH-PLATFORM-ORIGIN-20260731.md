# Academia — HR viva, periodos automáticos y origen plataforma

**Fecha:** 2026-07-31  
**Estado:** `REUSABLE_PATTERN_DOCUMENTED__C6_PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__NO_PRODUCTION`

## 1. HR viva y periodos automáticos
Una operación de campo no debe exigir configuración técnica mensual cuando el calendario operativo ya existe en una fuente viva.

Para CXOrbia:
- una pestaña mensual nueva validada por metadata provider crea/detecta el periodo automáticamente;
- metadata de tabs y lectura de filas son responsabilidades separables;
- plataforma puede originar disponibilidad antes de HR;
- al aparecer HR, conciliar por IDs estables + origen/estado de sincronización; nunca por nombre.

## 2. Implementación TyA validada
DEV técnico:
- 14 periodos /616 visitas /último2026-07;
- autodiscovery mensual activo;
- producción intacta.

Corte6 sigue abierto porque la validación humana detectó P0 Shopper/perfil.

## 3. Patrón reusable: source-safe vs runtime protegido
`SOURCE-SAFE PUBLICO != CONSOLA OPERATIVA AUTENTICADA`.

- source-safe puede ocultar PII;
- Superadmin/Admin autenticado recibe los datos necesarios para operar;
- Shopper recibe solo su identidad/scope;
- Cliente no hereda PII shopper.

La protección de una URL pública nunca debe convertirse en ocultamiento artificial al rol autorizado.

## 4. Identidad Shopper
Cadena obligatoria:
`CREDENCIAL → FIREBASE AUTH → CLAIMS → TENANT/PROJECT → SHOPPER ID ESTABLE → PERFIL/HISTORICO PROPIO`.

Read-only TyA confirmó 91 claims Shopper con `shopperId`, y 91/91 resuelven perfil Firestore existente. No usar fallback ficticio ni matching por nombre.

## 5. Perfil consolidado
Read-only Firestore muestra shoppers340, phone123 y email39; otros campos no materializados hoy deben recuperarse por export/import exacto y trazable.

Patrón reusable:
`EXPORT → PARSER/PAQUETE SEGURO → MATCH ESTABLE → REVIEW → DELTA → WRITE GATED`.

Nunca conectar el legacy como dependencia runtime.

## 6. Credencial visible vs secreto
Separar conceptualmente:
- username operativo;
- contraseña inicial/temporal;
- hash de continuidad;
- contraseña vigente;
- reset/recuperación.

Firebase Auth no devuelve plaintext de la contraseña vigente. Un sistema no debe guardar una contraseña recuperable solo para poder mostrarla a un administrador.

TyA tiene 88 usernames exactos recuperables desde el handoff cifrado por stable-ID + claim binding, sin exportar los valores a evidencia. Los 21 sin match exacto permanecen HOLD.

## 7. Histórico y KPI
Read-only canónico: 616/616 visitas tienen shopperId y 194/194 perfiles referenciados existen.

Distribución actual: submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

Lección reusable: un KPI no debe derivarse de una lista histórica parcial de strings. Debe usar facetas/estados canónicos y permitir drill a la evidencia subyacente.

## 8. Julio/agosto
Julio puede mantener ejecución mientras agosto nace platform-origin antes de HR. Después, HR y plataforma se reconcilian por IDs estables y estado de sincronización.

## 9. Seguridad de gates
- provider read-only puede avanzar sin writes;
- username/profile delta requiere autorización Firestore específica;
- reset de password requiere autorización Auth separada;
- Hosting/producción tiene gate propio;
- una autorización consumida no se reutiliza.

## 10. Contenido para manuales/cursos
- HR viva y auto-month;
- source-safe vs protected runtime;
- Auth/claims/shopperId;
- perfil consolidado y mínimo privilegio;
- credential status vs password actual;
- export/import legacy seguro;
- KPI por facetas canónicas;
- reconciliación bidireccional HR/plataforma;
- fail-closed y revisión de conflictos.

## 11. Seguridad actual
Solo provider reads + cambios de repo/docs. Firestore/Auth/HR/legacy writes0; deploys nuevos0; merge=false; producción=false.
