var fs = require("fs"),
 _ = require("lodash"),
 exec = require("child_process").exec;

module.exports = function(path, grunt){
  var commitHash, currentBranch, run;
  
  run = function(cmd, done, valueIfError) {

    exec(cmd, function(err, stdout, stderr) {
      if (err != null){
       if(valueIfError) {
        done(null, valueIfError);
       } else {
        grunt.fail.fatal('Error runnning cmd:' + err);
       }
      } else {
        done(null, stdout.replace('\n', ''));
      }
    });
  };
  
  currentBranch = function(done) {
    run('git symbolic-ref -q --short HEAD', done, 'unknown-branch');
  };
  
  commitHash = function(done) {
    run('git rev-parse --short HEAD', done, 'unknown-hash');
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