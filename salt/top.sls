base:
  '*':
    - basics
    - timezone

  # Servers
  'server-*':
    - server/basics
    - server/unattended-upgrades
    - server/salt
    - server/users
    - server/sshd
    - server/telegraf
    - server/mail-relay

  server-test-api:
    - server/influxdb
    - server/grafana

  # Raspberry Pis
  'not server-*':
    - pi/basics
    - pi/auth
    - pi/salt-minion
    - pi/wpa
    - pi/rtc
    - pi/watchdog
    - pi/attiny-controller
    - pi/audio
    - pi/event-reporter
    - pi/audiobait
    - pi/thermal-recorder
    - pi/thermal-uploader
    - pi/dataplicity
    - pi/management-interface
