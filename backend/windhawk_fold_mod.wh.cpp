// ════════════════════════════════════════════════════════════════════════════
// windhawk_fold_mod.wh.cpp — iPhone Duo Fold Overlay (Option C)
// Windhawk mod  |  Injects into explorer.exe  |  Persistent across reboots
// ════════════════════════════════════════════════════════════════════════════
//
// WHAT IT DOES
//   Hooks into explorer.exe and periodically reads MSHingeAngle from WMI.
//   Renders a full-screen dim + frost tint + GDI crease line as a layered
//   overlay window on top of the desktop.
//
// INSTALL
//   1. Install Windhawk  →  https://windhawk.net
//   2. Open Windhawk → click "New Mod"
//   3. Paste this entire file
//   4. Click Compile → Enable
//
// CONFIG
//   Edit the Config struct below, then recompile.
// ════════════════════════════════════════════════════════════════════════════

#include <windows.h>
#include <wbemidl.h>
#include <comdef.h>
#include <cmath>
#include <thread>
#include <atomic>
#include <mutex>

#pragma comment(lib, "wbemuuid.lib")
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "oleaut32.lib")

// ── Config ────────────────────────────────────────────────────────────────────

struct Config {
    // Angle thresholds (degrees)
    float angleOpen      = 160.0f;   // no effect above this
    float angleFoldStart =  90.0f;   // effects begin
    float angleFoldEnd   =  20.0f;   // max effect below this

    // Dim layer
    BYTE  maxDimAlpha    = 210;      // 0-255

    // Frost tint
    BYTE  maxFrostAlpha  = 140;      // 0-255
    BYTE  frostR = 220, frostG = 235, frostB = 255;

    // Crease
    BYTE  creaseAlpha    = 200;      // 0-255 at full fold
    int   creaseWidth    =   4;      // px
    float creaseYFrac    = 0.65f;    // fraction of screen height

    // Timing
    DWORD pollMs         = 200;      // sensor poll interval
    DWORD simPeriodMs    = 12000;    // simulation cycle
} CFG;

// ── Globals ───────────────────────────────────────────────────────────────────

static HWND  g_hwnd       = nullptr;
static std::atomic<float> g_factor { 0.0f };
static std::atomic<float> g_target { 0.0f };
static std::atomic<bool>  g_running { true };
static bool   g_simMode   = false;
static DWORD  g_simStart  = 0;

static IWbemServices*  g_pSvc  = nullptr;
static IWbemLocator*   g_pLoc  = nullptr;

// ── WMI helpers ───────────────────────────────────────────────────────────────

static bool WMI_Init() {
    HRESULT hr;
    hr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    if (FAILED(hr)) return false;

    hr = CoCreateInstance(CLSID_WbemLocator, nullptr,
                          CLSCTX_INPROC_SERVER, IID_IWbemLocator,
                          (void**)&g_pLoc);
    if (FAILED(hr)) { CoUninitialize(); return false; }

    hr = g_pLoc->ConnectServer(
        _bstr_t(L"ROOT\\WMI"), nullptr, nullptr, nullptr,
        0, nullptr, nullptr, &g_pSvc);
    if (FAILED(hr)) { g_pLoc->Release(); g_pLoc = nullptr;
                      CoUninitialize(); return false; }

    hr = CoSetProxyBlanket(g_pSvc, RPC_C_AUTHN_WINNT, RPC_C_AUTHZ_NONE,
                           nullptr, RPC_C_AUTHN_LEVEL_CALL,
                           RPC_C_IMP_LEVEL_IMPERSONATE, nullptr, EOAC_NONE);
    if (FAILED(hr)) { g_pSvc->Release(); g_pSvc = nullptr;
                      g_pLoc->Release(); g_pLoc = nullptr;
                      CoUninitialize(); return false; }

    // Probe for MSHingeAngle
    IEnumWbemClassObject* pEnum = nullptr;
    hr = g_pSvc->ExecQuery(
        _bstr_t(L"WQL"),
        _bstr_t(L"SELECT CurrentAngle FROM MSHingeAngle"),
        WBEM_FLAG_FORWARD_ONLY | WBEM_FLAG_RETURN_IMMEDIATELY,
        nullptr, &pEnum);
    if (FAILED(hr) || !pEnum) { return false; }
    pEnum->Release();
    return true;
}

static float WMI_ReadAngle() {
    if (!g_pSvc) return 180.0f;
    IEnumWbemClassObject* pEnum = nullptr;
    HRESULT hr = g_pSvc->ExecQuery(
        _bstr_t(L"WQL"),
        _bstr_t(L"SELECT CurrentAngle FROM MSHingeAngle"),
        WBEM_FLAG_FORWARD_ONLY | WBEM_FLAG_RETURN_IMMEDIATELY,
        nullptr, &pEnum);
    if (FAILED(hr) || !pEnum) return 180.0f;

    IWbemClassObject* pObj = nullptr;
    ULONG  ret  = 0;
    float  angle = 180.0f;
    if (pEnum->Next(WBEM_INFINITE, 1, &pObj, &ret) == S_OK && pObj) {
        VARIANT v; VariantInit(&v);
        if (SUCCEEDED(pObj->Get(L"CurrentAngle", 0, &v, nullptr, nullptr)))
            angle = (float)V_I4(&v);
        VariantClear(&v);
        pObj->Release();
    }
    pEnum->Release();
    return angle;
}

static float Simulate() {
    DWORD elapsed = GetTickCount() - g_simStart;
    double t = (double)(elapsed % CFG.simPeriodMs) / CFG.simPeriodMs;
    return (float)(90.0 + 90.0 * cos(2.0 * M_PI * t));
}

// ── Effect factor ─────────────────────────────────────────────────────────────

static float EffectFactor(float angle) {
    if (angle >= CFG.angleOpen)      return 0.0f;
    if (angle <= CFG.angleFoldEnd)   return 1.0f;
    if (angle > CFG.angleFoldStart) {
        float t = (CFG.angleOpen - angle) / (CFG.angleOpen - CFG.angleFoldStart);
        return t * 0.2f;
    }
    float t = (CFG.angleFoldStart - angle) / (CFG.angleFoldStart - CFG.angleFoldEnd);
    return 0.2f + t * 0.8f;
}

// ── Overlay window ────────────────────────────────────────────────────────────

static LRESULT CALLBACK OverlayWndProc(HWND hwnd, UINT msg,
                                        WPARAM wParam, LPARAM lParam) {
    if (msg == WM_PAINT) {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hwnd, &ps);

        float f  = g_factor.load();
        int   sw = GetSystemMetrics(SM_CXSCREEN);
        int   sh = GetSystemMetrics(SM_CYSCREEN);

        if (f > 0.004f) {
            // Tinted background
            int r = (int)(10  + f * (CFG.frostR - 10));
            int g = (int)(12  + f * (CFG.frostG - 12));
            int b = (int)(30  + f * (CFG.frostB - 30));
            COLORREF bgColor = RGB(r, g, b);
            HBRUSH hBrush = CreateSolidBrush(bgColor);
            RECT rc = { 0, 0, sw, sh };
            FillRect(hdc, &rc, hBrush);
            DeleteObject(hBrush);

            // Crease line
            int cy = (int)(sh * CFG.creaseYFrac);
            int ca = (int)(f * CFG.creaseAlpha);
            int lr = (int)(180 * ca / 255);
            int lg = (int)(210 * ca / 255);
            int lb = (int)(255 * ca / 255);
            HPEN hPen = CreatePen(PS_SOLID, CFG.creaseWidth, RGB(lr, lg, lb));
            HPEN hOld = (HPEN)SelectObject(hdc, hPen);

            // Soft crease band (3 lines: bright centre, dimmer edges)
            for (int i = -1; i <= 1; i++) {
                int factor = (i == 0) ? ca : ca / 3;
                int yr = (int)(180 * factor / 255);
                int yg = (int)(210 * factor / 255);
                int yb = (int)(255 * factor / 255);
                HPEN hP = CreatePen(PS_SOLID,
                    (i == 0) ? CFG.creaseWidth : CFG.creaseWidth / 2,
                    RGB(yr, yg, yb));
                SelectObject(hdc, hP);
                MoveToEx(hdc, 0,  cy + i * (CFG.creaseWidth), nullptr);
                LineTo(hdc,   sw, cy + i * (CFG.creaseWidth));
                DeleteObject(hP);
            }

            SelectObject(hdc, hOld);
            DeleteObject(hPen);
        }
        EndPaint(hwnd, &ps);
        return 0;
    }
    return DefWindowProc(hwnd, msg, wParam, lParam);
}

static void CreateOverlayWindow() {
    WNDCLASSEX wc = {};
    wc.cbSize        = sizeof(wc);
    wc.lpfnWndProc   = OverlayWndProc;
    wc.hInstance     = GetModuleHandle(nullptr);
    wc.lpszClassName = L"FoldOverlayWH";
    RegisterClassEx(&wc);

    DWORD exStyle = WS_EX_LAYERED | WS_EX_TRANSPARENT |
                    WS_EX_TOPMOST | WS_EX_TOOLWINDOW  | WS_EX_NOACTIVATE;
    int sw = GetSystemMetrics(SM_CXSCREEN);
    int sh = GetSystemMetrics(SM_CYSCREEN);

    g_hwnd = CreateWindowEx(
        exStyle, L"FoldOverlayWH", L"FoldOverlay",
        WS_POPUP | WS_VISIBLE,
        0, 0, sw, sh,
        nullptr, nullptr, GetModuleHandle(nullptr), nullptr);

    SetWindowPos(g_hwnd, HWND_TOPMOST, 0, 0, sw, sh, SWP_NOACTIVATE);
    SetLayeredWindowAttributes(g_hwnd, 0, 0, LWA_ALPHA);
    ShowWindow(g_hwnd, SW_SHOW);
}

// ── Background threads ────────────────────────────────────────────────────────

static void SensorThread() {
    while (g_running.load()) {
        float angle  = g_simMode ? Simulate() : WMI_ReadAngle();
        g_target.store(EffectFactor(angle));
        Sleep(CFG.pollMs);
    }
}

static void RenderThread() {
    while (g_running.load()) {
        float cur = g_factor.load();
        float tgt = g_target.load();
        float next = cur + (tgt - cur) * 0.18f;
        g_factor.store(next);

        if (g_hwnd) {
            BYTE alpha = (BYTE)(next * CFG.maxDimAlpha);
            SetLayeredWindowAttributes(g_hwnd, 0, alpha, LWA_ALPHA);
            InvalidateRect(g_hwnd, nullptr, TRUE);
        }
        Sleep(30);
    }
}

// ── Windhawk entry points ─────────────────────────────────────────────────────

BOOL Wh_ModInit() {
    g_simStart = GetTickCount();

    if (!WMI_Init()) {
        g_simMode = true;
        Wh_Log(L"[FoldOverlay] WMI unavailable — simulation mode");
    } else {
        g_simMode = false;
        Wh_Log(L"[FoldOverlay] MSHingeAngle found ✓");
    }

    // Create overlay window on UI thread via QueueUserAPC is not available here;
    // use a dedicated thread and pump a minimal message loop.
    std::thread([] {
        CreateOverlayWindow();
        MSG msg;
        while (g_running.load() && GetMessage(&msg, nullptr, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
    }).detach();

    std::thread(SensorThread).detach();
    std::thread(RenderThread).detach();

    return TRUE;
}

void Wh_ModUninit() {
    g_running.store(false);
    if (g_hwnd) {
        PostMessage(g_hwnd, WM_QUIT, 0, 0);
        DestroyWindow(g_hwnd);
        g_hwnd = nullptr;
    }
    if (g_pSvc) { g_pSvc->Release(); g_pSvc = nullptr; }
    if (g_pLoc) { g_pLoc->Release(); g_pLoc = nullptr; }
    CoUninitialize();
}

// ── Windhawk metadata block (parsed by Windhawk IDE) ─────────────────────────
// ==WindhawkMod==
// @id              fold-overlay
// @name            iPhone Duo Fold Overlay
// @description     Dims + frosts the screen based on laptop hinge angle,
//                  mimicking the iPhone Duo folding UX on Windows.
// @version         1.0.0
// @author          FoldOverlay Project
// @include         explorer.exe
// @compilerOptions -lole32 -loleaut32 -lwbemuuid
// ==/WindhawkMod==
