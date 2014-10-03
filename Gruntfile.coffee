fs = require "fs"
templates = require "./lib/templates"
components = require "./lib/components"
_ = require "lodash"
utils = require "./lib/utils"
testClient = require "./lib/test-client"

module.exports = (grunt) ->

  corespringCore = grunt.option("corespringCore") ?  "../modules/container-client/src/main/resources/container-client/js/corespring/core.js"

  commonConfig =
    app: "."
    componentPath: grunt.config("componentPath") ? "components"
    corespringCore: corespringCore

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig

    regressionTestRunner:
      options:
        tests: ['components/**/regression/*.js']
      dev:
        baseUrl: "http://localhost:9000"
        defaultTimeout: 2000
      saucelabs:
        defaultTimeout: 4000
        local: false
        #If local is false we have to provide the user/key for saucelabs
        user: process.env.SAUCE_USERNAME
        key: process.env.SAUCE_ACCESS_KEY
        baseUrl: 'http://corespring-container-devt.herokuapp.com'

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

    less:
      development:
        expand: true
        src: 'components/**/*.less'
        ext: '.less.css'
        flatten: false
      production:
        options:
          cleancss: true
        expand: true
        src: 'components/**/*.less'
        ext: '.less.min.css'
        flatten: false

    watch:
      less:
        files: ['<%= common.componentPath %>/**/*.less']
        tasks: ['less:development']
      js:
        files: ['<%= common.componentPath %>/**/*.js']
        tasks: ['jshint:main']

    clean:
      test: ["<%= common.componentPath %>/**/*-wrapped.js"]
      production : ["<%= common.app %>/node_modules", "<%= common.app %>/bower_components"]

    jsbeautifier:
      files : ["<%= common.componentPath %>/**/*.js"],
      options :
        js:
          braceStyle: "collapse"
          breakChainedMethods: false
          e4x: false
          evalCode: false
          indentChar: " "
          indentLevel: 0
          indentSize: 2
          indentWithTabs: false
          jslintHappy: false
          keepArrayIndentation: true
          keepFunctionIndentation: true
          maxPreserveNewlines: 10
          preserveNewlines: true
          spaceBeforeConditional: true
          spaceInParen: false
          unescapeStrings: false
          wrapLineLength: 0

  grunt.initConfig(config)

  npmTasks = [
    'grunt-contrib-jasmine'
    'grunt-contrib-clean'
    'grunt-mocha-test'
    'grunt-contrib-watch'
    'grunt-contrib-less'
    'grunt-contrib-jshint'
    'grunt-jsbeautifier',
    'regression-test-runner'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('buildcomponents', ['less:production', 'clean:test', 'clean:production'])
  grunt.registerTask('regression', ['regressionTestRunner:dev'])
  grunt.registerTask('test', 'test client side js', ['clean:test', 'testserver', 'testclient'])
  grunt.registerTask('testclient', 'test client side js', testClient(grunt))
  grunt.registerTask('testserver', 'test server side js', 'mochaTest')
  grunt.registerTask('default', ['jshint', 'test'])
