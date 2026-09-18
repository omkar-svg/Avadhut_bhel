@echo off
title Avadhut Bhel POS - Startup
color 0A

echo.
echo  ==========================================
echo   AVADHUT BHEL POS - Starting All Services
echo  ==========================================
echo.

:: ── Step 1: Check Database Configuration ──────────────────────────────
findstr /i "DATABASE_URL" "%~dp0backend\.env" | findstr /v "^#" >nul 2>&1
if not errorlevel 1 (
    echo  [0/2] Cloud Database detected in backend\.env (Supabase/Cloud PG)
    echo        Skipping local database creation.
) else (
    echo  [0/2] Ensuring local database "avadhut_bhel" exists...

    :: Load local DB credentials from backend\.env
    set PG_PASS=
    set PG_USER=
    set PG_HOST=
    set PG_PORT=

    for /f "usebackq tokens=1,* delims==" %%A in (`findstr /i "^DB_PASSWORD" "%~dp0backend\.env"`) do set PG_PASS=%%B
    for /f "usebackq tokens=1,* delims==" %%A in (`findstr /i "^DB_USERNAME" "%~dp0backend\.env"`) do set PG_USER=%%B
    for /f "usebackq tokens=1,* delims==" %%A in (`findstr /i "^DB_HOST" "%~dp0backend\.env"`) do set PG_HOST=%%B
    for /f "usebackq tokens=1,* delims==" %%A in (`findstr /i "^DB_PORT" "%~dp0backend\.env"`) do set PG_PORT=%%B

    if "%PG_USER%"=="" set PG_USER=postgres
    if "%PG_HOST%"=="" set PG_HOST=localhost
    if "%PG_PORT%"=="" set PG_PORT=5432
    if "%PG_PASS%"=="" set PG_PASS=root

    set PGPASSWORD=%PG_PASS%

    :: Check if local psql exists in path
    where psql >nul 2>&1
    if not errorlevel 1 (
        psql -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -tc "SELECT 1 FROM pg_database WHERE datname='avadhut_bhel'" 2>nul | findstr /c:"1" >nul 2>&1
        if errorlevel 1 (
            echo  Creating database "avadhut_bhel"...
            psql -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -c "CREATE DATABASE avadhut_bhel;" >nul 2>&1
            if errorlevel 1 (
                echo.
                echo  [!] Could not auto-create local database.
                echo      If using local Postgres, create it manually: CREATE DATABASE avadhut_bhel;
                echo.
            ) else (
                echo  Database created successfully!
            )
        ) else (
            echo  Local database already exists.
        )
    ) else (
        echo  psql tool not in PATH. Skipping local database pre-check.
    )
)

echo.

:: ── Step 2: Start Backend ─────────────────────────────────────────────────────
echo  [1/2] Starting Backend API (port 3001)...
start "Avadhut Bhel - Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Small delay so backend can connect and sync tables
timeout /t 3 /nobreak >nul

:: ── Step 3: Start Frontend ────────────────────────────────────────────────────
echo  [2/2] Starting Frontend (port 5173)...
start "Avadhut Bhel - Frontend" cmd /k "cd /d %~dp0 && npm run dev -- --host"

echo.
echo  ==========================================
echo   Both services are starting up!
echo.
echo   Backend  : http://localhost:3001/api/health
echo   Frontend : http://localhost:5173
echo  ==========================================
echo.
pause
