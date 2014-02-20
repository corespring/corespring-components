var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {


      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          scope.lines = dataAndSession.data.model.lines;
        },

        getSession: function() {
          return {
            answers: ""
          };
        },

        setResponse: function(response) {},

        setMode: function(newMode) {},

        reset: function() {},

        isAnswerEmpty: function() {},

        answerChangedHandler: function(callback) {},

        editable: function(e) {}
      };

      scope.trust = function(line) {
        return $sce.trustAsHtml(line);
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: [
        '<div class="view-numbered-lines">',
        '  <ol>',
        '    <li ng-repeat="line in lines"  ng-bind-html="trust(line)"></li>',
        '    </li>',
        '  </ol>',
        '</div>'
      ].join('')
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
