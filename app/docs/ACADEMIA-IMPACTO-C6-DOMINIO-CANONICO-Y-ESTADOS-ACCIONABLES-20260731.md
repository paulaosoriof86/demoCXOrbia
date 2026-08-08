# Academia — impacto de dominio canónico y estados accionables Corte 6

**Fecha:** 2026-07-31  
**Estado:** documental; sin providers ni deploy.

## 1. Regla transversal
Academia, manuales y rutas por rol deben enseñar que todas las pantallas consumen el mismo read model canónico. Dashboard, Visitas, histórico, Shopper, liquidaciones y beneficios no pueden interpretar estados por separado.

## 2. Progresión de visita
La progresión operativa es acumulativa:
`asignada → agendada → realizada → cuestionario completado → submitida → liquidada → pagada`.

Un estado posterior conserva evidencia de los anteriores. Por ejemplo, una visita submitida también fue realizada y tuvo cuestionario, pero no permanece como pendiente de cuestionario ni pendiente de submitir.

## 3. Evidencia histórica frente a estado accionable
Debe distinguirse:
- **evidencia fuera de rango:** la visita tuvo un evento o antecedente fuera de rango;
- **fuera de rango accionable:** sigue sin resolverse y requiere gestión.

En julio existen siete evidencias históricas, pero solo una visita fuera de rango actualmente accionable. Los manuales no deben confundir auditoría histórica con cola operativa.

## 4. Identidad Shopper
La identidad se vincula por llaves técnicas exactas. Coincidencias de nombre, teléfono o email no autorizan fusión automática.

Cuando falta crosswalk:
- el perfil queda en revisión;
- no se anexa como segundo shopper operacional;
- no se divide el histórico entre dos filas;
- Admin debe ver claramente el estado de certificación y completitud real.

## 5. Perfil completo
“Completo” exige como mínimo:
- identidad canónica;
- contacto real disponible;
- usuario;
- contraseña o credencial válida según el contrato del tenant.

Un flag heredado no basta. WhatsApp no se inventa ni se deduce de similitud.

## 6. Refresh no intrusivo
La actualización HR ocurre en background:
- mismo contenido: no cambia la pantalla;
- cambio real: un solo render;
- se preservan periodo, proyecto, vista, scroll del contenido y scroll del menú;
- modal o formulario activo difiere el render.

## 7. Finanzas y beneficios
Movimientos, liquidaciones, pagos y beneficios usan el mismo periodo e identidad. “Pagado” requiere fuente confirmada; “liquidación candidata” no es deuda final ni pago.

## 8. Rutas por rol
- **Admin/Coordinación:** leer KPIs, detalles y certificación desde la misma fuente; revisar conflictos sin fusionar por similitud.
- **Shopper:** ver todas sus visitas activas e históricas asociadas a su identidad canónica y sus beneficios derivados de liquidaciones reales.
- **Finanzas:** distinguir candidato, conciliado, lote y pago confirmado; conservar país y moneda.
- **Superadmin:** exigir gate semántico transversal, no solo asset/syntax smoke.

## 9. Checklist reusable para releases
1. Los KPIs y sus detalles suman exactamente lo mismo.
2. Las fases usan una única máquina de estados.
3. El periodo visible coincide con el modelo y el contenido.
4. El refresh no desplaza la interfaz.
5. El listado Shopper no contiene perfiles protegidos sin crosswalk.
6. Perfil completo se calcula con datos reales.
7. Certificación es visible según rol.
8. Portal Shopper muestra histórico completo.
9. Beneficios y finanzas conservan periodo, identidad, moneda y fuente.
10. Un gate sintético no reemplaza la validación humana acumulativa.

## 10. Estado seguro
Este documento no modifica UI, no activa proveedores, no escribe datos y no entra a producción.
