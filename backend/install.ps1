# ==============================================================================
# install.ps1 -- iPhone Duo Fold Overlay installer
# Run with:  powershell -ExecutionPolicy Bypass -File install.ps1
# ==============================================================================

param(
    [switch]$NoStartup,   # Skip adding to Windows startup
    [switch]$BuildExe,    # Build standalone .exe via PyInstaller after install
    [switch]$Uninstall    # Remove startup entry and clean up
)

$ErrorActionPreference = "Stop"

$SCRIPT_DIR  = Split-Path -Parent $MyInvocation.MyCommand.Path
$REG_KEY     = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$REG_VALUE   = "FoldOverlay"
$STARTUP_CMD = "pythonw `"$SCRIPT_DIR\fold_overlay.py`""

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

function Write-Header($text) {
    Write-Host ""
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "  $("-" * $text.Length)" -ForegroundColor DarkCyan
}

function Write-OK($text) {
    Write-Host "  [OK] $text" -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host "  [!!] $text" -ForegroundColor Yellow
}

function Write-Err($text) {
    Write-Host "  [XX] $text" -ForegroundColor Red
}

# ------------------------------------------------------------------------------
# Uninstall mode
# ------------------------------------------------------------------------------

if ($Uninstall) {
    Write-Header "Uninstalling FoldOverlay"
    try {
        Remove-ItemProperty -Path $REG_KEY -Name $REG_VALUE -ErrorAction SilentlyContinue
        Write-OK "Startup entry removed"
    } catch {
        Write-Warn "No startup entry found (already removed or never added)"
    }
    Write-OK "Done. Python packages were NOT removed."
    Write-Host "      To remove them: pip uninstall pillow pywin32 wmi pystray" -ForegroundColor Gray
    exit 0
}

# ------------------------------------------------------------------------------
# Banner
# ------------------------------------------------------------------------------

Write-Host ""
Write-Host "  +==================================================+" -ForegroundColor Blue
Write-Host "  |   iPhone Duo Fold Overlay -- Installer v1.0     |" -ForegroundColor Blue
Write-Host "  +==================================================+" -ForegroundColor Blue
Write-Host ""

# ------------------------------------------------------------------------------
# Step 1: Python check
# ------------------------------------------------------------------------------

Write-Header "Step 1 -- Python"

$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $ver = & $cmd --version 2>&1
        if ($ver -match "Python 3") {
            $pythonCmd = $cmd
            Write-OK "Found: $ver  ($cmd)"
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Err "Python 3 not found in PATH."
    Write-Host "  Download: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  Then re-run this installer." -ForegroundColor Yellow
    exit 1
}

# ------------------------------------------------------------------------------
# Step 2: pip packages
# ------------------------------------------------------------------------------

Write-Header "Step 2 -- Python packages"

$packages = @("pillow", "pywin32", "wmi", "pystray")

foreach ($pkg in $packages) {
    Write-Host "  Installing $pkg ..." -NoNewline
    try {
        & $pythonCmd -m pip install --quiet --upgrade $pkg 2>&1 | Out-Null
        Write-Host " done" -ForegroundColor Green
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Warn "Could not install $pkg -- continuing (reduced functionality)"
    }
}

# pywin32 post-install DLL registration
try {
    $sitePackages = & $pythonCmd -c "import site; print(site.getsitepackages()[0])" 2>&1
    $postInstall  = Join-Path $sitePackages "pywin32_postinstall.py"
    if (Test-Path $postInstall) {
        Write-Host "  Running pywin32 post-install ..." -NoNewline
        & $pythonCmd $postInstall -install 2>&1 | Out-Null
        Write-Host " done" -ForegroundColor Green
    }
} catch {
    Write-Warn "pywin32 post-install step skipped (may cause issues on first run)"
}

# ------------------------------------------------------------------------------
# Step 3: Sensor probe
# ------------------------------------------------------------------------------

Write-Header "Step 3 -- Hinge sensor probe"

try {
    $sensorResult = Get-WmiObject -Namespace "root\WMI" -Class "MSHingeAngle" `
                    -ErrorAction SilentlyContinue
    if ($sensorResult) {
        Write-OK "MSHingeAngle class found -- real sensor data will be used"
        foreach ($r in $sensorResult) {
            Write-Host "  -> CurrentAngle = $($r.CurrentAngle) degrees" -ForegroundColor DarkGreen
        }
    } else {
        Write-Warn "MSHingeAngle not found -- overlay will use simulation mode"
    }
} catch {
    Write-Warn "WMI query failed -- overlay will use simulation mode"
}

# ------------------------------------------------------------------------------
# Step 4: Windows startup (optional)
# ------------------------------------------------------------------------------

Write-Header "Step 4 -- Windows startup"

if ($NoStartup) {
    Write-Warn "Skipped (--NoStartup flag set)"
} else {
    try {
        Set-ItemProperty -Path $REG_KEY -Name $REG_VALUE -Value $STARTUP_CMD
        Write-OK "Added to startup: $STARTUP_CMD"
    } catch {
        Write-Warn "Could not write to registry -- run as Administrator if needed"
        Write-Warn "Manual: regedit -> HKCU\...\Run -> add FoldOverlay = $STARTUP_CMD"
    }
}

# ------------------------------------------------------------------------------
# Step 5: Build .exe (optional)
# ------------------------------------------------------------------------------

Write-Header "Step 5 -- PyInstaller build"

if ($BuildExe) {
    Write-Host "  Installing PyInstaller ..." -NoNewline
    try {
        & $pythonCmd -m pip install --quiet pyinstaller | Out-Null
        Write-Host " done" -ForegroundColor Green
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
    }

    Write-Host "  Building fold_overlay.exe ..."
    Push-Location $SCRIPT_DIR
    try {
        & $pythonCmd -m PyInstaller --noconsole --onefile fold_overlay.py
        Write-OK "Built: $SCRIPT_DIR\dist\fold_overlay.exe"
    } catch {
        Write-Err "PyInstaller build failed -- check output above"
    }
    Pop-Location
} else {
    Write-Warn "Skipped (pass -BuildExe to build a standalone .exe)"
}

# ------------------------------------------------------------------------------
# Done
# ------------------------------------------------------------------------------

Write-Host ""
Write-Host "  +==================================================+" -ForegroundColor Green
Write-Host "  |   Installation complete!                         |" -ForegroundColor Green
Write-Host "  |                                                  |" -ForegroundColor Green
Write-Host "  |   Run now:  python fold_overlay.py               |" -ForegroundColor Green
Write-Host "  |   Quit:     tray icon -> Quit                    |" -ForegroundColor Green
Write-Host "  |   Uninstall: .\install.ps1 -Uninstall            |" -ForegroundColor Green
Write-Host "  +==================================================+" -ForegroundColor Green
Write-Host ""
