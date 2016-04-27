from __future__ import with_statement
from flask import Flask, send_file, redirect, url_for, abort, request, jsonify, Response, render_template
from time import gmtime, strftime
import picamera
from contextlib import closing
from zipfile import ZipFile, ZIP_DEFLATED
import os
import os.path
import time
import RPi.GPIO as GPIO
from Motor import Motor

app = Flask(__name__)

global motor
global workingOn, scanSettings, scanProgress, scanning, abortSignal
GPIO.setmode(GPIO.BOARD)

workingOn = None #Set to the datetime of the scan
scanning = False
abortSignal = False
scanSettings = (0,0,0) #Photos per turn, turns, level
scanProgress = [0,0,0] #Current photo, current turn current level
motor = Motor(18,17,4,32,200)

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/takePhoto')
def takePhoto():
        global workingOn, scanning
        if workingOn != None and scanning == False:
		with picamera.PiCamera() as camera:
			camera.resolution = (480,320)
			time.sleep(0.2)
	        	camera.capture('static/Photo.jpg')
                return "Success"
	else:
		return abort(403)


@app.route('/start',methods=['POST'])
def startScan():
    global workingOn, scanSettings, scanProgress
    if workingOn != None :
        return "Scan already started"
    else:
        scanProgress = [0,0,0]
        workingOn = newDir()
	args = request.form
        scanSettings = (int(args['ppt']),int(args['tpl']),int(args['lev']))
        return workingOn


@app.route('/resume',methods=['GET'])
def resumeScan():
    global workingOn, scanSettings, scanProgress, scanning, abortSignal
    if workingOn != None and scanning == False: #if it's busy but not scanning
        Scan()
        if abortSignal:
                abortSignal = False
                return "Aborted"
        return workingOn
    return "Scanner was not idling"

@app.route('/scan',methods=['GET','DELETE'])
def scanList():
    if request.method == 'GET':
    	return jsonify({'dirs':subDirs('static/scans')})
    else:
	return abortScan()

@app.route('/scan/<scan>',methods=['GET','DELETE'])
def scanController(scan):
    global workingOn
    if request.method == 'GET':
        return downloadScan(scan)
    elif request.method == 'DELETE':
        if scan == workingOn:
            return abortScan()
        else:
            return deleteScan(scan)

def downloadScan(scan):
    if not os.path.isdir('static/scans/'+scan):
        return "No file found"
    if not os.path.isfile('static/scans/' + scan + 'zip'):
	zipdir('static/scans/'+scan,'static/scans/' + scan + '.zip')
    return send_file('static/scans/'+scan+'.zip',mimetype='application/zip')

def deleteScan(name):
    os.system("sudo rm -rf static/scans/" + name)
    if os.path.isfile("scans/" + name + ".zip"):
        os.system("sudo rm static/scans/" + name + ".zip")
    return "Scan deleted"

def abortScan():
    global workingOn, scanSettings, scanProgress, scanning, abortSignal
    if workingOn == None:
        return "Nothing to abort"
    else:
        if scanning:
                abortSignal = True    
	scanning = False
        scanProgress = [0,0,0]
        scanSettings = (0,0,0)
        workingOn = None
        return "Scan aborted"

@app.route('/status')
def status():
    global workingOn, scanSettings, scanProgress, scanning
    if workingOn == None:
        return "Idling"
    else :
        return jsonify({'name':workingOn,'scanning':scanning,'settings' : scanSettings, 'current':scanProgress})


def newDir():
    name = strftime("%Y-%m-%dat%H:%M:%S", gmtime())
    os.makedirs("static/scans/"+name)
    return name

def Scan():
    global workingOn, scanSettings, scanProgress, motor,scanning,abortSignal
    scanning = True
    scanProgress[2] = scanProgress[2] + 1
    for i in range(1,scanSettings[1]+1):
        scanProgress[1] = i
        for j in range(1, scanSettings[0]+1):
            motor.MoveDegrees(360 / scanSettings[0])
            time.sleep(0.1)
	    with picamera.PiCamera() as camera:
		camera.resolution = (1024,768)
		if abortSignal:
                    return
            	camera.capture('static/scans/'+ workingOn +'/'+str(scanProgress[1])+ '-' + str(scanProgress[0]) + '.jpg')
            time.sleep(0.6)
            scanProgress[0] = j
    scanning = False
    if scanProgress[2] == scanSettings[2]:
        workingOn = None

def zipdir(basedir, archivename):
    assert os.path.isdir(basedir)
    with closing(ZipFile(archivename, "w", ZIP_DEFLATED)) as z:
        for root, dirs, files in os.walk(basedir):
            for fn in files:
		if fn == archivename:
			continue
                absfn = os.path.join(root, fn)
                zfn = absfn[len(basedir)+len(os.sep):]
                z.write(absfn, zfn)

def subDirs(a_dir):
    return [name for name in os.listdir(a_dir)
            if os.path.isdir(os.path.join(a_dir, name))]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port = 80, threaded = True)


