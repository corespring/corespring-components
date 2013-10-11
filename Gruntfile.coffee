module.exports = (grunt) ->

  commonConfig:
    info: "?"

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig
    jasmine:
      unit:
        src: '<%= common.app %>/js/**/*.js',
        options:
          keepRunner: true
          vendor: [
            '<%= common.app %>/bower_components/angular/angular.js',
            '<%= common.app %>/bower_components/angular-mocks/angular-mocks.js',
            '<%= common.app %>/bower_components/jquery/jquery.js',
          ]
          specs: '<%= common.test %>/test/client/**/*-test.js'


  grunt.initConfig(config)

  npmTasks = [
    'grunt-shell',
    'grunt-contrib-jasmine'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('test', ['jasmine:unit'])
