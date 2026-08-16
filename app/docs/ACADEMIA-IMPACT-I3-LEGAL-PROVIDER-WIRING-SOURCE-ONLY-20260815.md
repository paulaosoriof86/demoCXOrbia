# ACADEMIA — IMPACTO I3 LEGAL PROVIDER / V0.3 · 2026-08-15

## Estado

Provider legal durable source-only continúa PASS. Este bloque añadió:
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`;
- `CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`;
- `PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`.

Gate canónico de fuente: run `31921002582`, job `95100754570`, SUCCESS. V0.3 sigue `NOT_APPROVED / NOT_PUBLISHED`; no provider IO ni aceptación real.

## Patrón que Academia deberá explicar cuando el provider real esté activo

Hay dos conceptos distintos que no deben confundirse:

1. **Configuración legal editable no-code:** datos de tenant, contactos, nombre visible, retención, dirección pública, proveedores y políticas configurables según permisos.
2. **Versión legal publicada:** copia inmutable de los valores públicos y texto que efectivamente aceptó el usuario. Se conserva con versión/digest y no cambia retroactivamente cuando un administrador modifica la configuración.

Un cambio material puede generar nueva versión y nueva aceptación humana. Un cambio no material no reescribe la historia.

## Por rol

**Shopper:** entender qué versión acepta; confidencialidad; autenticidad de visitas; evidencia solo según proyecto; no compartir cuenta; no reutilizar material; seguridad bancaria/documental; reportar incidentes.

**Admin/Operaciones:** mínimo privilegio; editar configuración legal solo con permiso; distinguir `borrador / en revisión / publicado`; no sobrescribir versiones publicadas; no fuzzy matching de identidad; no exponer domicilio/banco/documentos restringidos.

**Cliente:** confidencialidad recíproca; protección de identidad Shopper; uso limitado de resultados; obligaciones de datos/evidencias del proyecto; no represalias/contacto fuera del flujo.

**Superadmin/tenant admin:** gestionar perfil no-code, Provider Registry, reglas de retención/evidencias y rebranding sin convertir decisiones de un tenant/proyecto en lógica global.

## Rebranding

Los manuales deben usar “la Plataforma” o el nombre visible dinámico. No fijar CXOrbia/Gravicentra como nombre perpetuo. Marca visible, registro marcario y titular/licenciante son conceptos separados.

## Evidencias y retención

Las reglas de foto/video/audio/geolocalización/comprobantes pertenecen al proyecto. Academia deberá enseñar dónde se configuran, qué significa opcional/obligatorio/no requerido y cuándo un tratamiento de alto impacto exige revisión adicional.

Para TyA, la propuesta inicial conserva piso 60 días/default 90 para evidencia cruda, pero no debe enseñar que todo dato se destruye a 90 días: documentación empresarial, pagos, auditoría y receipts pueden requerir plazos mayores/legal hold.

## Qué NO debe enseñar o simular

- QA/GitHub/automatizaciones/Make/Gemini no aceptan ni firman por el usuario.
- `#bnOk` y localStorage no son consentimiento legal.
- Un receipt de otra cuenta/rol/proyecto/versión no satisface el gate.
- V0.3 no es texto definitivo hasta revisión jurídica y aprobación humana.
- Placeholders/template no son documento publicable.
- Un cambio no-code nunca debe alterar una versión histórica ya aceptada.
- Domicilio registrado restringido no se muestra automáticamente.
- Proveedores deshabilitados no son receptores actuales.
- Marca no registrada no se presenta como registrada.
- Cinépolis u otro proyecto no crea reglas globales.

## Impacto editorial futuro

Cuando el provider legal real quede activado/validado, actualizar:
- ruta por rol sobre aceptación legal;
- manual de `Legal y cumplimiento`;
- manual de `Crear/Editar proyecto > Evidencias y privacidad`;
- checklist de publicación de nueva versión;
- guía de Provider Registry;
- errores frecuentes: versión pendiente, cambio material, proveedor no activo, dato restringido, aceptación faltante;
- notificación de nueva versión legal cuando requiera reaceptación.

No incluir hashes internos, IDs de runs, credenciales, rutas privadas ni detalles del runner en contenidos visibles de Academia.

Academia/Certificación del Shopper histórico permanecen diferidas y no se declaran PASS por este bloque.
