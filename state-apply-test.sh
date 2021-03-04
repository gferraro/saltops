#!/bin/bash
# This is to help testing salt changes on a Raspberry Pi
# Usage: state-apply-test.sh [devicename] [state.apply params]
# If you need to make changes to top.sls make the changes in `salt/top.sls` This is what is used when testing

device=$1
params=$2

if [[ -z $device ]]; then
  echo "please provide device name. Usage \`state-apply-test.sh [devicename] [state.apply params]\`"
  exit 1
fi

# copy files to local folder
cp -r basics.sls _modules/ pi/ _states/ salt-migration/ timezone.sls salt/

ssh pi@$device "sudo rm -rf salt /srv/salt"

# copy onto device
echo "copying files to device.."
scp -rq salt pi@$device:
echo "done"

echo "moving files to /srv"
ssh pi@$device "sudo cp -r salt /srv/"
echo "done"

cmd="ssh pi@$device \"sudo salt-call --local state.apply $params --state-output=changes\""
echo "running $cmd"
eval $cmd
