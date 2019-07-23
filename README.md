# MakeCode Package for THZero & THPlus Controller Boards

This library provides a Microsoft Makecode package for 4tronix THZero & THPlus

## Driving the robot    
The simplest way to drive robot is by using the `driveMilliseconds(...)` and `driveTurnMilliseconds(...)` blocks.   
Note with `driveMilliseconds(...)`, you can specify a negative speed to reverse.   
```blocks
// Drive forward for 2000 ms
TH.driveMilliseconds(1023, 2000)

// Drive backwards for 2000 ms
TH.driveMilliseconds(-1023, 2000)

// Spin left for 200 ms
TH.spinMilliseconds(MBRobotDirection.Left, 1023, 200)

// Turn right for 200 ms
TH.spinMilliseconds(MBRobotDirection.Right, 1023, 200)
```   

These blocks are also available in non blocking version. The following example performs the same operation as above.   
```blocks
TH.drive(1023)
basic.pause(1000)

TH.drive(0)
basic.pause(1000)

TH.spin(MBRobotDirection.Left, 1023)
basic.pause(250)

TH.spin(MBRobotDirection.Right, 1023)
basic.pause(250)

TH.drive(0)
```

## Stopping
When the motor speed is set to zero then it stops. However, we can also use the motor itself to create a reverse generated current to brake much quicker.
This helps when aiming for more accurate manoeuvres. Use the `TH.stop(...)` command to stop with braking, or coast to a halt
```blocks
TH.robot_stop(MBStopMode.Coast) # slowly coast to a stop
TH.robot_stop(MBStopMode.Brake) # rapidly brake
```

## Driving the motor

If you want more fine grain control of individal motors, use `TH.motor(..)` to drive motor either forward or reverse. The value
indicates speed and is between `-1023` to `1023`. Minus indicates reverse.

```blocks
// Drive 1000 ms forward
TH.motor(MBMotor.All, 1023);
basic.pause(1000);

// Drive 1000 ms reverse
TH.motor(MBMotor.All, -1023);
basic.pause(1000);

// Drive 1000 ms forward on left and reverse on right
TH.motor(MBMotor.Left, 1023);
TH.motor(MBMotor.Right, -1023);
basic.pause(1000);
```

## NeoPixel helpers

The TH has 4 smart RGB LEDs (aka neopixels) fitted. This library defines some helpers
for using them.
By default, the LEDs are Automatically updated after every setting. This makes it easy to understand.
However, it can slow down some effects so there is a block provided to switch the update mode to
Manual or Automatic:

```blocks
// Switch LEDs Update Mode to Manual or Automatic
TH.setUpdateMode(MBMode.Manual);
TH.setUpdateMode(MBMode.Auto);

// Show all leds
TH.setLedColor(TH.MBColours(MBColors.Red));
TH.ledShow();

// Clear all leds
TH.ledClear();
TH.ledShow();

// Show led at position 1 to Red
TH.setPixelColor(0, TH.MBColours(MBColors.Red));
TH.ledShow();

// Show led rainbow
TH.ledRainbow();
TH.ledShow();

// Show led rainbow and shift
TH.ledRainbow();
TH.ledShift();
TH.ledShow();

// Show led rainbow and rotate
TH.ledRainbow();
TH.ledRotate();
TH.ledShow();

// Set brightness of leds
TH.ledBrightness(100);
TH.ledShow();
```

## Supported targets

* for PXT/microbit

## License

MIT
