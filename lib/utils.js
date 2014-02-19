var _ = require( "lodash" );

_.mixin({
    capitalize: function(string) {
      return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    }
});

var capitalize = function(n) {
  var capped;

  capped = _.map(n.split("-"), function(s) {
    return _.capitalize(s);
  });
  return capped.join("");
};

exports.directiveName = function(org, name) {
  return "" + org + (capitalize(name));
};

exports.serviceName = function(name) { return capitalize(name); };