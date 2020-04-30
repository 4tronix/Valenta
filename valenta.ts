
/**
  * Enumeration of motors.
  */
enum vMotor
{
    //% block="motor 1"
    M1,
    //% block="motor 2"
    M2,
    //% block="both"
    Both
}

/**
  * Enumeration of forward/reverse directions
  */
enum vDirection
{
    //% block="forward"
    Forward,
    //% block="reverse"
    Reverse
}

/**
  * Enumeration of directions.
  */
enum vRobotDirection
{
    //% block="left"
    Left,
    //% block="right"
    Right
}

/**
  * Stop modes. Coast or Brake
  */
enum vStopMode
{
    //% block="no brake"
    Coast,
    //% block="brake"
    Brake
}

/**
  * Model Types of Valenta Board
  * Zero or Plus
  */
enum vModel
{
    Zero,
    Plus,
    Auto
}


/**
  * Pre-Defined LED colours
  */
enum vColors
{
    //% block=red
    Red = 0xff0000,
    //% block=orange
    Orange = 0xffa500,
    //% block=yellow
    Yellow = 0xffff00,
    //% block=green
    Green = 0x00ff00,
    //% block=blue
    Blue = 0x0000ff,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xff00ff,
    //% block=white
    White = 0xffffff,
    //% block=black
    Black = 0x000000
}

/**
 * Custom blocks
 */
//% weight=50 color=#a93135 icon="\uf0e4"
namespace valenta
{
    let fireBand: fireled.Band;
    let _flashing = false;
    let leftBias = 0;
    let rightBias = 0;

    let _model = vModel.Auto;
    let lDir = 0;
    let rDir = 0;
// Servo PCA9685
    let PCA = 0x40;	// i2c address of PCA9685 servo controller
    let initI2C = false;
    let _i2cError = 0;
    let SERVOS = 0x06; // first servo address for start byte low
    let servoOffset: number[] = [];

// Helper functions

    function clamp(value: number, min: number, max: number): number
    {
        return Math.max(Math.min(max, value), min);
    }

// Blocks for selecting Board Model

    /**
      * Force Model of Board (Determines Pins used etc)
      *
      * @param model Model of Board; Zero or Plus
      */
    //% blockId="val_model" block="select board model %model=v_models"
    //% weight=100
    //% subcategory=Board_Model
    export function select_model(model: number): void
    {
        if((model >= vModels(vModel.Zero)) && (model <= vModels(vModel.Auto)))
            _model = model;
    }

    /**
      * get Model of Board (Zero or Plus)
      */
    //% blockId="v_model" block="board model"
    //% weight=90
    //% subcategory=Board_Model
    export function getModel(): vModel
    {
        if (_model == vModel.Auto)
        {
            if (pins.i2cReadNumber(64, NumberFormat.Int8LE, false) == 0)
                _model = vModel.Zero;
            else
                _model = vModel.Plus;
        }
        return _model;
    }

    /**
      * Get numeric value of Board Model
      *
      * @param model Board Model eg: Zero
      */
    //% blockId="v_models" block=%model
    //% weight=80
    //% subcategory=Board_Model
    export function vModels(model: vModel): number
    {
        return model;
    }

// Motor Blocks

    // slow PWM frequency for slower speeds to improve torque
    // only one PWM frequency available for all pins
    function setPWM(speed: number): void
    {
        if (speed < 200)
            pins.analogSetPeriod(AnalogPin.P12, 60000);
        else if (speed < 300)
            pins.analogSetPeriod(AnalogPin.P12, 40000);
        else
            pins.analogSetPeriod(AnalogPin.P12, 30000);
    }

    /**
      * Move both motors forward (or backward) at speed.
      * @param direction Move Forward or Reverse
      * @param speed speed of motor between 0 and 100. eg: 60
      */
    //% blockId="vGo" block="go%direction|at speed%speed"
    //% speed.min=0 speed.max=100
    //% weight=100
    //% subcategory=Motors
    export function go(direction: vDirection, speed: number): void
    {
        move(vMotor.Both, direction, speed);
    }

    /**
      * Rotate 2WD robot in direction at speed
      * @param direction direction to turn
      * @param speed speed of motors (0 to 100). eg: 60
      */
    //% blockId="vRotate" block="spin%direction|at speed%speed"
    //% speed.min=0 speed.max=100
    //% weight=90
    //% subcategory=Motors
    export function rotate(direction: vRobotDirection, speed: number): void
    {
        if (direction == vRobotDirection.Left)
        {
            move(vMotor.M1, vDirection.Reverse, speed);
            move(vMotor.M2, vDirection.Forward, speed);
        }
        else if (direction == vRobotDirection.Right)
        {
            move(vMotor.M1, vDirection.Forward, speed);
            move(vMotor.M2, vDirection.Reverse, speed);
        }
    }

    /**
      * Stop robot by coasting slowly to a halt or braking
      * @param mode Brakes on or off
      */
    //% blockId="val_stop" block="stop with%mode"
    //% weight=80
    //% subcategory=Motors
    export function stop(mode: vStopMode): void
    {
        let stopMode = 0;
        if (mode == vStopMode.Brake)
            stopMode = 1;
        if (getModel() == vModel.Zero)
        {
            pins.digitalWritePin(DigitalPin.P12, stopMode);
            pins.digitalWritePin(DigitalPin.P13, stopMode);
            pins.digitalWritePin(DigitalPin.P14, stopMode);
            pins.digitalWritePin(DigitalPin.P15, stopMode);
        }
        else
        {
            pins.digitalWritePin(DigitalPin.P12, 0);
            pins.digitalWritePin(DigitalPin.P13, lDir ^ stopMode);
            pins.digitalWritePin(DigitalPin.P14, 0);
            pins.digitalWritePin(DigitalPin.P15, rDir ^ stopMode);
        }
    }

    /**
      * Move both motors forward (or backward) at speed for milliseconds
      * @param direction Move Forward or Reverse
      * @param speed speed of motor between 0 and 100. eg: 60
      * @param milliseconds duration in milliseconds to drive forward for, then stop. eg: 400
      */
    //% blockId="vGoms" block="go%direction|at speed%speed|for%milliseconds|(ms)"
    //% speed.min=0 speed.max=100
    //% weight=70
    //% subcategory=Motors
    export function goms(direction: vDirection, speed: number, milliseconds: number): void
    {
        go(direction, speed);
        basic.pause(milliseconds);
        stop(vStopMode.Coast);
    }

    /**
      * Rotate 2WD robot in direction at speed for milliseconds.
      * @param direction direction to spin
      * @param speed speed of motor between 0 and 100. eg: 60
      * @param milliseconds duration in milliseconds to spin for, then stop. eg: 400
      */
    //% blockId="vRotatems" block="spin%direction|at speed%speed|for%milliseconds|(ms)"
    //% speed.min=0 speed.max=100
    //% weight=60
    //% subcategory=Motors
    export function rotatems(direction: vRobotDirection, speed: number, milliseconds: number): void
    {
        rotate(direction, speed);
        basic.pause(milliseconds);
        stop(vStopMode.Coast);
    }

    /**
      * Move individual motors forward or reverse
      * @param motor motor to drive
      * @param direction select forwards or reverse
      * @param speed speed of motor between 0 and 100. eg: 60
      */
    //% blockId="vMove" block="move%motor|motor(s)%direction|at speed%speed"
    //% weight=50
    //% speed.min=0 speed.max=100
    //% subcategory=Motors
    export function move(motor: vMotor, direction: vDirection, speed: number): void
    {
        speed = clamp(speed, 0, 100) * 10.23;
        setPWM(speed);
        let lSpeed = Math.round(speed * (100 - leftBias) / 100);
        let rSpeed = Math.round(speed * (100 - rightBias) / 100);
        if (getModel() == vModel.Zero)
        {
            if ((motor == vMotor.M1) || (motor == vMotor.Both))
            {
                if (direction == vDirection.Forward)
                {
                    pins.analogWritePin(AnalogPin.P12, lSpeed);
                    pins.analogWritePin(AnalogPin.P13, 0);
                }
                else
                {
                    pins.analogWritePin(AnalogPin.P12, 0);
                    pins.analogWritePin(AnalogPin.P13, lSpeed);
                }
            }
            if ((motor == vMotor.M2) || (motor == vMotor.Both))
            {
                if (direction == vDirection.Forward)
                {
                    pins.analogWritePin(AnalogPin.P14, rSpeed);
                    pins.analogWritePin(AnalogPin.P15, 0);
                }
                else
                {
                    pins.analogWritePin(AnalogPin.P14, 0);
                    pins.analogWritePin(AnalogPin.P15, rSpeed);
                }
            }
        }
        else // model == Plus
        {
            let reverse = (direction == vDirection.Reverse) ? 1 : 0;
            if ((motor == vMotor.M1) || (motor == vMotor.Both))
            {
                pins.analogWritePin(AnalogPin.P12, speed);
                pins.digitalWritePin(DigitalPin.P13, reverse);
                lDir = reverse;
            }
            if ((motor == vMotor.M2) || (motor == vMotor.Both))
            {
                pins.analogWritePin(AnalogPin.P14, speed);
                pins.digitalWritePin(DigitalPin.P15, reverse);
                rDir = reverse;
            }
        }
    }

// Servo Blocks

    // initialise the servo driver and the offset array values
    function initPCA(): void
    {

        let i2cData = pins.createBuffer(2);
        initI2C = true;

        i2cData[0] = 0;		// Mode 1 register
        i2cData[1] = 0x10;	// put to sleep
        pins.i2cWriteBuffer(PCA, i2cData, false);

        i2cData[0] = 0xFE;	// Prescale register
        i2cData[1] = 101;	// set to 60 Hz
        pins.i2cWriteBuffer(PCA, i2cData, false);

        i2cData[0] = 0;		// Mode 1 register
        i2cData[1] = 0x81;	// Wake up
        pins.i2cWriteBuffer(PCA, i2cData, false);

        for (let servo=0; servo<16; servo++)
        {
            i2cData[0] = SERVOS + servo*4 + 0;	// Servo register
            i2cData[1] = 0x00;			// low byte start - always 0
            _i2cError = pins.i2cWriteBuffer(PCA, i2cData, false);

            i2cData[0] = SERVOS + servo*4 + 1;	// Servo register
            i2cData[1] = 0x00;			// high byte start - always 0
            pins.i2cWriteBuffer(PCA, i2cData, false);

            servoOffset[servo] = 0;
        }
    }

    /**
      * Initialise all servos to Angle=0
      */
    //% blockId="zeroServos"
    //% block="centre all servos"
    //% subcategory=Servos
    export function zeroServos(): void
    {
        for (let i=0; i<16; i++)
            setServo(i, 0);
    }

    /**
      * Set offsets for servos
      * @param servo servo or pin to set offset
      * @param degrees degrees +ve or -ve to offset servo
      */
    //% blockId="OffsetServos"
    //% block="Offset servo%servo|by%degrees|degrees"
    //% subcategory=Servos
    export function offsetServos(servo: number, degrees: number): void
    {
        if (initI2C == false)
        {
            initPCA();
        }
        servo = clamp(servo, 0, 15);
        degrees = clamp(degrees, -20, 20);
        servoOffset[servo] = degrees;
    }

    /**
      * Set Servo Position by Angle
      * For Valenta Zero, servo number is the pin number
      * @param servo Servo number (0 to 15)
      * @param angle degrees to turn servo (-90 to +90)
      */
    //% blockId="an_setServo" block="set servo %servo| to angle %angle"
    //% weight = 70
    //% angle.min=-90 angle.max=90
    //% subcategory=Servos
    export function setServo(servo: number, angle: number): void
    {
        if (initI2C == false)
        {
            initPCA();
        }
        servo = clamp(servo, 0, 15);
        angle = clamp(angle, -90, 90) + servoOffset[servo];
        if (_model == vModel.Zero)
        {
            // servo is pin number
            switch(servo)
            {
                case 0: pins.servoWritePin(AnalogPin.P0, angle + 90); break;
                case 1: pins.servoWritePin(AnalogPin.P1, angle + 90); break;
                case 2: pins.servoWritePin(AnalogPin.P2, angle + 90); break;
                case 8: pins.servoWritePin(AnalogPin.P8, angle + 90); break;
            }
        }
        else
        {
            // two bytes need setting for start and stop positions of the servo
            // servos start at SERVOS (0x06) and are then consecutive blocks of 4 bytes
            // the start position (always 0x00) is set during init for all servos
            // the zero offset for each servo is read during init into the servoOffset array
            let i2cData = pins.createBuffer(2);
            let start = 0;
            let stop = 369 + angle * 223 / 90;

            i2cData[0] = SERVOS + servo*4 + 2;	// Servo register
            i2cData[1] = (stop & 0xff);		// low byte stop
            pins.i2cWriteBuffer(PCA, i2cData, false);

            i2cData[0] = SERVOS + servo*4 + 3;	// Servo register
            i2cData[1] = (stop >> 8);		// high byte stop
            pins.i2cWriteBuffer(PCA, i2cData, false);
        }
    }


// FireLed Status Blocks

    // create a FireLed band if not got one already. Default to brightness 40
    function fire(): fireled.Band
    {
        if (!fireBand)
        {
            fireBand = fireled.newBand(DigitalPin.P16, 1);
            fireBand.setBrightness(40);
        }
        return fireBand;
    }

    // Always update status LED
    function updateLEDs(): void
    {
        fire().updateBand();
    }

    /**
      * Sets the status LED to a given color (range 0-255 for r, g, b).
      * @param rgb colour of the LED
      */
    //% blockId="db_set_led_color" block="set LED to %rgb=val_colours"
    //% weight=100
    //% subcategory=FireLed
    export function setLedColor(rgb: number)
    {
        stopFlash();
        setLedColorRaw(rgb);
    }

    function setLedColorRaw(rgb: number)
    {
        fire().setBand(rgb);
        updateLEDs();
    }

    /**
      * Clear LED
      */
    //% blockId="LedClear" block="clear LED"
    //% weight=70
    //% subcategory=FireLed
    export function ledClear(): void
    {
        stopFlash();
        ledClearRaw();
    }

    function ledClearRaw(): void
    {
        fire().clearBand();
        updateLEDs();
    }

    /**
     * Set the brightness of the LED
     * @param brightness a measure of LED brightness in 0-255. eg: 40
     */
    //% blockId="LedBrightness" block="set LED brightness %brightness"
    //% brightness.min=0 brightness.max=255
    //% weight=50
    //% subcategory=FireLed
    export function ledBrightness(brightness: number): void
    {
        fire().setBrightness(brightness);
        updateLEDs();
    }

    /**
      * Get numeric value of colour
      * @param color Standard RGB Led Colours eg: #ff0000
      */
    //% blockId="val_colours" block=%color
    //% blockHidden=false
    //% weight=60
    //% subcategory=FireLed
    //% shim=TD_ID colorSecondary="#e7660b"
    //% color.fieldEditor="colornumber"
    //% color.fieldOptions.decompileLiterals=true
    //% color.defl='#ff0000'
    //% color.fieldOptions.colours='["#FF0000","#659900","#18E600","#80FF00","#00FF00","#FF8000","#D82600","#B24C00","#00FFC0","#00FF80","#FFC000","#FF0080","#FF00FF","#B09EFF","#00FFFF","#FFFF00","#8000FF","#0080FF","#0000FF","#FFFFFF","#FF8080","#80FF80","#40C0FF","#999999","#000000"]'
    //% color.fieldOptions.columns=5
    //% color.fieldOptions.className='rgbColorPicker'
    export function dbColours(color: number): number
    {
        return color;
    }

    /**
      * Convert from RGB values to colour number
      *
      * @param red Red value of the LED (0 to 255)
      * @param green Green value of the LED (0 to 255)
      * @param blue Blue value of the LED (0 to 255)
      */
    //% blockId="ConvertRGB" block="convert from red %red| green %green| blue %blue"
    //% weight=40
    //% subcategory=FireLed
    export function convertRGB(r: number, g: number, b: number): number
    {
        return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
    }

    /**
      * Start Flashing
      * @param color the colour to flash
      * @param delay time in ms for each flash, eg: 100,50,200,500
      */
    //% blockId="StartFlash" block="start flash %color=db_colours| at %delay|(ms)"
    //% subcategory=FireLed
    //% delay.min=1 delay.max=10000
    //% weight=90
    export function startFlash(color: number, delay: number): void
    {
        if(_flashing == false)
        {
            _flashing = true;
            control.inBackground(() =>
            {
                while (_flashing)
                {                                
                    setLedColorRaw(color);
                    basic.pause(delay);
                    if (! _flashing)
                        break;
                    ledClearRaw();
                    basic.pause(delay);
                }
            })
        }
    }

    /**
      * Stop Flashing
      */
    //% block
    //% subcategory=FireLed
    //% weight=80
    export function stopFlash(): void
    {
        _flashing = false;
    }


}
