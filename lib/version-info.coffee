fs = require "fs"
_ = require "lodash"
exec = require("child_process").exec


###
Run the client side tests
###
module.exports = (grunt) ->

  () ->
    grunt.log.debug('------------')
    commit = '?'
    exec 'git rev-parse head', (err, stdout, stderr) ->
      commit = stdout
      grunt.log.debug('commit: ', commit)
      grunt.file.write('version-info.json', commit)

