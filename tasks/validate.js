/**
 * Grunt task which validates a provided component JSON file against the schema.json file for each component (if
 * present).
 */

var grunt = require('grunt');
var _ = require("lodash");
var jsonFile = require('jsonfile');
var tv4 = require('tv4');

function validate() {

  var PASS = 0;
  var FAIL = 1;

  function getSchema(componentType, callback) {

    function getSchemaPath(componentType) {
      var match = componentType.match(/(.*?)-(.*)/);
      var orgAndComponent = {
        org: match[1],
        component: match[2]
      };
      return "components/" + orgAndComponent.org + "/" + orgAndComponent.component + "/schema.json";
    }

    try {
      return jsonFile.readFileSync(getSchemaPath(componentType));
    } catch (e) {
      console.log('Warning: No JSON schema found for ' + componentType);
      return undefined;
    }
  }


  var file = grunt.option('file');
  var itemJson = jsonFile.readFileSync(file);

  var results = _.map(itemJson.item.components, function(component, id) {
    var componentType = component.componentType;
    var schema = getSchema(componentType);
    if (schema) {
      if (!tv4.validate(component, schema)) {
        console.log("Error validating component '" + id + "'");
        console.log(tv4.error);
        return FAIL;
      }
    }
    return PASS;
  });

  if (_.contains(results, FAIL)) {
    grunt.fail.fatal("JSON was not valid");
  }
}

grunt.registerTask('validate', 'Validates the JSON for a provided component file', validate);