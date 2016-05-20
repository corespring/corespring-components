var main = ['$compile',
  function($compile) {

    var MAX_WIDTH = 555;
    var PIXELS_PER_ROW = 20;
    var PIXELS_PER_COL = 7;
    var BASE_COL_PIXELS = 16;

    function MathInputWiggiFeatureDef() {
      this.name = 'mathinput';
      this.attributeName = 'mathinput';
      this.iconclass = 'fa math-sum';
      this.insertInline = true;
      this.addToEditor = '<div mathinput-holder-init></div>';
      this.compile = true;
      this.draggable = true;
      this.initialise = function($node, replaceWith) {
        var content = $node.html() || '';
        var isNew = $node[0].outerHTML.indexOf('mathinput-holder-init') >= 0;
        var newNode = $('<div mathinput-holder><math-input editable="true" keypad-auto-open="' + isNew + '" keypad-type="\'basic\'" ng-model="expr" expression="\'' + content + '\'"></math-input></div>');
        return replaceWith(newNode);
      };

      this.registerChangeNotifier = function(notifyEditorOfChange, node) {
        var scope = node.scope() && node.scope().$$childHead;
        if (scope) {
          scope.$watch('ngModel', function(a, b) {
            if (a && b && a !== b) {
              notifyEditorOfChange();
            }
          });
        }
      };

      this.onClick = function($node, $nodeScope, editor) {
        $node.find('.mq').find('textarea').blur();
        setTimeout(function() {
          $node.find('.mq').find('textarea').focus();
        }, 1);
      };

      this.getMarkUp = function($node, $scope) {
        return '<span mathinput>' + ($scope.expr || '') + '</span>';
      };
    }

    return {
      scope: {},
      restrict: 'AE',
      link: link,
      controller: function($scope) {
      },
      template: template()
    };


    function link(scope, element, attrs) {

      function editable() {
        return element.find('.wiggi-wiz-editable');
      }

      scope.editable = true;

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {

          var config = dataAndSession.data ? dataAndSession.data.model.config || {} : {};
          
          function getValue(key, lower, upper, defaultValue){
            var v = config[key] || defaultValue;
            return Math.max(lower, Math.min(upper, v));
          }

          scope.question = dataAndSession.data.model;
          scope.session = dataAndSession.session || {answers: ''};
          scope.answer = scope.session.answers;

          scope.rows = getValue('expectedLines', 5, 20, 5);
          scope.cols = getValue('expectedLength', 40, 100, 60);

          var width = (Math.min(scope.cols * PIXELS_PER_COL + BASE_COL_PIXELS, MAX_WIDTH) + 'px');
          var height = scope.rows * PIXELS_PER_ROW + 'px';

          scope.extraFeatures = scope.question.config.showMathInput ? {
            definitions: [{
              type: 'group',
              name: 'math',
              buttons: [new MathInputWiggiFeatureDef()]
            }]
          } : {};

          var compiledWiggi = $compile(wiggiTemplate())(scope);
          element.find('.textarea-holder')
            .css({
              'overflow' : 'hidden',
              display: 'inline-block',
              width: width
            });
          element.find('.textarea-holder .wiggi').html(compiledWiggi).css({
            height: height});
        },

        getSession: function() {
          return {
            answers: scope.answer
          };
        },

        setInstructorData: function(data) {
          scope.answer = "Open Ended Answers are not automatically scored. No correct answer is defined.";
          scope.received = true;
        },

        // sets the server's response
        setResponse: function(response) {
          if (!response.correctClass) {
            response.correctClass = 'submitted';
          }

          scope.answer = response.studentResponse;
          scope.response = response;

          scope.received = true;
        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.answer = undefined;
          scope.response = undefined;
          scope.received = false;
        },

        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function(callback) {
          scope.$watch("answer", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);
        },

        editable: function(e) {
          scope.editable = e;
        }
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

      scope.$watch('answer', function() {
        scope.inputClass = (scope.answer && $(scope.answer.trim()).text().length > 0) ? 'filled-in' : '';
      });

    }

    function wiggiTemplate() {
      return [
        '    <wiggi-wiz features="extraFeatures" ng-model="answer" enabled="editable"',
        '        toolbar-on-focus="true" placeholder="Write your answer here.">',
        '      <toolbar basic="bold italic underline" formatting="" positioning="" markup="" media="" line-height="" order="basic,lists,math" />',
        '    </wiggi-wiz>'

      ].join('\n');
    }
    function template() {
      return [
        '<div class="view-extended-text-entry {{response.correctness}}" ng-class="{received: received}">',
        '  <div class="textarea-holder {{inputClass}}">',
        '    <div class="wiggi"></div>',
        '    <div ng-show="feedback" feedback="response.feedback" icon-set="emoji" correct-class="{{response.correctClass}}"></div>',
        '  </div>',
        '  <div learn-more-panel ng-show="response.comments"><div ng-bind-html-unsafe="response.comments"></div></div>',
        '</div>'].join("\n");
    }
  }];

var mathinputHolder = ['$log', function($log) {
  function link($scope, $element) {
    $element.addClass('mathinput-holder');
  }

  return {
    restrict: 'A',
    link: link
  };
}];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'mathinputHolder',
    directive: mathinputHolder
  }
];

