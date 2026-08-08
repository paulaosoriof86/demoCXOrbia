# Academia backfill - Backend blocks to date

Fecha: 2026-07-04

## Objetivo

Paula aclaro que Academia no debe aplicar solo de aqui en adelante. Debe cubrir tambien los bloques backend ya trabajados antes de crear el gate de Academia.

Este documento consolida trazabilidad retroactiva para que los manuales, cursos, rutas por rol y glosario cubran todo lo avanzado hasta este punto.

## Bloques backend ya avanzados que deben reflejarse en Academia

### 1. CX.data adapter y backend bridge

Academia debe explicar:

- que es `CX.data` en lenguaje no tecnico;
- por que hoy el prototipo usaba localStorage;
- que significa pasar a backend real;
- que no se debe tocar desde modulos visuales;
- que diferencia hay entre preview, staging y produccion.

Roles:

- superadmin;
- admin;
- consultora/aliado.

### 2. HR Source

Academia debe explicar:

- que es una HR / hoja de ruta;
- por que es fuente operacional;
- que datos salen de la HR;
- que significa preview;
- que significa sourceRef opaco;
- por que no se guarda URL cruda en produccion;
- diferencia entre ver datos y sincronizar/importar.

Roles:

- admin;
- ops;
- superadmin;
- consultora/aliado.

### 3. Auth, roles y claims

Academia debe explicar:

- que roles existen;
- que puede ver cada rol;
- por que ocultar UI no es seguridad completa;
- diferencia entre permisos visuales y reglas backend;
- pendiente `ops` vs `coordinador` como decision canonica.

Roles:

- superadmin;
- admin.

### 4. Wizard de proyecto Phase A

Academia debe explicar:

- como se crea un proyecto;
- que configuraciones son obligatorias;
- pais, moneda, HR, cuestionario, revision, submitido, certificacion, documentos, agenda, pagos e integraciones;
- que significa gate apagado/preparado;
- por que proyecto debe ser configurable y multi-proyecto.

Roles:

- superadmin;
- admin;
- consultora/aliado.

### 5. Admin review y submitido

Academia debe explicar:

- diferencia entre cuestionario realizado, revision admin, submitido, liquidacion y pago;
- estados de revision;
- por que submitido puede ser HR-driven;
- que hacer con conflictos;
- que no se debe considerar pagable aun.

Roles:

- admin;
- ops;
- superadmin;
- shopper para version simplificada.

### 6. Postulaciones y asignaciones

Academia debe explicar:

- que es una postulacion;
- como se aprueba;
- como se asigna;
- que significa origen plataforma vs HR;
- que hacer con conflicto;
- que pasa al shopper cuando se aprueba;
- por que la visita debe salir de disponibles.

Roles:

- shopper;
- ops;
- admin;
- cliente version lectura;
- consultora/aliado.

### 7. Visit lifecycle

Academia debe explicar:

- visita disponible;
- asignada;
- agendada;
- reprogramada;
- cancelada;
- realizada;
- cuestionario realizado;
- revision;
- submitido;
- liquidacion;
- pago.

Roles:

- shopper;
- ops;
- admin;
- cliente version lectura.

### 8. Reservas, franja, rango y quincena

Academia debe explicar:

- reserva;
- fecha propuesta;
- disponible desde;
- franja;
- WK/WKND en Cinepolis;
- quincena;
- aprobacion fuera de rango;
- motivo y autorizador;
- posible impacto en puntaje sin penalizacion automatica.

Roles:

- shopper;
- ops;
- admin.

### 9. Restricciones de proyecto y ficha de postulacion

Academia debe explicar:

- como leer ficha de postulacion;
- honorario;
- reembolso;
- escenario;
- restricciones de perfil;
- frecuencia y ultima visita;
- certificaciones;
- documentos;
- datos que vienen de HR vs configuracion;
- que pasa despues de postularse.

Roles:

- shopper;
- ops;
- admin;
- cliente;
- consultora/aliado.

### 10. Tenant profile, modulos habilitados y login

Academia debe explicar:

- diferencia entre cliente de CXOrbia/tenant y cliente final de la consultora;
- como se configura empresa consultora;
- como se habilitan/ocultan modulos;
- que significa preview comercial;
- como afecta el login.

Roles:

- superadmin;
- consultora/aliado;
- admin.

## Glosario retroactivo minimo

- Tenant.
- Cliente final.
- HR / hoja de ruta.
- SourceRef.
- Preview.
- Gate.
- Postulacion.
- Asignacion.
- Reserva.
- Disponible desde.
- Franja.
- WK.
- WKND.
- Quincena.
- Escenario.
- Honorario.
- Reembolso.
- Cuestionario realizado.
- Submitido.
- Liquidacion.
- Pago.
- Revision admin.
- Conflicto HR/plataforma.
- Modulo habilitado.
- Preview comercial.

## Estado

Este documento es backlog retroactivo de Academia. No implementa frontend ni runtime.
