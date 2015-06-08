exports.framework = 'angular';
exports.factory = [function() {
  return LayoutConfig;
}];

function LayoutConfig() {
  var config = {};

  this.withContainer = function(value) {
    config.container = value;
    return this;
  };

  this.withItemSelector = function(value) {
    config.itemSelector = value;
    return this;
  };

  this.withNumColumns = function(value) {
    config.numColumns = value;
    return this;
  };

  this.withCellWidth = function(value) {
    config.cellWidth = value;
    return this;
  };

  this.withPaddingBottom = function(value) {
    config.paddingBottom = value;
    return this;
  };

  this.withDistributeSpace = function(value) {
    config.distributeSpace = value;
    return this;
  };

  this.value = function() {
    return config;
  };
}