import RPi.GPIO as GPIO
import math
import time

class Motor:
    def __init__(self, DirectionPin, EnablePin, StepPin, StepFraction, StepsPerTurn):
        self.StepFraction = StepFraction
        self.DirectionPin = DirectionPin
        self.DegreesPerStep = 360 / StepsPerTurn
        self.Direction = False #default direction
        self.EnablePin = EnablePin
        self.Enabled = False
        self.StepPin = StepPin
        #Set all the statuses
        GPIO.setup(self.StepPin, GPIO.OUT)
        GPIO.setup(self.DirectionPin, GPIO.OUT)
        GPIO.setup(self.EnablePin, GPIO.OUT)
        GPIO.output(self.EnablePin, 1)
        GPIO.output(self.DirectionPin, 1)

    def Enable(self):
        self.Enabled = True
        GPIO.output(self.EnablePin, 0)
    def Disable(self):
        self.Enabled = False
        GPIO.output(self.EnablePin, 1)
    def ToggleEnable(self):
        if self.Enabled == True:
            self.Disable()
        else:
            self.Enable()
            
    def SetForwardDirection(self):
        self.Direction = False
        GPIO.output(self.DirectionPin, 1)
    def SetBackwardDirection(self):
        self.Direction = True
        GPIO.output(self.DirectionPin, 0)
    def ToggleDirection(self):
        if self.Direction == True:
            self.SetForwardDirection()
        else:
            self.SetBackwardDirection()
            
    def TakeStepFractions(self, StepFractions):
        shouldDisable = False
        if not self.Enabled:
            self.Enable()
            shouldDisable = True
            
        goingReverse = False
        if StepFractions == 0:
            return
        elif StepFractions < 0:#if we get negative steps, we temporarely switch the motor direction
            goingReverse = True
            self.ToggleDirection()
            
        for i in range(int(math.ceil(abs(StepFractions)))):
            GPIO.output(self.StepPin, 0)
            time.sleep(0.001)
            GPIO.output(self.StepPin, 1)
            time.sleep(0.001)
        if goingReverse == True:
            self.ToggleDirection()
        if shouldDisable == True:
            self.Disable()

    def TakeSteps(self, Steps):
        self.TakeStepFractions(Steps * self.StepFraction)
    def MoveDegrees(self, Degrees):
        self.TakeSteps(Degrees / self.DegreesPerStep)
            
        
