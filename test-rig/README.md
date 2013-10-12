# Test Rig

This rig runs the component tests

## Usage

    # Test all components
    grunt testclient --componentPath=../components

    # Test components for org
    grunt testclient:corespring --componentPath=../components

    # Test single components for org
    grunt testclient:corespring:multiple-choice --componentPath=../components

    --keepWrapped=true|false (default false) - keep the generated js files

## Server side

Todo..

## Client side

Due to how components are defined, we need to wrap the definitions and then run those generated files in the tests. look for *-wrapped.js files.

