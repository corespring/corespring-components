# A dockerized regression test runner
# It boots a corespring-container and a mongo
# and runs the component regression tests against it


FROM phusion/baseimage:0.9.16

# Settings for the regression tests
ENV BROWSER_NAME "chrome"
ENV GREP ""
ENV GRUNT_DEBUG "false"
ENV SLUG ""
ENV TIMEOUT 60000
ENV WAIT_BEFORE_TEST 30
ENV WEB_DRIVER_LOG_LEVEL "silent"

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
  unzip \
  wget \
  xvfb

#===============
# Google Chrome
#===============
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install \
    google-chrome-stable \
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/*

#==================
# Chrome webdriver
#==================
ENV CHROME_DRIVER_VERSION 2.20
RUN wget --no-verbose -O /tmp/chromedriver_linux64.zip http://chromedriver.storage.googleapis.com/$CHROME_DRIVER_VERSION/chromedriver_linux64.zip \
  && rm -rf /opt/selenium/chromedriver \
  && unzip /tmp/chromedriver_linux64.zip -d /opt/selenium \
  && rm /tmp/chromedriver_linux64.zip \
  && mv /opt/selenium/chromedriver /opt/selenium/chromedriver-$CHROME_DRIVER_VERSION \
  && chmod 755 /opt/selenium/chromedriver-$CHROME_DRIVER_VERSION \
  && ln -fs /opt/selenium/chromedriver-$CHROME_DRIVER_VERSION /usr/bin/chromedriver

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
