var def = function () {
  return {
    restrict: "E",
    require: '^pointinteraction',
    scope: {},
    compile: function (element, attrs, transclude) {
      element.attr('hidden', '');
      var locked = element.parent()[0].attributes.getNamedItem('locked') ? true : false;
      return function (scope, element, attrs, PointCtrl) {
        var coords = element[0].innerHTML.split(",");
        if (coords.length == 2) {
          var point = {x: coords[0], y: coords[1]};
          if (attrs.color) point = _.extend(point, {color: attrs.color})
          var points = []
          if (PointCtrl.getInitialParams() && PointCtrl.getInitialParams().points) {
            points = PointCtrl.getInitialParams().points
          }
          points.push(point)
          PointCtrl.setInitialParams({ points: points })
        } else {
          throw "each point must contain x and y coordinate separated by a comma";
        }
      };
    }
  }
};


exports.framework = "angular";
exports.directive = { name: "graphpoint", directive: def };