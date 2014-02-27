/* global KhanUtil */

var def = [
  '$log',
  function ($log) {

    return {
      scope: {
        model: "=ngmodel"
      },
      template: "<div><div box-and-whiskers-graph='' ngModel='model.graphs[0]'/>" +
        "<div box-and-whiskers-graph='' ngModel='model.graphs[1]'/></div>",
      link: function (scope, elm, attr, ngModel) {
      }
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "boxAndWhiskers",
  directive: def
};
