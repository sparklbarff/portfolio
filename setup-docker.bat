@echo off
REM Windows batch script to setup Docker environment

echo Starting Portfolio Docker Setup...
echo ================================

REM Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running or not installed
    echo Please start Docker Desktop first
    pause
    exit /b 1
)

echo Docker is running!

REM Build the container
echo Building portfolio development container...
docker build -t portfolio-dev .
if errorlevel 1 (
    echo ERROR: Failed to build container
    pause
    exit /b 1
)

REM Start the development environment
echo Starting development environment...
docker-compose up -d portfolio-dev
if errorlevel 1 (
    echo ERROR: Failed to start development environment
    pause
    exit /b 1
)

echo.
echo SUCCESS! Your portfolio is now running in Docker!
echo ================================================
echo.
echo Development server: http://localhost:3001
echo.
echo To stop: docker-compose down
echo To view logs: docker-compose logs -f portfolio-dev
echo.
pause
