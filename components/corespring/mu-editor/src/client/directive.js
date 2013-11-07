// module: corespring.mu-editor


var def = [
  function () {
    return {
      require: '?ngModel',
      link: function (scope, elm, attr, ngModel) {

        $(elm).markItUp();
        if (!ngModel) return;
//
//        ck.on('pasteState', function () {
//          return scope.$apply(function () {
//            ngModel.$setViewValue(ck.getData());
//          });
//        });
//        ngModel.$render = function (value) {
//          ck.setData(ngModel.$viewValue);
//        };
      }
    };
  }
];


exports.framework = "angular";
exports.directive = { name: "muEditor", directive: def };