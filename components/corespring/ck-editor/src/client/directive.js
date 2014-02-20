// module: corespring.ck-editor
/* global CKEDITOR */

var def = [
  '$log',
  function($log) {
    var ck;
    return {
      require: '?ngModel',
      link: function(scope, elm, attr, ngModel) {

        var initCk = function() {

          ck = CKEDITOR.replace(elm[0], {
            toolbar: [
              ['Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo', 'Smiley'],
              ['Bold', 'Italic', 'Underline'],
              ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
              ['Image']
            ],

            removeButtons: 'About',
            height: '100px'
          });

          ck.on('pasteState', function() {
            return scope.$apply(function() {
              ngModel.$setViewValue(ck.getData());
            });
          });

          ngModel.$render = function(value) {
            if (ck.getData() !== ngModel.$viewValue) {
              ck.setData(ngModel.$viewValue);
            }
          };
        };

        if (!ngModel) {
          return;
        }

        if (!CKEDITOR.replace) {
          CKEDITOR.domReady(function(event) {
            initCk();
          });
        } else {
          initCk();
        }
      }
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "ckEditor",
  directive: def
};
