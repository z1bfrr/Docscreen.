; ══════════════════════════════════════════════════════════════════════════════
; FoldOverlay.ahk — iPhone Duo Fold Overlay (Option B)
; AutoHotkey v2  |  Zero Python dependency
; ══════════════════════════════════════════════════════════════════════════════
;
; WHAT IT DOES
;   Reads MSHingeAngle from root\WMI and renders a colour-keyed layered window
;   that dims + tints the screen as you close your laptop lid, mimicking the
;   iPhone Duo folding UX.  Falls back to simulation when no sensor is found.
;
; INSTALL
;   1. Install AutoHotkey v2  →  https://www.autohotkey.com/
;   2. Double-click FoldOverlay.ahk
;
; QUIT
;   Ctrl+Shift+F12  OR  right-click tray icon → Exit
;
; CONFIG
;   Edit the Config section below.
; ══════════════════════════════════════════════════════════════════════════════

#Requires AutoHotkey v2.0
#SingleInstance Force
Persistent

; ── Config ───────────────────────────────────────────────────────────────────
global ANGLE_OPEN        := 160   ; no effect above this
global ANGLE_FOLD_START  :=  90   ; effects begin here
global ANGLE_FOLD_END    :=  20   ; max effect below this
global MAX_DIM_ALPHA     := 210   ; 0-255 overlay opacity at full fold
global FROST_R           := 180   ; frost tint red
global FROST_G           := 210   ; frost tint green
global FROST_B           := 255   ; frost tint blue
global POLL_MS           := 200   ; sensor poll interval (ms)
global SIM_PERIOD_SEC    :=  12   ; simulation cycle in seconds
global CREASE_Y_FRAC     := 0.65  ; crease Y (fraction of screen height)
global CREASE_ALPHA      := 180   ; 0-255 crease brightness at full fold

; ── Globals ───────────────────────────────────────────────────────────────────
global gHwnd         := 0
global gFactor       := 0.0
global gTargetFactor := 0.0
global gSimStart     := A_TickCount / 1000
global gHasWMI       := false
global gWMI          := ""
global gSimMode      := false

; ── WMI constants ─────────────────────────────────────────────────────────────
WMI_CONNECT_NAMESPACE := "root\WMI"
WMI_CLASS             := "MSHingeAngle"

; ══════════════════════════════════════════════════════════════════════════════
; Startup
; ══════════════════════════════════════════════════════════════════════════════

InitSensor()
CreateOverlay()
TraySetup()

SetTimer(PollSensor, POLL_MS)
SetTimer(RenderFrame, 30)   ; ~33 fps

return

; ══════════════════════════════════════════════════════════════════════════════
; Sensor
; ══════════════════════════════════════════════════════════════════════════════

InitSensor() {
    global gHasWMI, gWMI, gSimMode
    try {
        gWMI    := ComObject("WbemScripting.SWbemLocator")
                     .ConnectServer(".", "root\WMI")
        ; Quick probe — throws if class missing
        probe := gWMI.ExecQuery("SELECT * FROM MSHingeAngle")
        gHasWMI  := true
        gSimMode := false
        TrayTip("FoldOverlay", "Hinge sensor found ✓", 2000, 1)
    } catch {
        gHasWMI  := false
        gSimMode := true
        TrayTip("FoldOverlay", "No sensor — simulation mode", 2000, 2)
    }
}

ReadHingeAngle() {
    global gHasWMI, gWMI, gSimMode, gSimStart, SIM_PERIOD_SEC
    if gSimMode {
        t     := (A_TickCount / 1000 - gSimStart)
        phase := Mod(t, SIM_PERIOD_SEC) / SIM_PERIOD_SEC
        return 90 + 90 * Cos(2 * 3.14159265 * phase)
    }
    try {
        rows := gWMI.ExecQuery("SELECT CurrentAngle FROM MSHingeAngle")
        for row in rows
            return row.CurrentAngle + 0
    } catch {}
    return 180
}

; ══════════════════════════════════════════════════════════════════════════════
; Effect math
; ══════════════════════════════════════════════════════════════════════════════

EffectFactor(angle) {
    global ANGLE_OPEN, ANGLE_FOLD_START, ANGLE_FOLD_END
    if (angle >= ANGLE_OPEN)       return 0.0
    if (angle <= ANGLE_FOLD_END)   return 1.0
    if (angle > ANGLE_FOLD_START) {
        t := (ANGLE_OPEN - angle) / (ANGLE_OPEN - ANGLE_FOLD_START)
        return t * 0.2
    }
    t := (ANGLE_FOLD_START - angle) / (ANGLE_FOLD_START - ANGLE_FOLD_END)
    return 0.2 + t * 0.8
}

; ══════════════════════════════════════════════════════════════════════════════
; Overlay window (layered, colour-keyed, click-through)
; ══════════════════════════════════════════════════════════════════════════════

CreateOverlay() {
    global gHwnd

    sw := SysGet(0)   ; SM_CXSCREEN
    sh := SysGet(1)   ; SM_CYSCREEN

    ; WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST | WS_EX_TOOLWINDOW
    exStyle := 0x80000 | 0x20 | 0x8 | 0x80

    gHwnd := DllCall("CreateWindowEx",
        "UInt",   exStyle,
        "Str",    "Static",
        "Str",    "FoldOverlay",
        "UInt",   0x90000000,   ; WS_VISIBLE | WS_POPUP
        "Int",    0,
        "Int",    0,
        "Int",    sw,
        "Int",    sh,
        "Ptr",    0,
        "Ptr",    0,
        "Ptr",    0,
        "Ptr",    0,
        "Ptr")

    ; Make the window transparent (alpha channel driven by SetLayeredWindowAttributes)
    DllCall("SetWindowPos", "Ptr", gHwnd, "Ptr", -1,   ; HWND_TOPMOST
        "Int", 0, "Int", 0, "Int", sw, "Int", sh, "UInt", 0x40)

    ; Initial alpha 0
    DllCall("SetLayeredWindowAttributes",
        "Ptr",  gHwnd,
        "UInt", 0x00000000,   ; crKey (unused)
        "UChar", 0,           ; bAlpha
        "UInt", 2)            ; LWA_ALPHA
}

; ══════════════════════════════════════════════════════════════════════════════
; Timed callbacks
; ══════════════════════════════════════════════════════════════════════════════

PollSensor() {
    global gTargetFactor
    angle          := ReadHingeAngle()
    gTargetFactor  := EffectFactor(angle)
}

RenderFrame() {
    global gFactor, gTargetFactor, gHwnd
    global MAX_DIM_ALPHA, FROST_R, FROST_G, FROST_B
    global CREASE_Y_FRAC, CREASE_ALPHA

    ; Smooth ease
    gFactor += (gTargetFactor - gFactor) * 0.18

    f := gFactor
    if (f < 0.004) {
        DllCall("SetLayeredWindowAttributes",
            "Ptr",  gHwnd, "UInt", 0, "UChar", 0, "UInt", 2)
        return
    }

    ; ── Overall alpha (dim) ──────────────────────────────────────────────────
    alpha := Round(f * MAX_DIM_ALPHA)

    ; ── Tint colour blended toward frost RGB ─────────────────────────────────
    ; Background starts near pure black, blends toward frost tint
    r := Round(10 + f * (FROST_R - 10))
    g := Round(12 + f * (FROST_G - 12))
    b := Round(30 + f * (FROST_B - 30))

    ; Pack as COLORREF (BGR) for GDI
    bgColor := b << 16 | g << 8 | r

    ; ── Paint window background with GDI ─────────────────────────────────────
    hdc    := DllCall("GetDC", "Ptr", gHwnd, "Ptr")
    sw     := SysGet(0)
    sh     := SysGet(1)
    hBrush := DllCall("CreateSolidBrush", "UInt", bgColor, "Ptr")
    DllCall("SelectObject", "Ptr", hdc, "Ptr", hBrush)

    RECT := Buffer(16)
    NumPut("Int", 0,  RECT, 0)
    NumPut("Int", 0,  RECT, 4)
    NumPut("Int", sw, RECT, 8)
    NumPut("Int", sh, RECT, 12)
    DllCall("FillRect", "Ptr", hdc, "Ptr", RECT, "Ptr", hBrush)

    ; ── Crease line ──────────────────────────────────────────────────────────
    cy       := Round(sh * CREASE_Y_FRAC)
    lineAlph := Round(f * CREASE_ALPHA)
    lr := Round(180 * lineAlph / 255)
    lg := Round(210 * lineAlph / 255)
    lb := Round(255 * lineAlph / 255)
    lineBGR := lb << 16 | lg << 8 | lr

    hPen := DllCall("CreatePen", "Int", 0, "Int", 4, "UInt", lineBGR, "Ptr")
    DllCall("SelectObject", "Ptr", hdc, "Ptr", hPen)
    DllCall("MoveToEx", "Ptr", hdc, "Int", 0,  "Int", cy, "Ptr", 0)
    DllCall("LineTo",   "Ptr", hdc, "Int", sw, "Int", cy)

    DllCall("ReleaseDC", "Ptr", gHwnd, "Ptr", hdc)
    DllCall("DeleteObject", "Ptr", hBrush)
    DllCall("DeleteObject", "Ptr", hPen)

    ; ── Update layered window alpha ───────────────────────────────────────────
    DllCall("SetLayeredWindowAttributes",
        "Ptr",  gHwnd,
        "UInt", 0,
        "UChar", alpha,
        "UInt", 2)   ; LWA_ALPHA
}

; ══════════════════════════════════════════════════════════════════════════════
; Tray
; ══════════════════════════════════════════════════════════════════════════════

TraySetup() {
    A_TrayMenu.Delete()
    A_TrayMenu.Add("FoldOverlay", (*) => "")
    A_TrayMenu.Disable("FoldOverlay")
    A_TrayMenu.Add()
    A_TrayMenu.Add("Exit", TrayExit)
    TraySetIcon("shell32.dll", 174)
}

TrayExit(*) {
    ExitApp()
}

; ══════════════════════════════════════════════════════════════════════════════
; Hotkey: Ctrl+Shift+F12  →  quit
; ══════════════════════════════════════════════════════════════════════════════

^+F12:: ExitApp()
