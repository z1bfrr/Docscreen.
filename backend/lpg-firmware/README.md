# Smart LPG Cylinder Monitor — ESP32 Firmware

## Hardware Requirements

| Component | Qty | Notes |
|---|---|---|
| ESP32 Dev Module | 1 | Any variant (ESP32-WROOM-32, NodeMCU-32S, etc.) |
| HX711 Load Cell Amplifier | 1 | Standard module |
| Load Cell (30 kg or 50 kg) | 1 | Must handle full cylinder weight (~30 kg) |
| Active Buzzer | 1 | 3.3V or 5V |
| RGB LED (common cathode) | 1 | Or 3 separate LEDs |
| 220Ω resistors | 3 | For each LED color |
| Jumper wires | — | |
| Breadboard or PCB | 1 | |

---

## Wiring Diagram

```
Load Cell → HX711 Board
  E+  ──→  E+
  E-  ──→  E-
  A+  ──→  A+
  A-  ──→  A-

HX711 → ESP32
  VCC ──→  3.3V
  GND ──→  GND
  DT  ──→  GPIO 4
  SCK ──→  GPIO 5

Active Buzzer → ESP32
  +   ──→  GPIO 18
  -   ──→  GND

RGB LED (common cathode) → ESP32
  R   ──→  GPIO 25  (via 220Ω)
  G   ──→  GPIO 26  (via 220Ω)
  B   ──→  GPIO 27  (via 220Ω)
  GND ──→  GND
```

---

## Arduino IDE Setup

### 1. Install ESP32 Board Support
1. Open Arduino IDE → **File → Preferences**
2. Add this URL to "Additional Boards Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. **Tools → Board Manager** → search "esp32" → Install **esp32 by Espressif Systems**

### 2. Install Libraries
In **Sketch → Include Library → Manage Libraries**:
- Search `HX711` → Install **HX711 by Bogdan Necula** (or Rob Tillaart)
- Search `ArduinoJson` → Install **ArduinoJson by Benoit Blanchon** (v6.x)

### 3. Board Settings
- **Board**: `ESP32 Dev Module`
- **Port**: Select your COM port
- **Upload Speed**: `115200`

---

## Configuration (edit `lpg_monitor.ino`)

| Variable | Default | What to change |
|---|---|---|
| `WIFI_SSID` | `"YOUR_WIFI_SSID"` | Your home Wi-Fi name |
| `WIFI_PASSWORD` | `"YOUR_WIFI_PASSWORD"` | Your Wi-Fi password |
| `API_BASE_URL` | `"http://192.168.1.10:8000/api/v1"` | Your computer's IP running the FastAPI backend |
| `CALIBRATION_FACTOR` | `2280.0` | Tune this (see below) |
| `TARE_WEIGHT_KG` | `15.5` | Empty cylinder weight |
| `FULL_WEIGHT_KG` | `29.7` | Full cylinder weight |

---

## Load Cell Calibration

1. Open `lpg_monitor.ino` and **comment out** the `postReading()` call temporarily
2. Upload sketch → open **Serial Monitor** at 115200 baud
3. Place a **known weight** (e.g. 1 kg bag of rice) on the scale
4. Adjust `CALIBRATION_FACTOR` until the serial monitor shows the correct weight
5. Restore the `postReading()` call and re-upload

---

## How It Works

```
Boot → Connect Wi-Fi → Register with backend
  └─ every 30 seconds:
       1. Read HX711 (average of 10 samples)
       2. POST to /api/v1/lpg/reading
       3. Server calculates gas %
       4. Server checks thresholds:
            ≤ 30% → WARNING alert + push notification
            ≤ 10% → CRITICAL alert + push notification
       5. LED & buzzer reflect local status:
            🟢 Green  = OK
            🟡 Yellow = LOW (30%)
            🔴 Red    = CRITICAL (10%)
```

---

## API Endpoints (backend)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/lpg/register` | Register device on first boot |
| `POST` | `/api/v1/lpg/reading` | Post weight reading |
| `GET`  | `/api/v1/lpg/status/{device_id}` | Dashboard status |
| `GET`  | `/api/v1/lpg/history/{device_id}` | Reading history for chart |
| `GET`  | `/api/v1/lpg/alerts/{device_id}` | Alert history |
| `POST` | `/api/v1/lpg/push-token` | Register Expo push token |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Scale reads 0 all the time | Check HX711 wiring, ensure DT/SCK pins match sketch |
| Scale reads garbage | Adjust `CALIBRATION_FACTOR` |
| WiFi not connecting | Double-check SSID/password, ensure 2.4 GHz band |
| Backend returns 404 | Backend not running, or wrong IP in `API_BASE_URL` |
| No push notifications | Open the mobile app once to register Expo token |
