# Corespring Components

The default corespring component set.

## Requirements

* bower >= 1.2.7
* node/npm >= 0.10.*
* grunt

## Running

They are designed to work with a Corespring Container implementation.
See [corespring-container](https://github.com/corespring/corespring-container).


## Developing

TODO...

# Test Rig

This rig runs the component tests.

* Client side tests are run with PhantomJs, tests are written in jasmine
* Server side tests are run with Mocha, tests are written in jasmine

### Env vars

#### corepringCore
This is the path to the corespring container [core.js](https://github.com/corespring/corespring-container/blob/master/modules/container-client/src/main/resources/container-client/js/corespring/core.js) file that contains the global `corespring` object. If you are running the components from within the corespring-container you don't need to change this path as it defaults to the right file. If not the path needs to be a relative path to the `core.js` file.

You can set this on the command line like so: 

    grunt test --corespringCore=.....

## Usage

First ensure that you have all the dependencies installed:
    
    sudo npm install grunt-cli
    npm install
    bower install


If you want to run the functional tests, then ensure that you have a version of
[corespring-container](https://github.com/corespring/corespring-container) running on your local machine at port 9000.
Alternatively, you can run the regression tests against a different url by passing the `--baseUrl` argument.
    
You can use the following test commands:

    # Test all components (server side and client side)
    grunt test

    # Test server side
    grunt testserver

    # Test clientside
    grunt testclient

    # Test comps for single org
    grunt testclient:corespring

    # Test single components for org
    grunt testclient:corespring:multiple-choice --componentPath=../components

    ## Options
    --componentPath=path_to_comps (default: ../components) - the path to the components folder
    --keepWrapped=true|false (default: false) - keep the generated js files

    # Run functional tests
    grunt regression

    # Run functional tests against SauceLabs with a non-local base URL
    # Make sure SAUCE_USERNAME and SAUCE_ACCESS_KEY are set in your env  
    grunt regression --local=false --baseUrl=http://corespring-container-devt.herokuapp.com
    
    ## Options
    --browserName=firefox - passed to webdriverjs
    --version="10.2" - passed to webdriverjs
    --platform=windows - passed to webdriverjs
