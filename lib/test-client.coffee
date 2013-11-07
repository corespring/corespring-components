fs = require "fs"
templates = require "./templates"
components = require "./components"
_ = require "lodash"
utils = require "./utils"
globule = require "globule"


wrapAndWriteJs = (mode) ->
  (component) ->
    directiveName = utils.directiveName(component.organization, "#{component.name}-#{mode}")
    wrapped = templates.wrapAngular( "test-app", directiveName, component.client[mode])

    path = "#{component.componentPath}/src/client/#{mode}-wrapped.js"
    fs.writeFileSync(path, wrapped)
    path

wrapAndWriteLibJs = (lib) ->
    _.each lib.client, (cl) ->
      serviceName = utils.serviceName(cl.name)
      wrapped = templates.wrapAngular( "test-app", serviceName, cl.src)
      path = "#{lib.componentPath}/src/client/#{serviceName}-wrapped.js"
      fs.writeFileSync(path, wrapped)
      path

cleanWrapped = (path, log) ->
  ->
    log("-----> cleanWrapped -------> path: #{path}")

    fs.unlinkSync("./appDeclaration.js")

    filepaths = globule.find "#{path}/**/*-wrapped.js"

    log("found files: #{filepaths}")

    _.each filepaths, (p) ->
      log("removing: #{p}")
      fs.unlinkSync(p)


writeComponentJs = (grunt, comps) ->

  grunt.log.writeln( _.map comps, (c) -> "#{c.organization}/#{c.name}")

  if comps.length == 0
    grunt.log.writeln("nothing to test")
    return

  grunt.log.writeln("comps: #{ _.pluck(comps, 'name')}")

  _.each comps, wrapAndWriteJs("render")
  _.each comps, wrapAndWriteJs("configure")

writeLibJs = (grunt, libs) ->

  grunt.log.writeln(" ----------libs: write lib js")

  if libs.length == 0
    grunt.log.writeln "no libs"
    return

  grunt.log.writeln("libs: #{ _.pluck(libs, 'name')}")

  _.each libs, wrapAndWriteLibJs


###
Run the client side tests
###
module.exports = (grunt) ->


  (org,name,type) ->

    fs.writeFileSync("./appDeclaration.js", templates.preroll() )
    grunt.config("testClient.appDeclaration", "./appDeclaration.js")

    if !grunt.config("testClient.componentPath")
      grunt.fail.warn("No 'componentPath' specified!")
      return

    componentPath = grunt.config("testClient.componentPath")

    grunt.registerTask("cleanWrapped", cleanWrapped(componentPath, grunt.log.writeln))
    #grunt.task.run("cleanWrapped")
    #cleanWrapped(componentPath, grunt.log.writeln)()

    components.init(componentPath)

    filterOrg = (comp) -> if org? then comp.organization == org else true
    filterName = (comp) -> if name? then comp.name == name else true

    allComps = _.chain(components.allComponents()).filter(filterOrg).filter(filterName).value()

    writeComponentJs(grunt, allComps)

    allLibs = _.chain(components.allLibraries()).filter(filterOrg).filter(filterName).value()

    writeLibJs(grunt, allLibs)

    grunt.config("testClient.wrapped", "#{componentPath}/**/*-wrapped.js")

    grunt.config("testClient.specPath", "#{componentPath}/**/client/*-test.js")


    grunt.task.run("jasmine:unit")

    keepWrapped = !grunt.option("keepWrapped") == false
    grunt.log.writeln("keep wrapped? #{keepWrapped}")
    grunt.task.run("cleanWrapped") unless keepWrapped
