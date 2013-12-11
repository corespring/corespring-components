fs = require "fs"
templates = require "./lib/templates"
components = require "./lib/components"
_ = require "lodash"
utils = require "./lib/utils"
testClient = require "./lib/test-client"


module.exports = (grunt) ->

  corespringCore = grunt.option("corespringCore") ||  "../modules/container-client/src/main/resources/container-client/js/corespring/core.js"

  grunt.log.writeln(corespringCore)
  commonConfig =
    app: "."
    componentPath: grunt.config("componentPath") || "components"
    corespringCore: corespringCore

  config =

    pkg: grunt.file.readJSON('package.json')
    common: commonConfig

    jasmine:
      unit:
        src: '<%= grunt.config("testClient.wrapped") %>'
        options:
          keepRunner: true
          vendor: [
            '<%= common.app %>/bower_components/lodash/dist/lodash.js',
            '<%= common.app %>/bower_components/angular/angular.js',
            '<%= common.app %>/bower_components/angular-mocks/angular-mocks.js',
            '<%= common.app %>/bower_components/jquery/jquery.js',
            # TODO : how to build out packages like this..
            '<%= common.app %>/bower_components/ckeditor/ckeditor.js',
            '<%= common.app %>/bower_components/saxjs/lib/sax.js',
            '<%= common.corespringCore %>',
            '<%= grunt.config("testClient.appDeclaration") %>'
          ]
          specs: '<%= grunt.config("testClient.specPath") %>'

    # Our custom test client
    testClient:
      componentPath: commonConfig.componentPath

    mochaTest:
      test:
        options:
          reporter: 'spec'
        src: ['<%= common.componentPath %>/**/test/server/**/*-test.js']

    jshint:
      jshintrc: '.jshintrc'
      main: ['<%= common.componentPath %>/**/*.js']

    watch:
      js:
        files: ['<%= common.componentPath %>/**/*.js']
        tasks: ['jshint:main']

    clean:
      test: ["<%= common.componentPath %>/**/*-wrapped.js"]


  grunt.initConfig(config)

  npmTasks = [
    'grunt-contrib-jasmine',
    'grunt-contrib-clean',
    'grunt-mocha-test',
    'grunt-contrib-watch',
    'grunt-contrib-jshint'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('test', 'test client side js', ['clean:test', 'testserver', 'testclient'])
  grunt.registerTask('testclient', 'test client side js', testClient(grunt))
  grunt.registerTask('testserver', 'test server side js', 'mochaTest' )
  grunt.registerTask('default', ['wrap', 'jasmine:unit'])


