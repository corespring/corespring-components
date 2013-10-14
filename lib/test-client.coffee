fs = require "fs"
templates = require "./templates"
components = require "./components"
_ = require "lodash"
utils = require "./utils"
globule = require "globule"


wrapAndWriteJs = (mode) ->
  (component) ->
    directiveName = utils.directiveName(component.organization, "#{component.name}-#{mode}")
    wrapped = templates.wrapDirective( directiveName, component.client[mode])
    path = "#{component.componentPath}/src/client/#{mode}-wrapped.js"
    fs.writeFileSync(path, wrapped)
    path

cleanWrapped = (path, log) ->
  ->
    fs.unlinkSync("./appDeclaration.js")

    filepaths = globule.find "#{path}/**/*-wrapped.js"
    _.each filepaths, (p) ->
      log("removing: #{p}")
      fs.unlinkSync(p)

###
Run the client side tests
###
module.exports = (grunt) ->

  (org,name,type) ->

    fs.writeFileSync("./appDeclaration.js", "console.log('init');\nangular.module('test-app', []);\n")
    grunt.config("testClient.appDeclaration", "./appDeclaration.js")

    if !grunt.config("testClient.componentPath")
      grunt.fail.warn("No 'componentPath' specified!")
      return

    componentPath = grunt.config("testClient.componentPath")
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
    grunt.config("testClient.wrapped", "#{componentPath}/**/*-wrapped.js")

    specPaths = _.map allComps, (c) ->
      all = ["#{c.componentPath}/test/client/render-test.js",
             "#{c.componentPath}/test/client/configure-test.js"]


      existing = _.filter all, (p) -> fs.existsSync(p)
      existing

    specPaths = _.flatten(specPaths)

    grunt.config("testClient.specPath", "#{componentPath}/**/client/*-test.js")

    grunt.registerTask("cleanWrapped", cleanWrapped(componentPath, grunt.log.writeln))

    grunt.task.run("jasmine:unit")

    keepWrapped = !grunt.option("keepWrapped") == false
    grunt.log.writeln("keep wrapped? #{keepWrapped}")
    grunt.task.run("cleanWrapped") unless keepWrapped
