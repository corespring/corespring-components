RegressionHelper = {
  getUrl: function(componentType, jsonFile) {
    return 'http://localhost:9000/client/rig/corespring-' + componentType + '/index.html?data=regression_' + jsonFile;
  },
  getItemJson: function(componentType, jsonFile) {
    return require('./../components/corespring/' + componentType + '/regression-data/' + jsonFile);
  }
};

module.exports = RegressionHelper;

