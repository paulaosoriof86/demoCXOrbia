# ACADEMIA — IMPACTO I3.5C · IDENTIDAD DURABLE Y MULTIPROYECTO

**Fecha:** 2026-08-17 16:15 -06:00  
**Estado:** `ALIGNED__PERIOD_INDEPENDENT_IDENTITY__MULTI_TENANT__MULTI_PROJECT`

## Concepto a incorporar

La identidad de un Shopper no pertenece a un mes operativo. Agosto, septiembre o cualquier período posterior son ventanas de operación; no deben generar una identidad nueva ni exigir rehacer autenticación/crosswalk.

## Diferencias que deben enseñarse

1. **Identidad canónica:** quién es el Shopper dentro del tenant.
2. **Identificador source-safe:** referencia técnica de una fuente externa; por sí sola puede no demostrar identidad.
3. **Authority record:** evidencia que autoriza relacionar un identificador de origen con el Shopper canónico.
4. **Período:** dimensión operacional de visitas, no dimensión de identidad.
5. **Project scope:** limita un vínculo cuando el upstream identifier solo es válido dentro de un proyecto.
6. **Tenant-wide scope:** permite reutilizar un vínculo entre proyectos del mismo tenant solo cuando la fuente realmente comparte esa identidad.

## Regla reusable

Un vínculo durable vive en:

`tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}`

No incorpora `periodKey` en su identidad. Una sola adjudicación exacta debe resolver futuros períodos sin duplicar decisiones.

## Anti-patrones

- crear un crosswalk nuevo por mes;
- asumir que mismo nombre = misma persona;
- usar email/teléfono/WhatsApp/username/shopperCode como autoridad única;
- copiar identidad entre tenants;
- usar un vínculo project-specific como si fuera global;
- pedir de nuevo credenciales a un Shopper ya autenticado solo porque cambia el período.

## Ejemplo pedagógico

Si una relación exacta fue autorizada en agosto, al aparecer septiembre el sistema debe reutilizar el mismo vínculo. Si aparece un identificador fuente verdaderamente nuevo y sin autoridad, debe abrir una sola revisión durable, no una revisión distinta por cada mes.

## Alta desde plataforma

El flujo correcto se enseña como:

`Auth → claims → membership → profile → identity link platform_created → provider ACK`.

Ese link sigue siendo válido cuando cambian período o ventana operacional.

## Multi-proyecto

La arquitectura debe distinguir entre:

- identidad tenant-wide cuando la fuente lo permite;
- identidad project-specific cuando el identificador upstream solo existe dentro del proyecto.

La plataforma no debe codificar el nombre del cliente, del tenant ni del proyecto como lógica global.

## Fuente vigente

`SOURCE-LOCK-I3-5C-1-PERIOD-INDEPENDENT-IDENTITY-ROLL-FORWARD-SOURCE-PASS-20260817.md`.
