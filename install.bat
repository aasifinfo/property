@echo off
setlocal enabledelayedexpansion

:: Smart Install Script for Next.js + Supabase Template (Windows)
:: Automatically detects available ports and configures the entire stack

echo.
echo 🚀 Smart Setup for Next.js + Supabase Template
echo This script will automatically configure your development environment
echo.

:: Function to check if a port is available
:check_port
netstat -an | findstr ":%1 " >nul 2>&1
if !errorlevel! equ 0 (
    exit /b 1
) else (
    exit /b 0
)

:: Function to find available port
:find_available_port
set base_port=%1
set /a port=%base_port%
set /a max_tries=50
set /a tries=0

:port_loop
if !tries! geq !max_tries! (
    echo ❌ Could not find available port starting from %base_port%
    exit /b 1
)

call :check_port !port!
if !errorlevel! equ 0 (
    set %2=!port!
    exit /b 0
)

set /a port=!port!+1
set /a tries=!tries!+1
goto port_loop

:: Check prerequisites
echo 🔍 1. Checking prerequisites...

:: Check Node.js
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo   ❌ Node.js: Not found
    set prerequisites_failed=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set node_version=%%i
    echo   ✅ Node.js: !node_version!
)

:: Check npm
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo   ❌ npm: Not found
    set prerequisites_failed=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set npm_version=%%i
    echo   ✅ npm: !npm_version!
)

:: Check Docker
where docker >nul 2>&1
if !errorlevel! neq 0 (
    echo   ❌ Docker: Not found
    set prerequisites_failed=1
) else (
    for /f "tokens=3" %%i in ('docker --version') do set docker_version=%%i
    set docker_version=!docker_version:,=!
    echo   ✅ Docker: !docker_version!
)

:: Check Docker Compose
where docker-compose >nul 2>&1
if !errorlevel! neq 0 (
    echo   ❌ Docker Compose: Not found
    set prerequisites_failed=1
) else (
    for /f "tokens=3" %%i in ('docker-compose --version') do set compose_version=%%i
    set compose_version=!compose_version:,=!
    echo   ✅ Docker Compose: !compose_version!
)

if defined prerequisites_failed (
    echo.
    echo ❌ Some prerequisites are missing. Please install them first.
    echo See the README.md for installation instructions.
    pause
    exit /b 1
)

echo   🎉 All prerequisites are installed!

:: Detect available ports
echo.
echo 🔍 2. Detecting available ports...

call :find_available_port 5432 POSTGRES_PORT
if 5432 equ !POSTGRES_PORT! (
    echo   ✅ PostgreSQL Database: !POSTGRES_PORT! ^(default^)
) else (
    echo   🔄 PostgreSQL Database: !POSTGRES_PORT! ^(5432 was busy^)
)

call :find_available_port 8000 KONG_PORT
if 8000 equ !KONG_PORT! (
    echo   ✅ Supabase API Gateway: !KONG_PORT! ^(default^)
) else (
    echo   🔄 Supabase API Gateway: !KONG_PORT! ^(8000 was busy^)
)

call :find_available_port 8001 API_PORT
if 8001 equ !API_PORT! (
    echo   ✅ FastAPI Backend: !API_PORT! ^(default^)
) else (
    echo   🔄 FastAPI Backend: !API_PORT! ^(8001 was busy^)
)

call :find_available_port 3000 FRONTEND_PORT
if 3000 equ !FRONTEND_PORT! (
    echo   ✅ Next.js Frontend: !FRONTEND_PORT! ^(default^)
) else (
    echo   🔄 Next.js Frontend: !FRONTEND_PORT! ^(3000 was busy^)
)

call :find_available_port 9000 EMAIL_PORT
if 9000 equ !EMAIL_PORT! (
    echo   ✅ Email UI ^(Inbucket^): !EMAIL_PORT! ^(default^)
) else (
    echo   🔄 Email UI ^(Inbucket^): !EMAIL_PORT! ^(9000 was busy^)
)

:: Generate Docker Compose configuration
echo.
echo 📝 3. Generating Docker Compose configuration...

if exist docker-compose.template.yml (
    powershell -Command "(Get-Content docker-compose.template.yml) -replace '{{POSTGRES_PORT}}', '!POSTGRES_PORT!' -replace '{{KONG_PORT}}', '!KONG_PORT!' -replace '{{API_PORT}}', '!API_PORT!' -replace '{{EMAIL_PORT}}', '!EMAIL_PORT!' | Set-Content docker-compose.override.yml"
) else (
    powershell -Command "(Get-Content docker-compose.yml) -replace ':5432\":', ':!POSTGRES_PORT!\":' -replace ':8000\":', ':!KONG_PORT!\":' -replace ':8001\":', ':!API_PORT!\":' -replace ':9000\":', ':!EMAIL_PORT!\":' | Set-Content docker-compose.override.yml"
)

echo   ✅ Docker Compose configuration generated

:: Generate environment files
echo.
echo ⚙️ 4. Generating environment configuration...

if not exist front mkdir front
if not exist back mkdir back

:: Create frontend environment file
(
echo # Auto-generated environment variables
echo NEXT_PUBLIC_SUPABASE_URL=http://localhost:!KONG_PORT!
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:!API_PORT!
echo.
echo # Port configuration ^(for reference^)
echo FRONTEND_PORT=!FRONTEND_PORT!
) > front\.env.local

:: Create backend environment file
(
echo # Auto-generated environment variables
echo SUPABASE_URL=http://localhost:!KONG_PORT!
echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
echo ENV=development
echo.
echo # Port configuration ^(for reference^)
echo API_PORT=!API_PORT!
echo DATABASE_PORT=!POSTGRES_PORT!
) > back\.env

echo   ✅ Environment files generated

:: Start Docker services
echo.
echo 🐳 5. Starting Docker services...
echo   This may take a few minutes on first run ^(downloading images^)...

docker-compose up -d
if !errorlevel! neq 0 (
    echo   ❌ Failed to start Docker services
    echo   Try: docker-compose down ^&^& docker system prune -f
    pause
    exit /b 1
)

echo   ✅ Docker services started successfully

:: Install frontend dependencies
echo.
echo 📦 6. Installing frontend dependencies...

cd front
npm install
if !errorlevel! neq 0 (
    echo   ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo   ✅ Frontend dependencies installed

:: Wait for services to initialize
echo.
echo ⏳ Waiting for services to fully initialize...
timeout /t 5 /nobreak >nul

:: Verify services
echo.
echo 🔍 7. Verifying services are running...

docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if !errorlevel! equ 0 (
    echo   ✅ PostgreSQL: Running on port !POSTGRES_PORT!
) else (
    echo   ⚠️  PostgreSQL: Started but not responding yet
)

:: Save port configuration
(
echo {
echo   "ports": {
echo     "postgres": !POSTGRES_PORT!,
echo     "kong": !KONG_PORT!,
echo     "api": !API_PORT!,
echo     "frontend": !FRONTEND_PORT!,
echo     "email": !EMAIL_PORT!
echo   },
echo   "generatedAt": "%date:~10,4%-%date:~4,2%-%date:~7,2%T%time:~0,8%.000Z",
echo   "services": {
echo     "frontend": "http://localhost:!FRONTEND_PORT!",
echo     "api": "http://localhost:!API_PORT!",
echo     "database": "localhost:!POSTGRES_PORT!",
echo     "supabase": "http://localhost:!KONG_PORT!",
echo     "email": "http://localhost:!EMAIL_PORT!"
echo   }
echo }
) > .dev-ports.json

:: Display success message
echo.
echo ============================================================
echo 🎉 Setup Complete! Your development environment is ready.
echo ============================================================
echo.
echo Services running on:
echo ├── 🌐 Frontend:     http://localhost:!FRONTEND_PORT!
echo ├── ⚡ API:          http://localhost:!API_PORT!
echo ├── 🗄️  Database:    localhost:!POSTGRES_PORT!
echo ├── 🔐 Supabase:     http://localhost:!KONG_PORT!
echo └── 📧 Email UI:     http://localhost:!EMAIL_PORT!
echo.
echo Next steps:
echo 1. Start frontend: cd front ^&^& npm run dev
echo 2. Open http://localhost:!FRONTEND_PORT! in your browser
echo 3. Start coding! The 3-tier Claude framework is ready.
echo.
echo 💡 Tips:
echo • Your port configuration is saved in .dev-ports.json
echo • Run "docker-compose down" to stop services
echo • Run "docker-compose up -d" to restart services
echo • Need help? Check the troubleshooting guide in README.md
echo.

pause