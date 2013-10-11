fs = require "fs"
templates = require "./lib/templates"
components = require "./lib/components"
_ = require "lodash"
utils = require "./lib/utils"


module.exports = (grunt) ->

  wrapAndWriteJs = (mode) ->
    (component) ->
      grunt.log.writeln(component.name)
      grunt.log.writeln(component.organization)
      directiveName = utils.directiveName(component.organization, "#{component.name}-#{mode}")
      grunt.log.writeln(directiveName)

      wrapped = templates.wrapDirective( directiveName, component.client[mode])
      path = "#{component.componentPath}/src/client/#{mode}-wrapped.js"
      fs.writeFileSync(path, wrapped)
      path
  ###
  unless grunt.option("componentPath")?
    console.log "You must specify a 'componentPath'"
    return
  ###

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


  grunt.initConfig(config)

  npmTasks = [
    'grunt-contrib-jasmine'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('default', ['wrap', 'jasmine:unit'])

  grunt.registerTask 'testclient', 'test client side js', (org, name, type) ->
    if arguments.length != 3
      grunt.log.writeln("You need to specify org:name:type")
      return


    fs.writeFileSync("./appDeclaration.js", "console.log('init');\nangular.module('test-app', []);\n")
    grunt.config("appDeclaration", "./appDeclaration.js")

    componentPath = grunt.option("componentPath")
    components.init(componentPath)

    allComps = components.all()
    grunt.log.writeln(this.name + ", " + org + " " + name + " " + type)
    grunt.log.writeln( _.map allComps, (c) -> c.componentPath )

    #allComps = _.filter allComps, (c) -> c.name == name

    wrappedRenders = _.map allComps, wrapAndWriteJs("render")
    wrappedConfigures = _.map allComps, wrapAndWriteJs("configure")

    srcPaths = _.union(wrappedRenders,wrappedConfigures)
    grunt.log.writeln(srcPaths)
    grunt.config("wrapped", "#{componentPath}/**/*-wrapped.js")

    specPaths = _.map allComps, (c) ->
      all = ["#{c.componentPath}/test/client/render-test.js",
             "#{c.componentPath}/test/client/configure-test.js"]


      existing = _.filter all, (p) -> fs.existsSync(p)
      existing

    specPaths = _.flatten(specPaths)

    grunt.log.writeln(specPaths)
    grunt.config("specPath", "#{componentPath}/**/client/*-test.js")
    grunt.task.run("jasmine:unit")

    ### read js
    path = "#{componentPath}/#{org}/#{name}/src/client/#{type}.js"
    contents = fs.readFileSync(path)
    directiveName = "corespringMultipleChoice"
    wrapped = templates.wrapDirective("#{directiveName}", contents)
    grunt.log.writeln wrapped
    wrappedFilePath = path.replace(".js", "-wrapped.js")
    fs.writeFileSync(wrappedFilePath, wrapped)
    grunt.config("wrapped", wrappedFilePath)
    grunt.config("specPath", "#{componentPath}/#{org}/#{name}/test/client/#{type}-test.js")
    grunt.log.writeln grunt.config("wrapped")
    grunt.task.run("jasmine:unit")
    ###


