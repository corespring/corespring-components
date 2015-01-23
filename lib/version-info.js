var fs = require("fs"),
 _ = require("lodash"),
 exec = require("child_process").exec;

module.exports = function(path, grunt){
  var commitHash, currentBranch, run;
  
  run = function(cmd, done) {
    return exec(cmd, function(err, stdout, stderr) {
      if (err != null) {
        grunt.fail.fatal(err);
      }
      done(null, stdout.replace('\n', ''));
      return null;
    });
  };
  
  currentBranch = function(done) {
    return run('git symbolic-ref -q --short HEAD', done);
  };
  
  commitHash = function(done) {
    return run('git rev-parse --short HEAD', done);
  };
  return function() {
    var done;
    done = this.async();
    currentBranch(function(err, branch) {
      commitHash(function(err, hash) {
        var json, out;
        out = {
          branch: branch,
          commit_hash: hash,
          date: new Date().toString()
        };
        json = JSON.stringify(out, null, '  ');
        grunt.log.debug(json);
        grunt.file.write(path, json);
        done();
      });
    });
  };
};