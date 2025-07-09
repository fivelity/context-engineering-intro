@echo off
:: LibreHardwareMonitorLib.dll Download Script (Windows)
:: Downloads the required DLL from the official LibreHardwareMonitor GitHub repository

setlocal enabledelayedexpansion

echo 🔧 LibreHardwareMonitor DLL Download Script
echo ===========================================

:: Configuration
set "DLL_TARGET_DIR=backend\fastapi"
set "DLL_NAME=LibreHardwareMonitorLib.dll"
set "TEMP_DIR=%TEMP%\librehardwaremonitor"
set "REPO_URL=https://api.github.com/repos/LibreHardwareMonitor/LibreHardwareMonitor/releases/latest"

:: Check if DLL already exists
if exist "%DLL_TARGET_DIR%\%DLL_NAME%" (
    echo ⚠️  DLL already exists at %DLL_TARGET_DIR%\%DLL_NAME%
    choice /c YN /m "Do you want to overwrite it"
    if errorlevel 2 (
        echo ℹ️  Keeping existing DLL
        goto :end
    )
    echo 🔄 Overwriting existing DLL...
)

:: Check if required tools are available
echo 🔍 Checking dependencies...

where curl >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ curl is not available
    echo 💡 Install curl or use PowerShell version of this script
    goto :error
)

where tar >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ tar is not available
    echo 💡 Windows 10+ required for built-in tar support
    goto :error
)

echo ✅ Dependencies are available

:: Create target directory if it doesn't exist
if not exist "%DLL_TARGET_DIR%" (
    echo ⚠️  Target directory doesn't exist. Creating...
    mkdir "%DLL_TARGET_DIR%"
    echo ✅ Target directory created: %DLL_TARGET_DIR%
)

:: Create temp directory
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

:: Get latest release information (simplified approach)
echo 🔍 Fetching latest release information...
echo This may take a moment...

:: Download using a known stable release URL pattern
:: Note: This is a simplified approach. For production, parse JSON properly.
set "DOWNLOAD_URL=https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/releases/latest/download/LibreHardwareMonitor-net472.zip"

echo 📦 Attempting download from: %DOWNLOAD_URL%

:: Download the zip file
echo 📥 Downloading LibreHardwareMonitor release...
curl -L -o "%TEMP_DIR%\librehardwaremonitor.zip" "%DOWNLOAD_URL%"

if %errorlevel% neq 0 (
    echo ❌ Failed to download the release
    echo 💡 Trying alternative download method...
    
    :: Fallback: try direct release download
    set "ALT_URL=https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/releases/download/v0.9.0/LibreHardwareMonitor-net472.zip"
    curl -L -o "%TEMP_DIR%\librehardwaremonitor.zip" "!ALT_URL!"
    
    if !errorlevel! neq 0 (
        echo ❌ Alternative download also failed
        goto :cleanup_error
    )
)

echo ✅ Download completed

:: Extract the zip file using built-in tar
echo 📂 Extracting archive...
cd /d "%TEMP_DIR%"
tar -xf librehardwaremonitor.zip

if %errorlevel% neq 0 (
    echo ❌ Failed to extract the archive
    goto :cleanup_error
)

echo ✅ Archive extracted

:: Find the DLL file
echo 🔍 Searching for %DLL_NAME%...
set "DLL_PATH="

:: Search in common locations within the extracted files
for /r "%TEMP_DIR%" %%f in (%DLL_NAME%) do (
    set "DLL_PATH=%%f"
    goto :found_dll
)

echo ❌ Could not find %DLL_NAME% in the downloaded archive
echo 💡 Available DLL files:
for /r "%TEMP_DIR%" %%f in (*.dll) do echo   %%f
goto :cleanup_error

:found_dll
echo ✅ Found DLL: !DLL_PATH!

:: Go back to project root
cd /d "%~dp0"

:: Copy the DLL to the target directory
echo 📋 Copying DLL to target directory...
copy "!DLL_PATH!" "%DLL_TARGET_DIR%\%DLL_NAME%"

if %errorlevel% neq 0 (
    echo ❌ Failed to copy DLL to target directory
    goto :cleanup_error
)

echo ✅ DLL copied successfully to %DLL_TARGET_DIR%\%DLL_NAME%

:: Verify the DLL
echo 🔍 Verifying DLL installation...
if exist "%DLL_TARGET_DIR%\%DLL_NAME%" (
    for %%f in ("%DLL_TARGET_DIR%\%DLL_NAME%") do set "filesize=%%~zf"
    echo ✅ DLL verified: %DLL_NAME% (!filesize! bytes)
    echo 📍 Location: %CD%\%DLL_TARGET_DIR%\%DLL_NAME%
) else (
    echo ❌ DLL verification failed
    goto :cleanup_error
)

:: Cleanup and show instructions
goto :cleanup_success

:cleanup_error
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
echo ❌ DLL installation failed
goto :error

:cleanup_success
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
echo 🧹 Cleanup completed

echo.
echo 📋 Usage Instructions:
echo ✅ LibreHardwareMonitorLib.dll is now ready for use
echo.
echo 📝 Next steps:
echo 1. Install Python dependencies: pip install -r backend\fastapi\requirements.txt
echo 2. Start the backend server: python backend\fastapi\main.py
echo 3. The DLL will be automatically loaded by the HardwareMonitor package
echo.
echo ⚠️  Important Notes:
echo • Hardware monitoring requires administrator privileges on Windows
echo • Run the backend server as Administrator for full sensor access
echo • The DLL is a Windows .NET assembly
echo.
echo 🔗 More info: https://github.com/LibreHardwareMonitor/LibreHardwareMonitor
echo.
echo 🎉 LibreHardwareMonitor DLL installation completed successfully!
goto :end

:error
echo ❌ Script execution failed
exit /b 1

:end
pause