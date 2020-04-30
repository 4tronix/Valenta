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
// Drive forward at speed 60
valenta.go(vDirection.Forward, 60)

// Drive backwards at speed 40 for 2000 ms
valenta.goms(vDirection.Reverse, 40, 2000)
```
If you are using the Valenta board with a 2WD car with caster(s) then spin using the rotate commands
// Spin left at speed 50
valenta.rotate(vRobotDirection.Left, 50)

// Spin right for 200 ms at speed 70
valenta.rotatems(vRobotDirection.Right, 70, 200)
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

## Fireled helpers

The Valenta Plus has a single smart RGB Fireled.
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

## Servo helpers
The Valenta Plus has a dedicated servo controller with 16 servos available (only 4 are brought to pins)
The Valenta Zero has 4 general purpose pins, which can also be used for servos if required (and set to 5V)
The extension will use whichever types of servo are available

Three commands are available:
```blocks
// Set the offset for an individual servo (to ensure it is properly centred)
// Set servo on Pin 8 to an offset of +5 degrees
valenta.offsetServos(8, 5)
// Set servo on Pin 2 to +50 degrees (range is -90 to +90)
valenta.setServo(2, 50)
// Centre all servos
valenta.zeroServos()
```

## Supported targets

* for PXT/microbit

## License

MIT
