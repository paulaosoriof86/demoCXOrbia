# RESUMEN PARA CLAUDE — C6 Shopper Focal Resolution HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin cambio visual

## Contrato preservado

```text
Usuario Shopper: nombre.apellido
Contraseña: Nombre123*
Formulario único: #loginForm + #lgUser + #lgPass + #lgSubmit
Membership Shopper: no requerido
```

No crear formularios alternos, sufijos visuales, correos técnicos ni excepciones UI mientras backend no cierre las colisiones.

## Resultado backend

La corrección source-only pasó source/static y eliminó el falso hold de nombres incompletos. La revisión provider read-only reveló:

- 109 grupos de `nombre.apellido` repetido;
- 238 perfiles incluidos en esos grupos;
- 1 perfil con dos candidatos Auth;
- 3 perfiles aún sin apellido técnico suficiente;
- 241 perfiles en hold;
- Paula Shopper resuelta técnicamente como un perfil activo y otro histórico preservado.

No se modificaron `app/modules`, estilos, rutas, navegación, portales ni `CX.data`.

## Regla para frontend

No resolver estas colisiones desde la interfaz ni mediante nombre visual. Backend debe distinguir alias históricos y personas activas por `shopperId`, claves legacy, HR, visitas, credencial y Auth. Solo una decisión contractual posterior podría definir cómo representar dos personas activas con el mismo `nombre.apellido`.

## Estado

Cero writes y cero deploy. El bridge de Login single-form continúa source-only y todavía no fue desplegado por este bloque.
