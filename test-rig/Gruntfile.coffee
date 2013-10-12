fs = require "fs"
templates = require "./lib/templates"
components = require "./lib/components"
_ = require "lodash"
utils = require "./lib/utils"


module.exports = (grunt) ->

  wrapAndWriteJs = (mode) ->
    (component) ->
      directiveName = utils.directiveName(component.organization, "#{component.name}-#{mode}")
      wrapped = templates.wrapDirective( directiveName, component.client[mode])
      path = "#{component.componentPath}/src/client/#{mode}-wrapped.js"
      fs.writeFileSync(path, wrapped)
      path


  grunt.registerTask 'testclient', 'test client side js', (org, name, type) ->

    fs.writeFileSync("./appDeclaration.js", "console.log('init');\nangular.module('test-app', []);\n")
    grunt.config("appDeclaration", "./appDeclaration.js")

    if !grunt.option("componentPath")
      grunt.fail.warn("No 'componentPath' specified!")
      return

    componentPath = grunt.option("componentPath")
    components.init(componentPath)

    allComps = components.all()
    grunt.log.writeln(this.name + ", " + org + " " + name + " " + type)
    grunt.log.writeln( _.map allComps, (c) -> "#{c.organization}/#{c.name}")

    filterOrg = (comp) -> if org? then comp.organization == org else true
    filterName = (comp) -> if name? then comp.name == name else true

    allComps = _.chain(allComps)
      .filter(filterOrg)
      .filter(filterName).value()

    if allComps.length == 0
      grunt.log.writeln("nothing to test")
      return

    grunt.log.writeln("comps: #{ _.pluck(allComps, 'name')}")

    wrappedRenders = _.map allComps, wrapAndWriteJs("render")
    wrappedConfigures = _.map allComps, wrapAndWriteJs("configure")

    srcPaths = _.union(wrappedRenders,wrappedConfigures)
    grunt.config("wrapped", "#{componentPath}/**/*-wrapped.js")

    specPaths = _.map allComps, (c) ->
      all = ["#{c.componentPath}/test/client/render-test.js",
             "#{c.componentPath}/test/client/configure-test.js"]


      existing = _.filter all, (p) -> fs.existsSync(p)
      existing

    specPaths = _.flatten(specPaths)

    grunt.config("specPath", "#{componentPath}/**/client/*-test.js")
    grunt.task.run("jasmine:unit")

    keepWrapped = !grunt.option("keepWrapped") == false
    grunt.log.writeln("keep wrapped? #{keepWrapped}")
    grunt.task.run("clean:wrapped") if !keepWrapped


  commonConfig =
    app: "."

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig
    jasmine:
      unit:
        src: '<%= grunt.config("wrapped") %>'
        options:
          keepRunner: true
          vendor: [
            '<%= common.app %>/bower_components/angular/angular.js',
            '<%= common.app %>/bower_components/angular-mocks/angular-mocks.js',
            '<%= common.app %>/bower_components/jquery/jquery.js',
            # TODO : how to build out packages like this..
            '<%= common.app %>/bower_components/ckeditor/ckeditor.js',
            '<%= grunt.config("appDeclaration") %>'
          ]
          specs: '<%= grunt.config("specPath") %>'
    clean:
      options:
        force: true
      wrapped: ['<%= grunt.option("componentPath") %>/**/*-wrapped.js']



  grunt.initConfig(config)

  npmTasks = [
    'grunt-contrib-jasmine',
    'grunt-contrib-clean'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('default', ['wrap', 'jasmine:unit'])


