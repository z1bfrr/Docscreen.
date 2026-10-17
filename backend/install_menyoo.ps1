# ==============================================================================
# install_menyoo.ps1 -- Menyoo Mod Menu installer for GTA 5 Enhanced
# Run with:  powershell -ExecutionPolicy Bypass -File install_menyoo.ps1
# ==============================================================================
#
#  What this script does:
#    1. Auto-detects your GTA 5 Enhanced installation directory
#    2. Downloads Script Hook V (required dependency)
#    3. Downloads Menyoo SP
#    4. Installs all files to the GTA 5 root folder
#    5. Verifies the installation
#
#  Requirements:
#    - GTA 5 Enhanced installed (Steam, Epic, or Rockstar)
#    - Internet connection (for downloads)
#    - Run as Administrator (recommended)
#
# ==============================================================================

param(
    [string]$GTAPath = "",        # Override auto-detect: -GTAPath "D:\GTA5"
    [switch]$SkipSHV,            # Skip Script Hook V download
    [switch]$SkipMenyoo,         # Skip Menyoo download
    [switch]$Uninstall,          # Remove Menyoo files from GTA directory
    [switch]$Verify              # Only verify existing installation
)

$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"  # Speeds up Invoke-WebRequest

# ------------------------------------------------------------------------------
# Config
# ------------------------------------------------------------------------------

$TMP_DIR         = Join-Path $env:TEMP "MenyooInstall"
$MENYOO_ASI      = "Menyoo.asi"
$MENYOO_STUFF    = "menyooStuff"
$SHV_DLL         = "ScriptHookV.dll"
$SHV_ASI_LOADER  = "dinput8.dll"

# Menyoo GitHub releases API (latest)
$MENYOO_API_URL  = "https://api.github.com/repos/MAFINS/MenyooSP/releases/latest"

# Script Hook V (dev-c.com) -- update URL if site changes
$SHV_URL         = "http://www.dev-c.com/files/ScriptHookV_1.0.3411.0.zip"

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

function Write-Banner($title, $color = "Blue") {
    $line = "=" * 54
    Write-Host ""
    Write-Host "  +$line+" -ForegroundColor $color
    Write-Host "  |  $($title.PadRight(52))  |" -ForegroundColor $color
    Write-Host "  +$line+" -ForegroundColor $color
    Write-Host ""
}

function Write-Header($text) {
    Write-Host ""
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "  $("-" * $text.Length)" -ForegroundColor DarkCyan
}

function Write-OK($text)   { Write-Host "  [OK] $text" -ForegroundColor Green  }
function Write-Warn($text) { Write-Host "  [!!] $text" -ForegroundColor Yellow }
function Write-Err($text)  { Write-Host "  [XX] $text" -ForegroundColor Red    }
function Write-Info($text) { Write-Host "  [>>] $text" -ForegroundColor Gray   }

function Get-FileSize($path) {
    $size = (Get-Item $path).Length
    if ($size -gt 1MB) { return "{0:N1} MB" -f ($size / 1MB) }
    return "{0:N0} KB" -f ($size / 1KB)
}

# ------------------------------------------------------------------------------
# Step 0: Banner
# ------------------------------------------------------------------------------

Write-Banner "Menyoo SP Installer for GTA 5 Enhanced" "Magenta"
Write-Host "  Mod:     Menyoo SP (github.com/MAFINS/MenyooSP)" -ForegroundColor Gray
Write-Host "  Requires: Script Hook V + GTA 5 Enhanced (Story Mode only)" -ForegroundColor Gray
Write-Host "  WARNING: DO NOT use mods in GTA Online -- ban risk!" -ForegroundColor Red
Write-Host ""

# ------------------------------------------------------------------------------
# Step 1: Locate GTA 5 Enhanced
# ------------------------------------------------------------------------------

Write-Header "Step 1 -- Locating GTA 5 Enhanced"

$candidatePaths = @(
    # Rockstar Games Launcher
    "C:\Program Files\Rockstar Games\Grand Theft Auto V Enhanced",
    "C:\Program Files (x86)\Rockstar Games\Grand Theft Auto V Enhanced",
    "D:\Rockstar Games\Grand Theft Auto V Enhanced",
    "E:\Rockstar Games\Grand Theft Auto V Enhanced",
    # Steam
    "C:\Program Files (x86)\Steam\steamapps\common\Grand Theft Auto V Enhanced",
    "D:\Steam\steamapps\common\Grand Theft Auto V Enhanced",
    "E:\Steam\steamapps\common\Grand Theft Auto V Enhanced",
    # Epic Games
    "C:\Program Files\Epic Games\GTAV",
    "D:\Epic Games\GTAV",
    # Legacy GTA V fallback
    "C:\Program Files\Rockstar Games\Grand Theft Auto V",
    "C:\Program Files (x86)\Steam\steamapps\common\Grand Theft Auto V"
)

$gtaDir = $null

if ($GTAPath -ne "") {
    if (Test-Path (Join-Path $GTAPath "GTA5.exe")) {
        $gtaDir = $GTAPath
        Write-OK "Using user-specified path: $gtaDir"
    } else {
        Write-Err "GTA5.exe not found at: $GTAPath"
        Write-Warn 'Retry with: -GTAPath "C:\Your\GTA5\Path"'
        exit 1
    }
} else {
    foreach ($path in $candidatePaths) {
        try {
            if (Test-Path (Join-Path $path "GTA5.exe") -ErrorAction SilentlyContinue) {
                $gtaDir = $path
                Write-OK "Auto-detected: $gtaDir"
                break
            }
        } catch { <# Drive doesn't exist -- skip silently #> }
    }

    # Registry fallback (Steam)
    if (-not $gtaDir) {
        try {
            $steamPath = (Get-ItemProperty "HKLM:\SOFTWARE\WOW6432Node\Valve\Steam" -ErrorAction SilentlyContinue).InstallPath
            if ($steamPath) {
                $steamGTA = Join-Path $steamPath "steamapps\common\Grand Theft Auto V Enhanced"
                if (Test-Path (Join-Path $steamGTA "GTA5.exe")) {
                    $gtaDir = $steamGTA
                    Write-OK "Found via Steam registry: $gtaDir"
                }
            }
        } catch {}
    }

    if (-not $gtaDir) {
        Write-Err "Could not auto-detect GTA 5 installation."
        Write-Host ""
        Write-Host "  Re-run with your GTA 5 path:" -ForegroundColor Yellow
        Write-Host '  powershell -ExecutionPolicy Bypass -File install_menyoo.ps1 -GTAPath "D:\YourPath"' -ForegroundColor Yellow
        exit 1
    }
}

$gtaExeVersion = (Get-Item (Join-Path $gtaDir "GTA5.exe")).VersionInfo.FileVersion
Write-Info "GTA5.exe version: $gtaExeVersion"

# ------------------------------------------------------------------------------
# Uninstall mode
# ------------------------------------------------------------------------------

if ($Uninstall) {
    Write-Header "Uninstalling Menyoo"
    $removed = 0
    $files = @($MENYOO_ASI, $MENYOO_STUFF, $SHV_DLL, $SHV_ASI_LOADER)
    foreach ($f in $files) {
        $target = Join-Path $gtaDir $f
        if (Test-Path $target) {
            Remove-Item $target -Recurse -Force
            Write-OK "Removed: $f"
            $removed++
        } else {
            Write-Warn "Not found (skipped): $f"
        }
    }
    Write-Host ""
    if ($removed -gt 0) { Write-OK "Uninstall complete. $removed item(s) removed." }
    else                { Write-Warn "Nothing to uninstall -- files were not found." }
    exit 0
}

# ------------------------------------------------------------------------------
# Verify-only mode
# ------------------------------------------------------------------------------

if ($Verify) {
    Write-Header "Verifying Installation"
    $allGood = $true
    $checkFiles = @{
        $SHV_DLL        = "Script Hook V"
        $SHV_ASI_LOADER = "ASI Loader (dinput8.dll)"
        $MENYOO_ASI     = "Menyoo.asi"
    }
    foreach ($file in $checkFiles.Keys) {
        $path = Join-Path $gtaDir $file
        if (Test-Path $path) { Write-OK "$($checkFiles[$file]) -- $(Get-FileSize $path)" }
        else                 { Write-Err "$($checkFiles[$file]) -- MISSING"; $allGood = $false }
    }
    $menyooDir = Join-Path $gtaDir $MENYOO_STUFF
    if (Test-Path $menyooDir) { Write-OK "menyooStuff/ folder present" }
    else                      { Write-Warn "menyooStuff/ folder missing (created on first run)" }
    Write-Host ""
    if ($allGood) { Write-OK "All required files present. Installation looks good!" }
    else          { Write-Err "Some files are missing. Re-run without -Verify to install." }
    exit 0
}

# ------------------------------------------------------------------------------
# Step 2: Create temp directory
# ------------------------------------------------------------------------------

Write-Header "Step 2 -- Preparing temp directory"

if (Test-Path $TMP_DIR) { Remove-Item $TMP_DIR -Recurse -Force }
New-Item -ItemType Directory -Path $TMP_DIR | Out-Null
Write-OK "Temp dir: $TMP_DIR"

# ------------------------------------------------------------------------------
# Step 3: Download Script Hook V
# ------------------------------------------------------------------------------

Write-Header "Step 3 -- Script Hook V"

if ($SkipSHV) {
    Write-Warn "Skipped (-SkipSHV flag set)"
} else {
    if (Test-Path (Join-Path $gtaDir $SHV_DLL)) {
        Write-Warn "ScriptHookV.dll already present -- skipping download"
        Write-Info "Delete it manually first to force re-download"
    } else {
        Write-Info "Downloading Script Hook V from dev-c.com ..."
        $shvZip = Join-Path $TMP_DIR "ScriptHookV.zip"
        try {
            Invoke-WebRequest -Uri $SHV_URL -OutFile $shvZip -UseBasicParsing
            Write-OK "Downloaded: $(Get-FileSize $shvZip)"

            $shvExtract = Join-Path $TMP_DIR "SHV"
            Expand-Archive -Path $shvZip -DestinationPath $shvExtract -Force

            $shvDllSrc    = Get-ChildItem -Path $shvExtract -Filter "ScriptHookV.dll" -Recurse | Select-Object -First 1
            $asiLoaderSrc = Get-ChildItem -Path $shvExtract -Filter "dinput8.dll"    -Recurse | Select-Object -First 1

            if ($shvDllSrc) {
                Copy-Item $shvDllSrc.FullName (Join-Path $gtaDir $SHV_DLL) -Force
                Write-OK "Installed: ScriptHookV.dll"
            } else {
                Write-Warn "ScriptHookV.dll not found in archive -- check for updated URL"
            }

            if ($asiLoaderSrc) {
                Copy-Item $asiLoaderSrc.FullName (Join-Path $gtaDir $SHV_ASI_LOADER) -Force
                Write-OK "Installed: dinput8.dll (ASI Loader)"
            } else {
                Write-Warn "dinput8.dll not found in archive"
            }

        } catch {
            Write-Warn "Auto-download failed: $_"
            Write-Host ""
            Write-Host "  Manual download: http://www.dev-c.com/gtav/scripthookv/" -ForegroundColor Yellow
            Write-Host "  Copy ScriptHookV.dll + dinput8.dll to:" -ForegroundColor Yellow
            Write-Host "  $gtaDir" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  Press ENTER when done (Ctrl+C to cancel)..." -ForegroundColor Yellow -NoNewline
            Read-Host
        }
    }
}

# ------------------------------------------------------------------------------
# Step 4: Download Menyoo
# ------------------------------------------------------------------------------

Write-Header "Step 4 -- Menyoo SP"

if ($SkipMenyoo) {
    Write-Warn "Skipped (-SkipMenyoo flag set)"
} else {
    Write-Info "Fetching latest Menyoo release from GitHub..."

    $menyooZip = Join-Path $TMP_DIR "Menyoo.zip"

    try {
        $headers = @{ "User-Agent" = "MenyooInstaller/1.0" }
        $release = Invoke-RestMethod -Uri $MENYOO_API_URL -Headers $headers -UseBasicParsing
        Write-Info "Latest version: $($release.tag_name)"

        $asset = $release.assets | Where-Object { $_.name -match "\.zip$" } | Select-Object -First 1
        if (-not $asset) {
            $asset = $release.assets | Where-Object { $_.name -match "Menyoo.*\.asi$" } | Select-Object -First 1
        }

        if ($asset) {
            Write-Info "Downloading: $($asset.name)  ($([math]::Round($asset.size/1KB)) KB)"
            Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $menyooZip -UseBasicParsing -Headers $headers
            Write-OK "Downloaded: $(Get-FileSize $menyooZip)"
        } else {
            throw "No release asset found on GitHub"
        }

    } catch {
        Write-Warn "Auto-download failed: $_"
        Write-Host ""
        Write-Host "  Manual download: https://github.com/MAFINS/MenyooSP/releases/latest" -ForegroundColor Cyan
        Write-Host "  Save the .zip to: $menyooZip" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Press ENTER when done (Ctrl+C to cancel)..." -ForegroundColor Yellow -NoNewline
        Read-Host
    }

    # Extract & install
    if (Test-Path $menyooZip) {
        Write-Info "Extracting Menyoo..."
        $menyooExtract = Join-Path $TMP_DIR "Menyoo"
        Expand-Archive -Path $menyooZip -DestinationPath $menyooExtract -Force

        $asiFile = Get-ChildItem -Path $menyooExtract -Filter "Menyoo.asi" -Recurse | Select-Object -First 1
        if ($asiFile) {
            Copy-Item $asiFile.FullName (Join-Path $gtaDir $MENYOO_ASI) -Force
            Write-OK "Installed: Menyoo.asi"
        } else {
            Write-Warn "Menyoo.asi not found in archive"
        }

        $stuffDir = Get-ChildItem -Path $menyooExtract -Filter "menyooStuff" -Directory -Recurse | Select-Object -First 1
        if ($stuffDir) {
            $destStuff = Join-Path $gtaDir $MENYOO_STUFF
            if (Test-Path $destStuff) { Remove-Item $destStuff -Recurse -Force }
            Copy-Item $stuffDir.FullName $destStuff -Recurse -Force
            Write-OK "Installed: menyooStuff/ folder"
        } else {
            Write-Info "menyooStuff/ not in archive -- will be created on first launch"
        }
    }
}

# ------------------------------------------------------------------------------
# Step 5: Final verification
# ------------------------------------------------------------------------------

Write-Header "Step 5 -- Verification"

$installOK = $true
$checks = @{
    (Join-Path $gtaDir $SHV_DLL)        = "ScriptHookV.dll"
    (Join-Path $gtaDir $SHV_ASI_LOADER) = "dinput8.dll (ASI Loader)"
    (Join-Path $gtaDir $MENYOO_ASI)     = "Menyoo.asi"
}

foreach ($path in $checks.Keys) {
    if (Test-Path $path) { Write-OK "$($checks[$path])  ($(Get-FileSize $path))" }
    else                 { Write-Err "$($checks[$path])  -- MISSING"; $installOK = $false }
}

# ------------------------------------------------------------------------------
# Done
# ------------------------------------------------------------------------------

Write-Host ""
if ($installOK) {
    Write-Banner "Installation Complete!" "Green"
    Write-Host "  GTA Dir  : $gtaDir" -ForegroundColor Gray
    Write-Host "  Open menu: Press F8 in Story Mode" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  TIPS:" -ForegroundColor Yellow
    Write-Host "   - NEVER use mods in GTA Online (ban risk)" -ForegroundColor Red
    Write-Host "   - If game crashes: check Script Hook V is updated" -ForegroundColor Yellow
    Write-Host "   - Verify:   .\install_menyoo.ps1 -Verify" -ForegroundColor Gray
    Write-Host "   - Uninstall: .\install_menyoo.ps1 -Uninstall" -ForegroundColor Gray
} else {
    Write-Banner "Installation Incomplete" "Red"
    Write-Host "  Some files are missing. See warnings above." -ForegroundColor Yellow
    Write-Host "  GTA Dir: $gtaDir" -ForegroundColor Gray
}

Write-Host ""

# Cleanup
try { Remove-Item $TMP_DIR -Recurse -Force -ErrorAction SilentlyContinue } catch {}
