@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   VNotes - Automated Verification ^& Commit Script
echo ===================================================
echo.

:: 1. Check Git availability
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    exit /b 1
)

:: 2. Determine commit message
set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=docs: consolidate markdown files into docs/, resolve linting errors, and improve npm scripts"
)

echo [INFO] Running preflight check...
call npm run predev
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Preflight checks failed. Aborting commit.
    exit /b 1
)

echo.
echo [INFO] Staging all updated files...
git add -A

echo.
echo [INFO] Git status summary:
git status -s

echo.
echo [INFO] Committing changes with message:
echo "%COMMIT_MSG%"
echo.

git commit -m "%COMMIT_MSG%"
if %ERRORLEVEL% neq 0 (
    echo [WARN] Nothing to commit or git commit encountered an issue.
) else (
    echo.
    echo ===================================================
    echo   [SUCCESS] Changes committed successfully!
    echo ===================================================
)

endlocal
