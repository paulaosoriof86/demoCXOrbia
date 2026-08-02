# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_RUNTIME_PASS_STAFF_SHOPPER_TECHNICAL__CLIENT_ROUTE_PASS__CLIENT_CREDENTIAL_HOLD`

## 1. Baseline única

Claude debe continuar sobre el HEAD vivo de `docs-tya-v6-v71-audit`. No puede crear una versión paralela, shell reducido ni escoger módulos aislados.

La HR viva contiene 14 periodos desde junio 2025 hasta julio 2026, 616 visitas y 208 shoppers en la revisión observada. Agosto todavía no existe. Estos conteos son fotografía, no contrato permanente.

## 2. Contrato acumulativo comprobado

PASS read-only:

- entrada humana `authenticated-human-canonical`;
- Firebase Auth/claims para Staff y Shopper;
- HR viva dinámica;
- Firestore exacto para identidad/perfil/certificación;
- dominio/Finanzas/Portal Shopper/Reservas canónicos;
- tres recargas y nueva pestaña;
- carril técnico aislado;
- ruta integrada Cliente Usuario + Contraseña.

HOLD:

- no existe una credencial Cliente utilizable con claims válidos para tenant `tya` y proyecto `cinepolis`;
- no se autorizaron Auth writes, cambios ni resets de contraseña.

## 3. Regresiones que no se pueden repetir

- entrada humana sin Auth real;
- clic rápido que use el handler directo antes del wrapper oficial;
- tarjeta Shopper protegida ejecutando `pickShopperDev()`;
- Shopper sin identidad;
- carril técnico sin `cxDevEntryAuth` o sin `technical-auth-e2e-isolated`;
- KPI/fases divergentes;
- histórico/comparativo incompleto;
- Cliente y Finanzas degradados;
- regalías globales;
- clasificación de proyecto por nombre;
- honorario Shopper usado como ingreso delegado.

## 4. Contratos Auth protegidos

- `app/adapters/tya-c6-unified-human-runtime-v1.js`: guard temporal contra clic antes del wrapper oficial.
- `app/adapters/tya-c6-shopper-auth-click-guard-v1.js`: bloquea `pickShopperDev()` en la ruta protegida y abre Firebase Auth.
- `app/adapters/tya-dev-technical-auth-e2e-v1.js`: carril técnico aislado con formulario `cxDevEntryAuth`.
- `app/core/backend-browser-auth.js`: autoridad del login visible.

Claude no debe mover Auth a módulos UI, reintroducir selección directa de Shopper ni crear un segundo login.

## 5. Modelo financiero por proyecto

Backend soporta:

- `directo/local_invoicing`;
- `delegado/delegated_coordination`;
- `regional/regional_coordination`;
- `unconfigured` fail-closed.

Cinépolis:

- delegado desde su `projectConfig`;
- honorario Shopper Q60 GT / L200 HN;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca es ingreso delegado;
- margen solo con comisión y distribución exactas.

Contratos:

- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-delegated-coordination-finance-guard-v1.js`.

## 6. Ajustes frontend exactos para Claude

### `app/modules/proyecto-wizard.js`

- conservar `Facturado directamente` y `Delegado (franquicia)`;
- agregar `Regional`;
- mostrar regalías solo para directo;
- no duplicar el cálculo backend.

### `app/modules/finanzas.js`

- sustituir “honorario recibido menos lo pagado al shopper”;
- describir comisión de coordinación y distribución configurable;
- mostrar `pending_or_review` cuando falte fuente exacta;
- no presentar margen inventado.

### `app/app.js`

- no modificar desde backend;
- no copiar ni extender `pickShopperDev()` a rutas protegidas;
- cualquier futura refactorización frontend debe conservar el guard y pasar el gate multirol.

## 7. Credencial Cliente pendiente

La búsqueda read-only obtuvo:

- 4 registros candidatos;
- 3 usuarios Auth existentes;
- 0 claims Cliente válidos para `tya/cinepolis`;
- 0 credenciales autenticables.

No crear ni resetear una cuenta sin autorización específica.

El bloque futuro autorizado deberá incluir:

`SNAPSHOT → ONE CLIENT CREDENTIAL DEV → CLAIMS → IDEMPOTENCY → CLIENT AUTH → 3 RELOADS + NEW TAB → READBACK → ROLLBACK PROOF`.

## 8. Gate antes de deploy

Pendiente únicamente Auth real de Cliente. Después deberá repetirse el gate acumulativo completo y solicitar autorización fresca para un único deploy del Hosting DEV existente.

No nueva candidata, rama, PR, Firebase, Hosting, deploy, merge ni producción.

## 9. Academia

Actualizar manuales para enseñar:

- ruta visible no equivale a principal autenticado;
- Staff, Shopper y Cliente tienen gates separados;
- DEV no autoriza bypass de Auth;
- fuente viva y modelo financiero por proyecto;
- diferencia entre facturación local, coordinación delegada, distribución regional e importes del shopper.
