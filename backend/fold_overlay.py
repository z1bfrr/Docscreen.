"""
fold_overlay.py -- iPhone Duo Fold Overlay (Option A)
=====================================================
PRIMARY (all laptops):
  Listens for the Windows lid-switch power event via
  RegisterPowerSettingNotification (GUID_LIDSWITCH_STATE_CHANGE).
  Lid close -> animates fold effect in over ~1.5 s before screen blanks.
  Lid open  -> fades effect out over ~1 s.

SECONDARY (hinge-sensor laptops):
  If MSHingeAngle WMI class is present, uses the real angle for a
  progressive 160-deg -> 20-deg effect instead.

Dependencies:
    pip install pillow pywin32 pystray wmi

Build to .exe:
    pyinstaller --noconsole --onefile fold_overlay.py
"""

# -- stdlib -------------------------------------------------------------------
import ctypes
import ctypes.wintypes
import math
import struct
import sys
import threading
import time
import tkinter as tk

# -- third-party (graceful missing) -------------------------------------------
try:
    from PIL import Image, ImageDraw, ImageFilter, ImageTk
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    import win32api
    import win32con
    import win32gui
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False

try:
    import wmi
    HAS_WMI = True
except ImportError:
    HAS_WMI = False

try:
    import pystray
    from PIL import Image as PILImage
    HAS_TRAY = HAS_PIL
except ImportError:
    HAS_TRAY = False

# =============================================================================
# Config -- edit freely
# =============================================================================
CFG = {
    # Dimming layer
    "max_dim_alpha":     210,   # 0-255; darkness at full fold

    # Frost / blur layer
    "max_frost_alpha":   140,   # 0-255
    "max_frost_radius":   18,   # Gaussian blur radius (px)
    "frost_color":       (220, 235, 255),  # Cool ice-blue tint

    # Bend crease
    "crease_color":      (180, 210, 255, 200),  # RGBA
    "crease_width":        6,   # px
    "max_bend_height":   0.35,  # 0=bottom, 1=top

    # Animation timing (seconds)
    "close_anim_sec":    1.5,   # how long the closing animation runs
    "open_anim_sec":     0.8,   # how long the opening fade-out runs

    # Hinge-sensor mode (if sensor present)
    "angle_open":        160,
    "angle_fold_start":   90,
    "angle_fold_end":     20,
    "poll_ms":           150,

    # Simulation fallback
    "sim_period":         12,   # seconds per open->close->open cycle
    "render_ms":          30,   # ~33 fps
}

# =============================================================================
# Windows power-notification constants
# =============================================================================
GUID_LIDSWITCH_STATE_CHANGE = "{BA3E0F4D-B817-4094-A2D1-D56379E6A0F3}"

WM_POWERBROADCAST     = 0x0218
PBT_POWERSETTINGCHANGE = 0x8013
DEVICE_NOTIFY_WINDOW_HANDLE = 0x00000000

# POWERBROADCAST_SETTING struct: GUID (16 bytes) + DataLength (4) + Data (DataLength)
class GUID(ctypes.Structure):
    _fields_ = [
        ("Data1", ctypes.c_ulong),
        ("Data2", ctypes.c_ushort),
        ("Data3", ctypes.c_ushort),
        ("Data4", ctypes.c_ubyte * 8),
    ]

class POWERBROADCAST_SETTING(ctypes.Structure):
    _fields_ = [
        ("PowerSetting", GUID),
        ("DataLength",   ctypes.c_ulong),
        ("Data",         ctypes.c_ulong),  # DWORD: 0=lid closed, 1=lid open
    ]

def _parse_guid(guid_str):
    """Convert '{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}' to GUID struct."""
    s = guid_str.strip("{}")
    parts = s.split("-")
    d1 = int(parts[0], 16)
    d2 = int(parts[1], 16)
    d3 = int(parts[2], 16)
    d4_bytes = bytes.fromhex(parts[3] + parts[4])
    g = GUID()
    g.Data1 = d1
    g.Data2 = d2
    g.Data3 = d3
    for i, b in enumerate(d4_bytes):
        g.Data4[i] = b
    return g

# =============================================================================
# Lid state machine
# =============================================================================

class LidStateMachine:
    """
    Tracks whether the lid is open or closed and exposes a smooth
    effect_factor in [0.0, 1.0].

    Mode A (lid event): on close event, ramps factor 0->1 over close_anim_sec.
                        on open event, ramps factor 1->0 over open_anim_sec.
    Mode B (hinge WMI): reads real angle and maps to factor continuously.
    Mode C (sim):       cosine oscillation as a live demo.
    """

    MODE_LID    = "lid"
    MODE_HINGE  = "hinge"
    MODE_SIM    = "sim"

    def __init__(self):
        self._mode        = self.MODE_SIM
        self._factor      = 0.0          # current rendered factor
        self._target      = 0.0          # target factor
        self._anim_start  = None         # wall time when animation began
        self._anim_from   = 0.0
        self._anim_to     = 0.0
        self._anim_dur    = 0.0
        self._lid_closed  = False
        self._wmi_c       = None
        self._sim_start   = time.time()
        self._lock        = threading.Lock()

        self._init_mode()

    # -- init -----------------------------------------------------------------

    def _init_mode(self):
        # Try WMI hinge sensor first
        if HAS_WMI:
            try:
                c = wmi.WMI(namespace="root\\WMI")
                _ = c.MSHingeAngle()
                self._wmi_c = c
                self._mode  = self.MODE_HINGE
                print("[Sensor] Hinge sensor found -- using real angle data")
                return
            except Exception:
                pass

        # Try registering lid-switch notification
        if HAS_WIN32:
            # Notification registration happens in LidEventListener thread
            self._mode = self.MODE_LID
            print("[Sensor] No hinge sensor -- using lid-switch power events")
            return

        # Pure simulation
        self._mode = self.MODE_SIM
        print("[Sensor] No Win32 -- running simulation mode")

    @property
    def mode(self):
        return self._mode

    # -- lid event (called from power notification thread) --------------------

    def on_lid_closed(self):
        with self._lock:
            if self._lid_closed:
                return
            self._lid_closed = True
            print("[Lid] Lid CLOSED -- starting fold animation")
            self._start_anim(to=1.0, dur=CFG["close_anim_sec"])

    def on_lid_opened(self):
        with self._lock:
            if not self._lid_closed:
                return
            self._lid_closed = False
            print("[Lid] Lid OPENED -- fading out")
            self._start_anim(to=0.0, dur=CFG["open_anim_sec"])

    def _start_anim(self, to, dur):
        self._anim_from  = self._factor
        self._anim_to    = to
        self._anim_dur   = dur
        self._anim_start = time.time()

    # -- per-frame update (called from render loop) ---------------------------

    def tick(self) -> float:
        """Return current effect factor [0.0, 1.0]."""
        with self._lock:
            if self._mode == self.MODE_HINGE:
                self._factor = self._hinge_factor()

            elif self._mode == self.MODE_LID:
                if self._anim_start is not None:
                    elapsed = time.time() - self._anim_start
                    t = min(1.0, elapsed / max(self._anim_dur, 0.001))
                    # Ease-in-out cubic
                    t = t * t * (3 - 2 * t)
                    self._factor = self._anim_from + (self._anim_to - self._anim_from) * t
                    if elapsed >= self._anim_dur:
                        self._factor     = self._anim_to
                        self._anim_start = None

            else:  # simulation
                self._factor = self._simulate()

            return self._factor

    # -- helpers --------------------------------------------------------------

    def _hinge_factor(self) -> float:
        try:
            rows = self._wmi_c.MSHingeAngle()
            if rows:
                angle = float(rows[0].CurrentAngle)
                return _angle_to_factor(angle)
        except Exception:
            pass
        return 0.0

    def _simulate(self) -> float:
        period = CFG["sim_period"]
        t      = (time.time() - self._sim_start) % period
        angle  = 90 + 90 * math.cos(2 * math.pi * t / period)
        return _angle_to_factor(angle)


def _angle_to_factor(angle: float) -> float:
    a_open  = CFG["angle_open"]
    a_start = CFG["angle_fold_start"]
    a_end   = CFG["angle_fold_end"]
    if angle >= a_open:  return 0.0
    if angle <= a_end:   return 1.0
    if angle > a_start:
        t = (a_open - angle) / (a_open - a_start)
        return t * 0.2
    t = (a_start - angle) / (a_start - a_end)
    return 0.2 + t * 0.8

# =============================================================================
# Lid power notification listener (runs in its own thread, message-only HWND)
# =============================================================================

class LidEventListener(threading.Thread):
    """
    Creates a hidden message-only window, registers for
    GUID_LIDSWITCH_STATE_CHANGE, and pumps WM_POWERBROADCAST messages.
    Calls state_machine.on_lid_closed / on_lid_opened on events.
    """

    def __init__(self, state_machine: LidStateMachine):
        super().__init__(daemon=True, name="LidEventListener")
        self._sm  = state_machine
        self._lid_guid = _parse_guid(GUID_LIDSWITCH_STATE_CHANGE)

    def run(self):
        user32   = ctypes.windll.user32
        kernel32 = ctypes.windll.kernel32

        # Register window class
        wc = ctypes.wintypes.WNDCLASS()
        wc.lpfnWndProc   = ctypes.WINFUNCTYPE(
            ctypes.c_long, ctypes.c_int, ctypes.c_uint,
            ctypes.c_int, ctypes.c_int)(self._wnd_proc)
        wc.hInstance     = kernel32.GetModuleHandleW(None)
        wc.lpszClassName = "FoldOverlayLidWatcher"
        user32.RegisterClassW(ctypes.byref(wc))

        # Create message-only window (HWND_MESSAGE parent)
        hwnd = user32.CreateWindowExW(
            0, "FoldOverlayLidWatcher", "FoldOverlay Lid Watcher",
            0, 0, 0, 0, 0,
            -3,   # HWND_MESSAGE
            None, wc.hInstance, None)

        if not hwnd:
            print("[LidListener] Could not create message window")
            return

        # Register for lid-switch notifications
        guid_ptr = ctypes.byref(self._lid_guid)
        hnotify  = ctypes.windll.user32.RegisterPowerSettingNotification(
            hwnd, guid_ptr, DEVICE_NOTIFY_WINDOW_HANDLE)

        if not hnotify:
            print("[LidListener] RegisterPowerSettingNotification failed "
                  f"(error {ctypes.GetLastError()})")
        else:
            print("[LidListener] Registered for lid-switch events OK")

        # Message pump
        msg = ctypes.wintypes.MSG()
        while user32.GetMessageW(ctypes.byref(msg), None, 0, 0) != 0:
            user32.TranslateMessage(ctypes.byref(msg))
            user32.DispatchMessageW(ctypes.byref(msg))

    def _wnd_proc(self, hwnd, msg, wparam, lparam):
        if msg == WM_POWERBROADCAST and wparam == PBT_POWERSETTINGCHANGE:
            try:
                pbs = ctypes.cast(
                    lparam, ctypes.POINTER(POWERBROADCAST_SETTING)).contents
                # DataLength==4 means a DWORD state value
                if pbs.DataLength == 4:
                    state = pbs.Data   # 0 = closed, 1 = open
                    if state == 0:
                        self._sm.on_lid_closed()
                    else:
                        self._sm.on_lid_opened()
            except Exception as e:
                print(f"[LidListener] Parse error: {e}")
        return ctypes.windll.user32.DefWindowProcW(hwnd, msg, wparam, lparam)

# =============================================================================
# Overlay window
# =============================================================================

class FoldOverlay:
    def __init__(self, root: tk.Tk, sm: LidStateMachine):
        self.root   = root
        self.sm     = sm
        self._factor = 0.0
        self._photo  = None

        self.sw = root.winfo_screenwidth()
        self.sh = root.winfo_screenheight()

        root.title("FoldOverlay")
        root.geometry(f"{self.sw}x{self.sh}+0+0")
        root.overrideredirect(True)
        root.attributes("-topmost", True)
        root.attributes("-transparentcolor", "#010101")
        root.configure(bg="#010101")

        # Click-through via Win32 extended style
        if HAS_WIN32:
            hwnd  = root.winfo_id()
            style = win32gui.GetWindowLong(hwnd, win32con.GWL_EXSTYLE)
            style |= win32con.WS_EX_LAYERED | win32con.WS_EX_TRANSPARENT
            win32gui.SetWindowLong(hwnd, win32con.GWL_EXSTYLE, style)

        self.canvas = tk.Canvas(
            root, width=self.sw, height=self.sh,
            highlightthickness=0, bg="#010101")
        self.canvas.pack()

        # Status badge
        mode_labels = {
            LidStateMachine.MODE_LID:   "Lid-switch mode  --  close your lid to see the effect",
            LidStateMachine.MODE_HINGE: "Hinge-sensor mode  --  tilt screen to see effect",
            LidStateMachine.MODE_SIM:   "Simulation mode  --  no sensor / no Win32 detected",
        }
        tk.Label(
            root,
            text=mode_labels.get(sm.mode, ""),
            bg="#1a1a2e", fg="#7ecfff",
            font=("Segoe UI", 10),
            padx=10, pady=4,
        ).place(x=10, y=10)

        self._render()

    def _render(self):
        self._factor = self.sm.tick()

        if HAS_PIL:
            self._render_pil()
        else:
            self._render_fallback()

        self.root.after(CFG["render_ms"], self._render)

    def _render_pil(self):
        f = self._factor
        if f < 0.005:
            self.canvas.delete("all")
            self._photo = None
            return

        w, h = self.sw, self.sh

        # 1. Frosted-glass layer
        r, g, b = CFG["frost_color"]
        frost = Image.new("RGBA", (w, h), (r, g, b, int(f * CFG["max_frost_alpha"])))
        blur_r = max(1, int(f * CFG["max_frost_radius"]))
        frost  = frost.filter(ImageFilter.GaussianBlur(radius=blur_r))

        # 2. Dim layer
        dim = Image.new("RGBA", (w, h), (10, 12, 30, int(f * CFG["max_dim_alpha"])))

        # 3. Crease
        crease_y = int(h * (1.0 - CFG["max_bend_height"]))
        cr, cg, cb, ca_max = CFG["crease_color"]
        crease_alpha = int(f * ca_max)
        band = CFG["crease_width"]

        crease = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw   = ImageDraw.Draw(crease)
        for i in range(-band * 2, band * 2 + 1):
            y = crease_y + i
            if 0 <= y < h:
                falloff = max(0.0, 1.0 - abs(i) / (band * 2))
                draw.line([(0, y), (w, y)],
                          fill=(cr, cg, cb, int(crease_alpha * falloff)))

        # 4. Composite
        comp = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        comp = Image.alpha_composite(comp, frost)
        comp = Image.alpha_composite(comp, dim)
        comp = Image.alpha_composite(comp, crease)

        self._photo = ImageTk.PhotoImage(comp)
        self.canvas.delete("all")
        self.canvas.create_image(0, 0, anchor="nw", image=self._photo)

    def _render_fallback(self):
        f = self._factor
        self.canvas.delete("all")
        if f < 0.005:
            return
        self.canvas.create_rectangle(
            0, 0, self.sw, self.sh,
            fill="#0a0c1e", stipple="gray50")

# =============================================================================
# System tray
# =============================================================================

def _make_tray_icon(root: tk.Tk):
    if not HAS_TRAY:
        return

    def on_quit(icon, _item):
        icon.stop()
        root.after(0, root.destroy)

    img  = PILImage.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([4, 4, 60, 60], fill=(30, 100, 220))
    draw.line([(32, 12), (32, 52)], fill=(200, 230, 255), width=3)

    menu = pystray.Menu(pystray.MenuItem("Quit FoldOverlay", on_quit))
    icon = pystray.Icon("FoldOverlay", img, "FoldOverlay", menu)
    threading.Thread(target=icon.run, daemon=True).start()

# =============================================================================
# Entry point
# =============================================================================

def main():
    print("=" * 60)
    print("  iPhone Duo Fold Overlay  --  Option A (Python)")
    print("=" * 60)

    for pkg, flag in [("pillow", HAS_PIL), ("pywin32", HAS_WIN32), ("wmi", HAS_WMI)]:
        if not flag:
            print(f"[Warn] '{pkg}' not installed  ->  pip install {pkg}")

    sm = LidStateMachine()

    # Start lid event listener thread (only useful in lid mode, harmless otherwise)
    if sm.mode == LidStateMachine.MODE_LID:
        LidEventListener(sm).start()

    root = tk.Tk()
    root.withdraw()
    root.update()
    root.deiconify()

    _overlay = FoldOverlay(root, sm)
    _make_tray_icon(root)

    print("[OK] Overlay running -- tray icon -> Quit to stop")
    root.mainloop()


if __name__ == "__main__":
    main()
