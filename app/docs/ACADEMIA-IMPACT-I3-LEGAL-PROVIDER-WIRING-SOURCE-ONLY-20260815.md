# ACADEMIA — IMPACTO I3 LEGAL PROVIDER / V0.4 · 2026-08-16

## Estado

Provider legal durable continúa source-only PASS. Paula decidió que la indisponibilidad temporal de counsel no bloqueará el go-live interino. La revisión profesional GT/HN queda diferida post-go-live y no debe presentarse como completada.

Vigentes:
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`;
- `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`;
- V0.3 + paquete GT/HN/X + matriz primaria como soporte del counsel posterior.

## Regla editorial nueva

Academia debe distinguir tres estados:
1. **configuración legal editable no-code**;
2. **versión legal publicada/inmutable aceptada por el usuario**;
3. **revisión profesional pendiente/completada**.

Una versión puede ser publicada operativamente sin poder afirmar que fue revisada por abogado. La interfaz, manuales y capacitación nunca deben convertir `counsel diferido` en `aprobado legalmente`.

## Aceptación

La aceptación continúa siendo exclusivamente humana. QA, GitHub Actions, Make, Gemini, IA, scripts o administradores técnicos no aceptan por el usuario. `#bnOk`, navegación y localStorage no son autoridad de consentimiento.

El receipt válido queda ligado a identidad autenticada exacta, tenant/scope/rol, versión, digest y timestamp del servidor.

## No-code y rebranding

Hay dos conceptos que no deben confundirse:
- **perfil legal mutable:** operador, contactos, dirección pública, nombre visible, retención, providers, políticas y configuración por proyecto;
- **versión publicada:** snapshot inmutable de los valores y texto que realmente aceptó el usuario.

Rebranding, correo o configuración posterior no reescriben una versión histórica. Marca visible, registro marcario y titular/licenciante son conceptos separados.

## Por rol

**Shopper:** versión que acepta; confidencialidad; autenticidad de visita; evidencia solo según proyecto; no compartir cuenta; no reutilizar material; seguridad bancaria/documental; incidentes.

**Admin/Operaciones:** mínimo privilegio; distinguir perfil editable vs versión publicada; no sobrescribir versiones; no fuzzy matching; no exponer domicilio/banco/documentos restringidos.

**Cliente:** confidencialidad recíproca; protección de identidad Shopper; uso limitado de resultados; obligaciones de datos/evidencias; no represalias/contacto fuera del flujo.

**Superadmin/tenant admin:** gestionar perfil no-code, Provider Registry, retención/evidencias y rebranding sin volver global una regla de tenant/proyecto.

## Evidencias y retención

Foto/video/audio/geolocalización/comprobantes pertenecen al proyecto. Debe enseñarse dónde se configuran y que audio/biometría/reconocimiento facial u otros tratamientos de alto impacto requieren controles adicionales cuando corresponda.

Para TyA: piso 60/default 90 días para evidencia cruda como regla operativa. No enseñar que todo se borra a 90 días: documentación empresarial, pagos, auditoría y receipts pueden requerir plazos mayores o legal hold.

## Honduras / fuentes

Decreto 149-2014 sobre Comercio Electrónico se conserva como referencia junto con Decreto 149-2013 de Firmas Electrónicas y Reglamento 41-2014. Academia no debe resumir esto como “cualquier clic es firma válida”.

## Qué NO debe enseñar o simular

- que V0.4 fue revisada por abogado;
- que counsel post-go-live está cerrado;
- aceptación automatizada;
- `#bnOk`/localStorage como consentimiento;
- provider deshabilitado como receptor actual;
- domicilio restringido como información pública automática;
- marca no registrada como registrada;
- Cinépolis u otro proyecto como regla global;
- cualquier click como firma avanzada;
- arbitraje universal para todo usuario.

## Impacto editorial futuro

Cuando provider legal real quede activado/validado, actualizar:
- ruta por rol de aceptación legal;
- manual `Legal y cumplimiento`;
- `Crear/Editar proyecto > Evidencias y privacidad`;
- checklist de publicación/versionado;
- Provider Registry;
- errores frecuentes: versión pendiente, cambio material, provider inactivo, dato restringido, aceptación faltante;
- notificación de nueva versión cuando requiera reaceptación;
- estado visible `revisión profesional pendiente/completada` sin exponer detalles técnicos internos.

No incluir hashes internos, IDs de runs, credenciales, rutas privadas ni detalles del runner en Academia visible.

Academia/Certificación del Shopper histórico permanecen diferidas y no se declaran PASS por este bloque.
