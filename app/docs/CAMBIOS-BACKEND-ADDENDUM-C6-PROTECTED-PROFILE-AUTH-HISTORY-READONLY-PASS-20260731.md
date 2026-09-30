# CAMBIOS-BACKEND — Corte 6 · perfil/auth/histórico protegido read-only

**Fecha:** 2026-07-31  
**Estado:** `C6_P0_REPRODUCED__PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__RUNTIME_FIX_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## Qué se hizo
Se continuó desde el P0 visual sin reabrir Corte3, R17N, Corte5 ni Auth91.

Se ejecutó un inventario **read-only y source-safe** contra `cxorbia-backend-dev`; no exportó nombres, teléfonos, emails, usuarios, contraseñas, IDs ni secretos.

Resultado de gate GitHub: `PASS_C6_PROTECTED_PROFILE_AUTH_HISTORY_READONLY`.

## Inventario real de Firestore
Colección protegida `tenants/tya/shoppers`:
- documentos: **340**;
- superficie de nombre real: **313**;
- teléfono: **123**;
- email: **39**;
- username/login: **0**;
- password: **0**;
- documento/DPI: **0**;
- datos bancarios/pago: **0**;
- certificaciones embebidas en perfil: **0**;
- `legacyShopperId`: **120**.

Conclusión: la captura humana anterior no demostraba ausencia de teléfono/email; esos campos sí existen en parte de Firestore, pero la ruta `display_name_only` los descartaba. Documento/banco/certificación sí requieren integración/migración adicional porque no están embebidos hoy en los perfiles protegidos.

## Auth real
Firebase Auth actual:
- usuarios: **108**;
- password provider: **108**;
- rol shopper: **92**;
- claims shopper con `shopperId`: **91**;
- esos `shopperId` resuelven perfil Firestore existente: **91/91**;
- claims shopper con perfil faltante: **0**.

Esto prueba que el login Shopper real puede resolver identidad estable. No corresponde usar `sh1` ni un selector anónimo como solución final.

## Histórico canónico
Firestore `tenants/tya/projects/cinepolis/visits`:
- visitas: **616**;
- con `shopperId`: **616/616**;
- shopperId distintos referenciados: **194**;
- perfiles existentes para esos IDs: **194/194**;
- con periodo: **616/616**.

Estados almacenados:
- `submitida`: **545**;
- `cuestionario`: **61**;
- `agendada`: **4**;
- `realizada`: **3**;
- `fuera_rango`: **3**.

Esto reproduce la causa de KPI/histórico incompleto: la lógica legacy que solo considera `realizada/cuestionario/liquidada` omite masivamente `submitida`.

## Correcciones de runtime preparadas en rama viva
Sin deploy:

1. `app/core/backend-config-preview-dev.js`
   - separa de forma explícita el carril source-safe del carril protegido;
   - si se solicita `cxProtectedRuntime`, ya no ejecuta `forceHumanVisualSourceSafe()` ni desactiva el backend protegido.

2. `app/adapters/tya-live-source-refresh-watch.js`
   - el watcher HR source-safe sale inmediatamente en runtime protegido;
   - evita que el polling source-safe vuelva a sobrescribir `CX.data` después de cargar Firestore.

3. `app/core/backend-protected-dev-mode.js`
   - mantiene Auth + custom claims + Rules obligatorios y writes deshabilitados;
   - normaliza aliases reales ya existentes (`phone/wa/whatsapp`, email, documento, banco/cuenta, username) sin inventar valores;
   - nunca sintetiza password;
   - reemplaza `visitsForShopper/shopperStats` solo en el carril protegido para derivar histórico/KPI desde todo el set canónico y reconocer `submitida` y facetas canónicas.

Gate estático posterior ejecutó `node --check` sobre los tres archivos y verificó marcadores anti-regresión; el job completo terminó PASS.

## Delta exacto — qué ya sabemos y qué falta
### No requiere data write
- resolver login Shopper desde los claims existentes;
- leer teléfono/email ya materializados;
- reconstruir histórico desde las 616 visitas por `shopperId`;
- corregir KPI/drill mediante semántica canónica del runtime protegido.

### Requiere plan Firestore separado antes de escribir
- username protegido: Firestore tiene 0, aunque el paquete cifrado de credenciales usado para el import Auth contiene identificadores exactos para las identidades importadas. Se debe preparar delta exacto desde ese bundle, nunca por nombre.
- campos adicionales de la plataforma vigente: deben reconciliarse desde el export ya disponible, por export/import cifrado/source-safe; nunca conectar la RTDB vieja.
- documento y banco/pago: hoy cobertura Firestore 0; solo migrar si existen realmente en export y hay vínculo estable.

### Password
Firebase Auth no permite leer de regreso la contraseña actual. No copiar passwords a Firestore/JS/repo.

Producto recomendado:
- mostrar username;
- mostrar estado de credencial;
- mostrar contraseña inicial/legacy solo cuando la fuente segura permita probar que sigue siendo la válida;
- de lo contrario reset controlado, sujeto a autorización Auth específica.

## Seguridad
Este bloque hizo:
- provider reads: sí;
- Firestore writes: 0;
- Auth writes/password changes: 0;
- HR/legacy writes: 0;
- Rules/Hosting/Cloud Run deploys: 0;
- Storage/Make/Gemini/pagos: 0;
- merge: false;
- producción: false;
- PII/credenciales/IDs exportados en evidencia: 0.

## Clasificación
- **Reusable CXOrbia:** carriles source-safe vs protected, Auth claim→perfil estable, KPI por facetas canónicas.
- **Exclusivo cliente:** export TyA y regla de credenciales TyA.
- **Claude/prototipo:** preservar diseño; si después del runtime protegido queda un gap visual, corregir solo el archivo/módulo exacto documentado.
- **Academia:** identidad, RBAC, protección de PII, históricos canónicos y reconciliación export/import.
- **Sin impacto Claude:** provider inventory, Auth counts, Firestore counts y gates source-safe.

## Siguiente bloque exacto
`DELTA USERNAME DESDE BUNDLE CIFRADO + RECONCILIACIÓN CIFRADA DE PERFIL EXTRA DEL EXPORT → DRY-RUN SOURCE-SAFE → AUTORIZACIONES FIRESTORE/AUTH SOLO SI APLICAN → REDEPLOY HOSTING DEV NUEVO → VISUAL PROTEGIDA → FREEZE C6`.
