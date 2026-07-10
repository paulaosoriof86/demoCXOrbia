# Resumen addendum para Claude - real connection readiness gate TyA

Fecha: 2026-07-09

## Resumen

Se agrego un gate funcional para validar que la conexion real de datos/fuente no avance si faltan caminos de configuracion y backend que ya son conocidos: proyecto vs periodo, HR/source, usuarios/personas/roles/scopes, Academia/cursos, certificaciones, shoppers, visitas, liquidaciones, reviewQueue, auditEvents y gates.

## Instruccion para prototipo

Claude debe reflejar este patron de forma generica, no exclusiva de TyA:

- no permitir que periodo se convierta en proyecto;
- mostrar readiness por modulo antes de conexion real;
- source/HR debe generar payload source-safe antes de candidatos protegidos;
- cursos, certificaciones, usuarios, roles, liquidaciones y reviewQueue deben tener configuracion visible;
- no prometer conexion real si gates estan apagados;
- no exponer PII en preview.

## Estado

Backend contract/config/script solamente. No conexion real.
