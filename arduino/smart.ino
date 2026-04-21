#define MFRC522_SPICLOCK (400000u)
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9
#define BUTTON_PIN 2
#define BUZZER_PIN 8

MFRC522 mfrc522(SS_PIN, RST_PIN);

int stopNumber = 0;
int farePerStop = 5;
bool buttonWasPressed = false;
unsigned long lastPressTime = 0;
const int DEBOUNCE_DELAY = 300;

// Entry tracking
String boardedUID = "";       // UID of passenger currently on trip
int boardedAtStop = 0;        // Stop where they boarded
bool passengerOnBoard = false; // Is someone currently on a trip?

void buzz(int times, int duration) {
  for (int i = 0; i < times; i++) {
    tone(BUZZER_PIN, 1000, duration);
    delay(duration + 200);
  }
  noTone(BUZZER_PIN);
}

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.println("=== Bus Fare System Ready ===");
}

void loop() {
  // Button press = record stop
  bool buttonNowPressed = (digitalRead(BUTTON_PIN) == LOW);
  unsigned long currentTime = millis();

  if (buttonNowPressed && !buttonWasPressed) {
    if (currentTime - lastPressTime > DEBOUNCE_DELAY) {
      lastPressTime = currentTime;
      stopNumber++;
      buzz(1, 200);

      Serial.println("-----------------------------");
      Serial.print("Stop Recorded: ");
      Serial.println(stopNumber);
      Serial.println("-----------------------------");

      // JSON for bridge.cjs
      Serial.print("{\"type\":\"stop\",\"stop_number\":");
      Serial.print(stopNumber);
      Serial.println("}");
    }
  }
  buttonWasPressed = buttonNowPressed;

  // Card scan
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  // Read UID
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) uid += " ";
  }
  uid.toUpperCase();

  // ✅ ENTRY-EXIT LOGIC
  if (!passengerOnBoard) {
    // ── ENTRY SCAN ──
    boardedUID = uid;
    boardedAtStop = stopNumber;
    passengerOnBoard = true;

    buzz(1, 300); // 1 buzz = boarded

    Serial.println("-----------------------------");
    Serial.print("BOARDED - Card UID: ");
    Serial.println(uid);
    Serial.print("Entry Stop: ");
    Serial.println(boardedAtStop);
    Serial.println("-----------------------------");

    // JSON for bridge.cjs
    Serial.print("{\"type\":\"entry\",\"rfid_uid\":\"");
    Serial.print(uid);
    Serial.print("\",\"entry_stop\":");
    Serial.print(boardedAtStop);
    Serial.println("}");

  } else if (passengerOnBoard && uid == boardedUID) {
    // ── EXIT SCAN (same card) ──
    int stopsTraveiled = stopNumber - boardedAtStop;
    int fare = stopsTraveiled * farePerStop;

    // Edge case: scanned at same stop
    if (stopsTraveiled <= 0) {
      Serial.println("! Same stop scan ignored !");
      mfrc522.PICC_HaltA();
      mfrc522.PCD_StopCrypto1();
      delay(1000);
      return;
    }

    passengerOnBoard = false;
    buzz(2, 300); // 2 buzzes = exited & paid

    Serial.println("-----------------------------");
    Serial.print("EXITED  - Card UID: ");
    Serial.println(uid);
    Serial.print("Entry Stop:  ");
    Serial.println(boardedAtStop);
    Serial.print("Exit Stop:   ");
    Serial.println(stopNumber);
    Serial.print("Stops:       ");
    Serial.println(stopsTraveiled);
    Serial.print("Fare:        Rs.");
    Serial.println(fare);
    Serial.println("-----------------------------");

    // JSON for bridge.cjs
    Serial.print("{\"type\":\"payment\",\"rfid_uid\":\"");
    Serial.print(uid);
    Serial.print("\",\"entry_stop\":");
    Serial.print(boardedAtStop);
    Serial.print(",\"exit_stop\":");
    Serial.print(stopNumber);
    Serial.print(",\"fare\":");
    Serial.print(fare);
    Serial.println("}");

    // Reset
    boardedUID = "";
    boardedAtStop = 0;

  } else {
    // Different card scanned while someone is on board
    buzz(3, 100); // 3 quick buzzes = error
    Serial.println("! Another passenger already on trip !");
  }

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  delay(1000);
}