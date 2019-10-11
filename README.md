# MakeCode Package for Valenta Zero and Plus Controller Boards

This library provides a Microsoft Makecode package for Valenta Zero and Plus

## Selecting the Model of Board
This extension will automatically detect which board is in use on power up. Alternatively
you can force the type of board. You can also query the board type so your code can respond correctly
```blocks
// Set the board type
valenta.select_model(vModel.Plus)

// Check and respond to board type
if (valenta.getModel() == vModels(vModel.Plus))
{
   ...
}
```

## Driving the robot    
The simplest way to drive robot is by using the `driveMilliseconds(...)` and `driveTurnMilliseconds(...)` blocks.   
Note with `driveMilliseconds(...)`, you can specify a negative speed to reverse.   
```blocks
// Drive forward for 2000 ms
valenta.driveMilliseconds(1023, 2000)

// Drive backwards for 2000 ms
valenta.driveMilliseconds(-1023, 2000)

// Spin left for 200 ms
valenta.spinMilliseconds(vRobotDirection.Left, 1023, 200)

// Turn right for 200 ms
valenta.spinMilliseconds(vRobotDirection.Right, 1023, 200)
```   

These blocks are also available in non blocking version. The following example performs the same operation as above.   
```blocks
valenta.drive(1023)
basic.pause(1000)

valenta.drive(0)
basic.pause(1000)

valenta.spin(vRobotDirection.Left, 1023)
basic.pause(250)

valenta.spin(vRobotDirection.Right, 1023)
basic.pause(250)

valenta.drive(0)
```

## Stopping
When the motor speed is set to zero then it stops. However, we can also use the motor itself to create a reverse generated current to brake much quicker.
This helps when aiming for more accurate manoeuvres. Use the `TH.stop(...)` command to stop with braking, or coast to a halt
```blocks
valenta.robot_stop(vStopMode.Coast) # slowly coast to a stop
valenta.robot_stop(vStopMode.Brake) # rapidly brake
```

## Driving the motor

If you want more fine grain control of individal motors, use `valenta.motor(..)` to drive motor either forward or reverse. The value
indicates speed and is between `-1023` to `1023`. Minus indicates reverse.

```blocks
// Drive 1000 ms forward
valenta.motor(vMotor.Both, 1023);
basic.pause(1000);

// Drive 1000 ms reverse
valenta.motor(vMotor.Both, -1023);
basic.pause(1000);

// Drive 1000 ms forward on left and reverse on right
valenta.motor(vMotor.Left, 1023);
valenta.motor(vMotor.Right, -1023);
basic.pause(1000);
```

## NeoPixel helpers

The Valenta Plus has a single smart RGB LEDs(aka neopixels) fitted.
This library defines some helpers for using it.
The LED is automatically updated after every setting. This makes it easy to understand.

```blocks
// Set LED to a colour
valenta.setLedColor(valenta.vColours(vColors.Red));

// Clear the LED
valenta.ledClear();

// Set brightness of LED
valenta.ledBrightness(100);
```

## Supported targets

* for PXT/microbit

## License

MIT
