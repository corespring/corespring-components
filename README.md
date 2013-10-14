# Corespring Components

The default corespring component set.

## Requirements

* bower >= 1.2.7
* node/npm >= 0.10.*

## Running

They are designed to work with a Corespring Container implementation.
See [corespring-container](https://github.com/corespring/corespring-container).


## Developing

TODO...

# Test Rig

This rig runs the component tests.

* Client side tests are run with PhantomJs, tests are written in jasmine
* Server side tests are run with Mocha, tests are written in jasmine


## Usage

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

