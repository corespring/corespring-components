path = require 'path'
fs = require 'fs'
coffeeScript = require 'coffee-script'
_ = require 'lodash'

class ClientDef
  constructor: (@render, @configure) ->

class ComponentDef
  constructor: (@organization, @name, @icon, @client, @server, @pkg, @componentPath) ->
    @componentType = "#{@organization}-#{@name}"

class Library
  constructor: (@organization, @name, @pkg, @client, @server, @componentPath) ->
    @componentType = "#{@organization}-#{@name}"
    @isLibrary = true

class LibrarySource
  constructor: (@name, @src) ->


# private
orgName = (p) ->
  dir = path.dirname(p)
  basename = path.basename(dir)
  basename

icon = (p) ->
  iconPath = path.join(p, 'icon.png')
  fs.readFileSync( iconPath )

componentName = (p) -> path.basename(p)

load = (folders ...) ->
  p = path.join.apply(null, folders)

  if fs.existsSync("#{p}.js")
    fs.readFileSync("#{p}.js", 'utf8')
  else if fs.existsSync("#{p}.coffee")
    coffeeSrc = fs.readFileSync("#{p}.coffee", 'utf8')
    js = coffeeScript.compile coffeeSrc, { bare : true }
    js
  else
    throw new Error("Can't find js or coffee at this path: #{p}")

clientDef = (p) ->
  renderJs = load( p, 'src', 'client', 'render' )
  configJs = load(p, 'src', 'client', 'configure')
  new ClientDef(renderJs, configJs)

###
# TODO: calling 'require' - requires that dependencies are available at call site or in a parent folder
# This isn't the case for the test-rig at the moment
requireServer = (folders ...) ->
  p = path.join.apply(null, folders)

  #if fs.existsSync(p)
  #  require path.join(process.cwd(), p)
  #else
  render : (q) -> q
  respond: (question, answer, settings) -> { message: "No respond function defined - please implement one for: #{p}" }

serverDef = (p) -> requireServer(p, 'src', 'server')
###

pkg = (p) ->
  require path.join( process.cwd(), p, 'package.json')

###
  Parse a folder structure into a component definition
###
exports.fromFolder = (p, done) ->

  throw new Error("You need to specify a callback for fromFolder") if !done?

  done("[component-reader] Folder: #{p} doesn't exist") if !fs.existsSync(p)

  pk = pkg(p)
  org = orgName(p)
  comp = componentName(p)

  if pk.isLibrary

    fileToLib = (f) ->
      fileName = path.basename(f, ".js")
      fileName = if fileName == "index" then comp else fileName
      console.log(fileName)
      src = fs.readFileSync(path.join(p, "src", "client", f))
      new LibrarySource(fileName, src)

    loadLibraries = ->
      files = fs.readdirSync path.join(p, "src", "client")

      jsFiles = _.chain(files)
        .filter((f) -> path.extname(f) == ".js")
        .map( fileToLib )
        .value()

      jsFiles

    clientLibraries = loadLibraries()

    def = new Library(org, comp, pk, clientLibraries, [], p)
    done(null, def)
  else
    ico = icon(p)
    cl = clientDef(p)
    srvr = {} #serverDef(p)
    pk = pkg(p)
    def = new ComponentDef(org, comp, ico, cl, srvr, pk, p )
    done(null, def)

