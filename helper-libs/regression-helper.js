module.exports = function(baseUrl) {
  this.getUrl = function(componentType, jsonFile) {
    var url = baseUrl + '/client/rig/corespring-' + componentType + '/index.html?data=regression_' + jsonFile;
    console.log('[RegressionHelper] getUrl: ', url);
    return url;
  };

  this.getItemJson = function(componentType, jsonFile) {
    return require('./../components/corespring/' + componentType + '/regression-data/' + jsonFile);
  };
};

