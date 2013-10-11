###
Component Registry
load all the comps to make them available elsewhere in the app.
###

fs = require 'fs'
path = require 'path'
_ = require 'underscore'
reader = require './component-reader'
loadedComponents = {}
loaded = false

Regex = /(.*?)\-(.*)/

isValidOrgName = (n) ->
  return false if !n?
  m = n.match /^[a-z0-9_-]+$/
  m?

###
  Load all available components into the container
###
exports.init = (folder) ->

  if loaded and process.env["NODE_ENV"] == "production"
    throw new Error("already loaded")
  else
    loaded = true

    orgs = _.filter fs.readdirSync(folder), isValidOrgName


    orgsAndComps = _.map orgs, (org) ->
      children = fs.readdirSync( path.join(folder, org) )
      clean = _.filter children, isValidOrgName
      _.map clean, (comp) -> path.join(folder, org, comp)


    flattened = _.flatten orgsAndComps
    loadedComponents = []

    _.each flattened, (p) ->
      reader.fromFolder "./#{p}", (err, def) ->
        loadedComponents.push(def)
    console.log "--> loaded components", _.map(loadedComponents, (c) -> "#{c.organization}/#{c.name}")

exports.loaded = -> loaded
###
Return all loaded components
###
exports.all = -> loadedComponents

exports.defSync = (componentType) ->
  [all, org, name] = componentType.match /(.*?)\-(.*)/

  foundComp = _.find loadedComponents, (def) ->
    def.organization == org and def.name == name

  if foundComp?
    foundComp
  else
    throw new Error("[components] Can't find component: #{componentType}")

###
  Return a component definition for the unique type id
###
exports.def = (componentType, done) ->
  comp = @defSync(componentType)
  done(null, comp)
##
#exports.init = ->
