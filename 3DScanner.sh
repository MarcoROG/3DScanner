#! /bin/sh
# /etc/init.d/example
### BEGIN INIT INFO
# Provides:          3DScanner
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: WebUI for 3DScanner.
# Description:       Enable WebUI for 3D Scanning.
### END INIT INFO

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
