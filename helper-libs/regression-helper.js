RegressionHelper = function(baseUrl) {
  this.getUrl = function(componentType, jsonFile) {
    return baseUrl + '/client/rig/corespring-' + componentType + '/index.html?data=regression_' + jsonFile;
  };
  this.getItemJson = function(componentType, jsonFile) {
    return require('./../components/corespring/' + componentType + '/regression-data/' + jsonFile);
  }
};

module.exports = RegressionHelper;

