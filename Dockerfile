# A dockerized regression test runner
# It boots a corespring-container and a mongo
# and runs the component regression tests against it

FROM phusion/baseimage:0.9.16

# Settings for the regression tests
ENV SLUG "https://s3-external-1.amazonaws.com/herokuslugs/heroku.com/v1/74f625e6-13af-4126-b83a-48521b6992fa?AWSAccessKeyId=AKIAJWLOWWHPBWQOPJZQ&Signature=HEiABr2jSEu%2BIuWyHo58DoPsAJ4%3D&Expires=1459941371"
ENV TIMEOUT 60000
ENV GREP ""

# Default to UTF-8 file.encoding
ENV LANG C.UTF-8

RUN apt-get update && \
 apt-get upgrade -y && \
 apt-get install -y \
  firefox \
  git \
  nodejs \
  npm \
  openjdk-7-jdk \
  wget \
  xvfb

# link nodejs -> node
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Mongo:
# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/10gen.list
RUN apt-get update && apt-get install -y mongodb-org
# Create the MongoDB data directory
RUN mkdir -p /var/lib/mongodb 

# Ruby 
RUN apt-get update && \
  apt-get install -y ruby ruby-dev ruby-bundler 

RUN mkdir -p /data/regression
ADD docker/regression /data/regression
RUN cd /data/regression && npm install && npm install -g grunt-cli

### fakes3
RUN chmod +x /data/regression/extras/fakes3-0.2.3.gem
RUN gem install builder
RUN gem install --backtrace -V --local /data/regression/extras/fakes3-0.2.3.gem
RUN mkdir /opt/fake-s3-root
ENV CONTAINER_FAKE_S3_ENDPOINT="http://localhost:4567"

### xvfb
ADD docker/regression/extras/xvfb.init /etc/init.d/xvfb
RUN chmod +x /etc/init.d/xvfb
RUN update-rc.d xvfb defaults

## main script
RUN chmod +x /data/regression/scripts/main.sh

CMD ["/data/regression/scripts/main.sh"]

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
