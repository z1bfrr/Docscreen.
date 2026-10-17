
#define TOUCH_PIN D2

void setup() {
  Serial.begin(115200);
  pinMode(TOUCH_PIN, INPUT);

  Serial.println("ESP8266 Touch Sensor Ready");
}

void loop() {
  int touchState = digitalRead(TOUCH_PIN);

  if (touchState == HIGH) {
    Serial.println("Touch detected!");
  } else {
    Serial.println("Not touched");
  }

  delay(200);
}
