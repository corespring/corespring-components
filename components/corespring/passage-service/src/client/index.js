/* global com */
var def = [
  '$http',
  '$timeout',
  function($http, $timeout) {
    return {
      search: function(query, callback) {
        $http.post('http://localhost:9001/api/v2/passages/search?access_token=demo_token', query).success(function(data) {
          callback(undefined, data);
        });
      }
    }
  }
];

exports.framework = "angular";
exports.service = def;