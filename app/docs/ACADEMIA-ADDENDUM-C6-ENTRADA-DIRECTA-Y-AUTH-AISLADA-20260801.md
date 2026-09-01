# ACADEMIA — C6 entrada directa, Auth aislada y autoridad de fuentes

**Fecha:** 2026-08-01  
**Estado técnico:** `PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`  
**Publicación de contenido:** pendiente de incorporación por Claude/prototipo y revisión humana.

## 1. Propósito formativo

Este bloque debe evitar que manuales y cursos mezclen cuatro conceptos diferentes:

1. **Selección de perfil:** entrada visual directa a Administración, Cliente o Shopper para revisar/usar la experiencia correspondiente.
2. **Autenticación:** validación real de identidad mediante Firebase Auth en el carril técnico o en el futuro flujo productivo autorizado.
3. **Autorización:** permisos y alcance derivados de claims, tenant, proyecto, país y shopperId.
4. **Fuente operacional:** HR viva y read model canónico; Auth no reemplaza visitas, periodos, indicadores ni Finanzas.

## 2. Contenido por rol

### Administración / Coordinación
- identificar el botón de entrada correcto;
- comprobar Dashboard y hoja de ruta;
- validar conteos por periodo y país;
- revisar Shoppers, Finanzas, Reportes y Reservas;
- reconocer cuándo un dato está pendiente de fuente o revisión.

### Cliente
- ingresar desde Portal del Cliente;
- consultar indicadores, avance e histórico permitidos;
- distinguir visualización autorizada de administración operativa;
- reconocer estados de fuente y readiness.

### Shopper / Evaluador
- ingresar desde Shopper / Evaluador;
- consultar perfil, certificación, visitas e histórico;
- distinguir visita disponible, postulación, asignación y visita propia;
- reconocer que identidad y permisos se validarán por backend sin pedir que el shopper elija un rol técnico.

### Superadmin / soporte
- comprender el carril técnico E2E;
- verificar claims, namespace, tenant y proyecto;
- comprobar HR authority después de Auth;
- interpretar evidencias source-safe sin exponer credenciales.

## 3. Lección paso a paso sugerida

### Lección: Entrar al perfil correcto
1. Abrir la URL de la plataforma.
2. Confirmar que aparecen Administración, Cliente y Shopper.
3. Elegir el perfil correspondiente.
4. Verificar que no aparece un formulario técnico inesperado.
5. Confirmar que el menú, indicadores y permisos coinciden con el perfil.
6. Reportar como incidencia si el perfil no entra directamente o si aparece información de otro rol.

### Validación esperada
- perfil correcto activo;
- navegación correspondiente;
- ningún panel técnico;
- ninguna selección adicional de namespace;
- datos operativos consistentes con el read model canónico.

## 4. Errores frecuentes

- Confundir selector de perfil con autenticación real.
- Suponer que Auth es la fuente de las visitas.
- Declarar PASS porque un formulario carga, sin probar el clic y el contenido posterior.
- Mostrar credenciales técnicas en manuales o capturas.
- Tratar un rol de shell visual como claim productivo definitivo.
- Aprobar una pantalla aislada sin revisar Dashboard, histórico, Shoppers, Finanzas y Reportes.

## 5. Checklist de validación

- [ ] Administración visible.
- [ ] Cliente visible.
- [ ] Shopper visible.
- [ ] Cero Usuario/Contraseña en carril humano.
- [ ] Clic directo activa el perfil.
- [ ] Dashboard/hoja de ruta coherentes.
- [ ] Histórico estable después de refresh.
- [ ] Shoppers y portales coherentes.
- [ ] Finanzas y Reportes sin regresiones.
- [ ] Reservas conserva estado honesto.
- [ ] Evidencia técnica no contiene credenciales.

## 6. Notificación de cambio

Cuando se publique en Academia:
- notificar a Admin/Coordinación sobre la restauración de entrada directa;
- notificar a soporte sobre la separación de carriles;
- actualizar manual de acceso y checklist de validación;
- no notificar credenciales, UIDs, tokens ni detalles privados del E2E.

## 7. Impacto comercial y reusable

Este patrón permite adaptar CXOrbia por tenant sin mezclar:
- UX de acceso;
- proveedor de autenticación;
- modelo de permisos;
- fuente operacional.

Facilita futuros tenants con otros proveedores o fuentes, manteniendo una experiencia coherente y auditable.

## 8. Pendiente

Claude/prototipo debe incorporar esta profundidad en:
- manual de acceso;
- curso inicial por rol;
- checklist de soporte;
- glosario de Auth/claims/fuente;
- notificación de cambio;
- ruta de onboarding.

Nada de este documento autoriza publicación automática de contenido, Gemini, nuevos deploys, writes, merge o producción.