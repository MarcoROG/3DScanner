echo "Adding python to startup"
sudo cp /home/pi/3DScanner/3DScanner.sh /etc/init.d/3DScanner.sh
sudo chmod +x /etc/init.d/3DScanner.sh
sudo update-rc.d 3DScanner.sh defaults
echo "Done"
