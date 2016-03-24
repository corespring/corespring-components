fs = require 'fs'
templates = require './lib/templates'
components = require './lib/components'
_ = require 'lodash'
utils = require './lib/utils'
testClient = require './lib/test-client'
writeVersionInfo = require('./lib/version-info')



module.exports = (grunt) ->

  runOnSauceLabs = grunt.option('sauceLabs') or false
  sauceUser = grunt.option('sauceUser') or process.env.SAUCE_USERNAME
  sauceKey = grunt.option('sauceKey') or process.env.SAUCE_ACCESS_KEY
  baseUrl = grunt.option('baseUrl') or 'http://localhost:9000'

  if(runOnSauceLabs)
    grunt.log.debug("sauce user: #{sauceUser}")
    grunt.log.debug("sauce key: #{sauceKey}")
    grunt.log.debug("baseUrl: #{baseUrl}")
    grunt.fail.fatal('saucelabs error - you must define both user and key') if( (sauceUser and !sauceKey) or (!sauceUser and sauceKey))
    grunt.fail.fatal('saucelabs error - you must use a remote url as the base url') if(sauceUser and baseUrl == 'http://localhost:9000')

  getTimeout = ->
    grunt.option('timeout') or 10000

  getDesiredCapabilities = ->
    capabilities = 
      browserName: grunt.option('browserName') || 'firefox'
    
    browserVersion = grunt.option('browserVersion') || ''
    capabilities.version = browserVersion if browserVersion
    platform = grunt.option('platform') || ''
    capabilities.platform = platform if platform
    capabilities.timeoutInSeconds = getTimeout() / 1000
    capabilities.defaultTimeout = getTimeout()
    capabilities.waitforTimeout = getTimeout()
    capabilities.name = grunt.option('sauceJob') || 'components-regression-test'
    capabilities.recordVideo = grunt.option('sauceRecordVideo') || false
    capabilities.recordScreenshots = grunt.option('sauceRecordScreenshots') || false
    capabilities

  getWebDriverOptions = ->
    basic = 
      getUrl: (componentType, jsonFile) ->
        url = "#{baseUrl}/client/rig/corespring-#{componentType}/index.html?data=regression_#{jsonFile}"
        grunt.log.debug('getUrl: ', url)
        url
      getItemJson: (componentType, jsonFile) -> require "./components/corespring/#{componentType}/regression-data/#{jsonFile}"
      baseUrl: baseUrl
      bail: grunt.option('bail') || true
      grep: grunt.option('grep')
      timeoutInSeconds: getTimeout() / 1000
      defaultTimeout: getTimeout()
      waitforTimeout: getTimeout()
      # see: http://webdriver.io/guide/getstarted/configuration.html silent|verbose|command|data|result
      logLevel: grunt.option('webDriverLogLevel') || 'silent'
      desiredCapabilities: getDesiredCapabilities()
      
    sauce =
      host: 'ondemand.saucelabs.com' 
      port: 80 
      user: sauceUser 
      key: sauceKey 

    if(runOnSauceLabs)
      _.merge(basic, sauce)
    else 
      basic

  corespringCore = grunt.option('corespringCore') ?  '../modules/container-client/src/js/corespring'

  commonConfig =
    app: '.'
    componentPath: grunt.config('componentPath') ? 'components'
    corespringCore: corespringCore

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig

    webdriver:
      options: getWebDriverOptions()

      dev: 
        tests: ["components/#{'**/' + grunt.option('component') + '/**' or '**'}/regression/*.js"]

    jasmine:
      unit:
        src: '<%= grunt.config("testClient.wrapped") %>'
        options:
          keepRunner: true
          vendor: [
            '<%= common.app %>/bower_components/lodash/dist/lodash.js'
            '<%= common.app %>/bower_components/headjs/dist/1.0.0/head.js'
            '<%= common.app %>/bower_components/jquery/dist/jquery.js'
            '<%= common.app %>/bower_components/angular/angular.js'
            '<%= common.app %>/bower_components/angular-sanitize/angular-sanitize.js'
            '<%= common.app %>/bower_components/angular-ui-select/dist/select.js'
            '<%= common.app %>/bower_components/angular-mocks/angular-mocks.js'
            '<%= common.app %>/bower_components/saxjs/lib/sax.js'
            '<%= common.corespringCore %>/core.js'
            '<%= common.corespringCore %>/lodash-mixins.js'
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
        src: ["<%= common.componentPath %>/**/#{grunt.option('component') or '**'}/test/server/*-test.js"]

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
      test: ['<%= common.componentPath %>/**/*-wrapped.js']
      production : ['<%= common.app %>/node_modules', '<%= common.app %>/bower_components']

    jsbeautifier:
      files : ['<%= common.componentPath %>/**/*.js'],
      options :
        js:
          braceStyle: 'collapse'
          breakChainedMethods: false
          e4x: false
          evalCode: false
          indentChar: ' '
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
    'grunt-webdriver'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.loadTasks('tasks')
  grunt.registerTask('regression', ['webdriver:dev'])
  grunt.registerTask('test', 'test client side js', ['clean:test', 'testserver', 'testclient'])
  grunt.registerTask('testClientRunner', 'test client side js', testClient(grunt))
  grunt.registerTask('testclient', 'test client side js', ['clean:test', 'testClientRunner'])
  grunt.registerTask('testserver', 'test server side js', 'mochaTest')
  grunt.registerTask('default', ['jshint', 'test'])
  grunt.registerTask('version-info', writeVersionInfo('components/version-info.json', grunt))
  grunt.registerTask('build', ['less', 'clean:test', 'version-info', 'clean:production'])
