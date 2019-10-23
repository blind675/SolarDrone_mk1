#include <SoftwareSerial.h>

int PWR_PIN = 4;
SoftwareSerial mySerial(10, 9); // RX, TX

void setup()
{
  pinMode(PWR_PIN, OUTPUT);

  digitalWrite(12, LOW);
  
  // Open serial communications and wait for port to open:
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for Native USB only
  }

  Serial.println("Goodnight moon!");

  // set the data rate for the SoftwareSerial port
  mySerial.begin(115200);

  
}

void loop() // run over and over
{
  if (mySerial.available())
    Serial.write(mySerial.read());
  if (Serial.available())
    mySerial.write(Serial.read());
}
