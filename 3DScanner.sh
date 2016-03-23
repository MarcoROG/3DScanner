#! /bin/sh
# /etc/init.d/example
 
case "$1" in
  start)
    sudo python /home/pi/3DScanner/Site.py &
    ;;
  stop)
    echo "Stopping the controller"
    # kill application you want to stop
    sudo killall python
    ;;
  *)
    echo "Usage: /etc/init.d/3DScanner{start|stop}"
    exit 1
    ;;
esac
 
exit 0
