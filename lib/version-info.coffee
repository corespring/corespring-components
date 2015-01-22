fs = require "fs"
_ = require "lodash"
exec = require("child_process").exec






module.exports = (grunt) ->

  run = (cmd, done) ->
    exec cmd, (err, stdout, stderr) ->
      grunt.fail.fatal(err) if err?
      done(null, stdout.replace('\n', ''))
      null

  currentBranch = (done) -> run 'git symbolic-ref -q --short HEAD', done 

  commitHash = (done) -> run 'git rev-parse --short HEAD', done 

  () ->

    done = @async()
    
    currentBranch (err, branch) ->      
      commitHash (err, hash) ->

        out = 
          branch: branch
          commit_hash: hash
          date: new Date().toString()

        json = JSON.stringify(out, null, '  ')
        grunt.log.debug(json)
        grunt.file.write('version-info.json', json)
        done()
