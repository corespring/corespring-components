fs = require "fs"
templates = require "./lib/templates"
components = require "./lib/components"
_ = require "lodash"
utils = require "./lib/utils"
testClient = require "./lib/test-client"

local = false

module.exports = (grunt) ->

  local = grunt.option('local') isnt false
  GLOBAL.baseUrl = (if grunt.option('baseUrl') then grunt.option('baseUrl') else "http://localhost:9000")

  corespringCore = grunt.option("corespringCore") ||  "../modules/container-client/src/main/resources/container-client/js/corespring/core.js"

  grunt.log.writeln(corespringCore)
  commonConfig =
    app: "."
    componentPath: grunt.config("componentPath") || "components"
    corespringCore: corespringCore

  localWebdriverOptions =
    desiredCapabilities:
      browserName: 'chrome'

  sauceLabsWebdriverOptions =
    host: 'ondemand.saucelabs.com',
    port: 80,
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    desiredCapabilities:
      platform: 'OS X 10.8',
      browserName: 'chrome',
      'tunnel-identifier': 'regression-tunnel'

  config =

    pkg: grunt.file.readJSON('package.json')
    common: commonConfig

    webdriver:
      options: if local then localWebdriverOptions else sauceLabsWebdriverOptions
      regression:
        tests: ['components/**/regression/*.js']

    jasmine:
      unit:
        src: '<%= grunt.config("testClient.wrapped") %>'
        options:
          keepRunner: true
          vendor: [
            '<%= common.app %>/bower_components/lodash/dist/lodash.js',
            '<%= common.app %>/bower_components/headjs/dist/1.0.0/head.js',
            '<%= common.app %>/bower_components/jquery/dist/jquery.js',
            '<%= common.app %>/bower_components/angular/angular.js',
            '<%= common.app %>/bower_components/angular-mocks/angular-mocks.js',
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
      options: 
        jshintrc: '.jshintrc'
      main: ['<%= common.componentPath %>/**/*.js', '!**/*-wrapped.js', '!<%= common.componentPath %>/**/libs/**/*.js']

    watch:
      js:
        files: ['<%= common.componentPath %>/**/*.js']
        tasks: ['jshint:main']

    clean:
      test: ["<%= common.componentPath %>/**/*-wrapped.js"]

    jsbeautifier: 
      files : ["<%= common.componentPath %>/**/*.js"],
      options : 
        js: 
          braceStyle: "collapse",
          breakChainedMethods: false,
          e4x: false,
          evalCode: false,
          indentChar: " ",
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false,
          jslintHappy: false,
          keepArrayIndentation: true,
          keepFunctionIndentation: true,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          spaceBeforeConditional: true,
          spaceInParen: false,
          unescapeStrings: false,
          wrapLineLength: 0
          



  grunt.initConfig(config)

  npmTasks = [
    'grunt-contrib-jasmine',
    'grunt-contrib-clean',
    'grunt-mocha-test',
    'grunt-webdriver',
    'grunt-contrib-watch',
    'grunt-contrib-jshint',
    'grunt-jsbeautifier'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('test', 'test client side js', ['clean:test', 'testserver', 'testclient'])
  grunt.registerTask('testclient', 'test client side js', testClient(grunt))
  grunt.registerTask('testserver', 'test server side js', 'mochaTest')
  grunt.registerTask('default', ['jshint', 'test'])


