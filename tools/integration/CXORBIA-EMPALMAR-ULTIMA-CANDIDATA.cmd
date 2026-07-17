@echo off
setlocal
cd /d "%~dp0\..\.."
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta disponible.
  pause
  exit /b 1
)
node tools\integration\run-latest.mjs
set EXIT_CODE=%ERRORLEVEL%
if not "%EXIT_CODE%"=="0" (
  echo.
  echo El empalme se detuvo de forma segura. No se debe forzar ni usar rutas alternativas.
) else (
  echo.
  echo Empalme completado. Revise el commit, el reporte y luego la validacion visual.
)
pause
exit /b %EXIT_CODE%
