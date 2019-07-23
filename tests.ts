{
  // Drive full speed forward
  MiniBit.drive(1023);
  basic.pause(1000);

  // Drive full speed reverse for 300 ms
  MiniBit.driveMiliseconds(-1023, 300);
  basic.pause(1000);

  // Drive 100 ms forward on left and reverse on right
  MiniBit.motor(MBMotor.Left, 1023);
  MiniBit.motor(MBMotor.Right, -1023);
  basic.pause(1000);

  // Read sonar values
  basic.showNumber(MiniBit.sonar(MBPingUnit.MicroSeconds));
  basic.showNumber(MiniBit.sonar(MBPingUnit.Centimeters));
  basic.showNumber(MiniBit.sonar(MBPingUnit.Inches));

  // Set all leds to Red
  MiniBit.setLedColor(MiniBit.MBColours(MBColors.Red));
  MiniBit.ledShow();
  basic.pause(1000);

  // Clear all leds
  MiniBit.ledClear();
  MiniBit.ledShow();
  basic.pause(1000);

  // Set led at position 2 to Blue
  MiniBit.setPixelColor(2, MiniBit.MBColours(MBColors.Blue));
  MiniBit.ledShow();
  basic.pause(1000);

  // Show led rainbow
  MiniBit.ledRainbow();
  MiniBit.ledShow();
  basic.pause(1000);

  // Show led rainbow and shift
  MiniBit.ledRainbow();
  MiniBit.ledShift();
  MiniBit.ledShow();
  basic.pause(1000);

  // Show led rainbow and rotate
  MiniBit.ledRainbow();
  MiniBit.ledRotate();
  MiniBit.ledShow();
  basic.pause(1000);

  // Set brightness of leds
  MiniBit.ledBrightness(100);
  MiniBit.ledShow();
  basic.pause(1000);

  // Set the Manual/Automatic Update mode
  MiniBit.setUpdateMode(MBMode.Manual);
  MiniBit.setUpdateMode(MBMode.Auto);
}
