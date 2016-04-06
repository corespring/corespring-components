#!/bin/bash
set -e

######################################################
# Run the component regression tests
######################################################

echo "-- download slug"
wget -O /tmp/slug.tgz "$SLUG"
tar xvzf /tmp/slug.tgz
rm /tmp/slug.tgz

mv app/corespring-components/components /data/regression/components
export CONTAINER_COMPONENTS_PATH=/data/regression/components

mv app /opt/corespring-container

echo "-- starting xvfb"
service xvfb start
export DISPLAY=:10

echo "-- boot mongo"
mongod --fork --dbpath /var/lib/mongodb/ --smallfiles --logpath /var/log/mongodb.log --logappend

echo "-- boot fake s3"
fakes3 -r /opt/fake-s3-root -p 4567 &

echo "-- boot play app..."
cd /opt/corespring-container
./bin/root > play.out 2> play.err < /dev/null &

echo "-- waiting WAIT_BEFORE_TEST seconds on the servers too boot"
for i in {WAIT_BEFORE_TEST..0}; do echo -ne .; sleep 1; done
echo ""

echo "-- run regression tests ..."
cd /data/regression
grunt regression --grep=$GREP --timeout=$TIMEOUT



