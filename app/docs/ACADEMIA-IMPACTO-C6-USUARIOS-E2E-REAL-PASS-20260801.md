# ACADEMIA — IMPACTO C6 USUARIOS E2E REAL PASS

**Fecha:** 2026-08-01  
**Clasificación:** Academia · Reusable CXOrbia · Sin impacto producción  
**Estado:** `PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`

## 1. Aprendizaje obligatorio
Un formulario visible no prueba autenticación. La evidencia mínima de un login protegido incluye:
- credencial real existente;
- proveedor Auth activo;
- claims válidos;
- tenant, proyecto, rol y namespace derivados;
- hidratación de datos autorizados;
- conservación de la fuente operacional;
- refresh y nueva pestaña sin pérdida de sesión.

## 2. Autoridad de fuentes
La Academia debe enseñar explícitamente:
- HR viva: autoridad de periodos, visitas y estado operacional;
- Firebase Auth: autoridad de identidad y claims;
- Firestore protegido: perfil, alcance y overlay autorizado;
- un read scoped por usuario no reemplaza el universo operacional;
- la composición solo usa llaves técnicas exactas.

## 3. Patrón de login
El flujo correcto presenta Usuario + Contraseña. El usuario no declara previamente su rol. El sistema deriva:
- namespace `staff` o `shopper`;
- rol;
- tenant;
- proyecto;
- shopperId cuando corresponda.

Solo una identidad realmente dual puede elegir perfil después de validar credenciales.

## 4. Antipatrones documentados
- selector genérico antes de Auth;
- `Tipo de acceso` para todos los usuarios;
- segunda pantalla técnica;
- panel diagnóstico expuesto;
- PASS de carcasa sin credenciales;
- Firestore scoped reemplazando HR;
- dedupe por nombre, teléfono o correo;
- declarar persistencia sin probar refresh y nueva pestaña.

## 5. Caso real de aprendizaje
En la prueba real:
- staff coordinador mantuvo616 visitas;
- shopper autenticó correctamente, pero inicialmente la vista Firestore redujo el modelo a1 visita;
- el gate E2E detectó la degradación;
- el root fix restauró HR y aplicó Firestore como overlay;
- local y remoto confirmaron616 visitas, histórico propio y persistencia.

## 6. Rutas por rol y manuales
Actualizar cursos/manuales de:
- Administrador/Coordinador: acceso derivado por claims y universo operacional completo;
- Shopper: acceso derivado, histórico propio sobre identidad canónica y privacidad por alcance;
- Soporte: distinguir error de Auth, claims, fuente, composición e hidratación;
- Implementación: gate local antes del deploy y E2E remoto después;
- Auditoría: evidencia sanitizada, cero credenciales o tokens.

## 7. Notificaciones
Los mensajes al usuario deben ser funcionales y no técnicos. Nunca mostrar:
- identificador Firebase interno;
- namespace técnico;
- UID/token;
- conteos de diagnóstico;
- estado de proveedor;
- secretos o instrucciones de infraestructura.

## 8. Estado seguro
Usuarios creados0; Auth writes0; cambios/resets de contraseña0; datos writes0; Hosting DEV deploy1; Cloud Run0; merge=false; producción=false.
