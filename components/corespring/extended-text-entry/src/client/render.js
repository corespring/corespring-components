exports.framework = 'angular';
exports.directives = [
  {
    directive: ['$compile', mainDirective]
  },
  {
    name: 'mathinputHolder',
    directive: ['$log', mathinputHolderDirective]
  }
];

function mainDirective($compile) {

  var MAX_WIDTH = 555;
  var PIXELS_PER_ROW = 20;
  var PIXELS_PER_COL = 7;
  var BASE_COL_PIXELS = 16;

  return {
    scope: {},
    restrict: 'AE',
    link: link,
    controller: function($scope) {},
    template: template()
  };

  function link(scope, element, attrs) {

    scope.editable = true;

    scope.containerBridge = {
      answerChangedHandler: answerChangedHandler,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      setDataAndSession: setDataAndSession,
      setInstructorData: setInstructorData,
      setMode: setMode,
      setPlayerSkin: setPlayerSkin,
      setResponse: setResponse
    };

    scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    //-------------------------------------------------
    // only functions below this line
    //-------------------------------------------------

    function setDataAndSession(dataAndSession) {

      var config = dataAndSession.data && dataAndSession.data.model ? dataAndSession.data.model.config || {} : {};

      scope.question = dataAndSession.data.model;
      scope.session = dataAndSession.session || {
        answers: ''
      };
      scope.answer = scope.session.answers;

      scope.rows = getValue(config, 'expectedLines', 3, 20, 5);
      scope.cols = getValue(config, 'expectedLength', 35, 100, 60);

      scope.extraFeatures = config.showMathInput ? {
        definitions: [{
          type: 'group',
          name: 'math',
          buttons: [new MathInputWiggiFeatureDef()]
        }]
      } : {};

      renderWiggi();
    }

    function renderWiggi() {
      var width = Math.min(scope.cols * PIXELS_PER_COL + BASE_COL_PIXELS, MAX_WIDTH);
      var height = scope.rows * PIXELS_PER_ROW;
      var compiledWiggi = $compile(wiggiTemplate())(scope);

      element.find('.textarea-holder')
        .css({
          width: width
        });

      element.find('.textarea-holder .wiggi')
        .html(compiledWiggi)
        .css({
          width: width,
          minHeight: height
        });

      element.find('.textarea-holder .wiggi-wiz')
        .css({
          minHeight: height
        });


    }

    function getSession() {
      return {
        answers: scope.answer
      };
    }

    function setPlayerSkin(skin) {
      scope.iconset = skin.iconSet;
    }

    function setInstructorData(data) {
      scope.answer = "Open Ended Answers are not automatically scored. No correct answer is defined.";
      scope.received = true;
    }

    // sets the server's response
    function setResponse(response) {
      console.log("Setting Response for extended text entry:");
      console.log(response);

      if (!response.correctClass) {
        response.correctClass = 'submitted';
      }

      scope.answer = response.studentResponse;
      scope.response = response;

      scope.received = true;
    }

    function setMode(newMode) {}

    function reset() {
      scope.answer = undefined;
      scope.response = undefined;
      scope.received = false;
    }

    function isAnswerEmpty() {
      return _.isEmpty(this.getSession().answers);
    }

    scope.$watch('answer', function() {
      scope.inputClass = (scope.answer && $('<span>' + scope.answer.trim() + '</span>').text().length > 0) ? 'filled-in' : '';
    });

    function answerChangedHandler(callback) {
      scope.$watch("answer", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          callback();
        }
      }, true);
    }

    function setEditable(e) {
      scope.editable = e;
    }

    function getValue(config, key, lower, upper, defaultValue) {
      var v = config[key] || defaultValue;
      return Math.max(lower, Math.min(upper, v));
    }

  }

  function wiggiTemplate() {
    return [
      '<wiggi-wiz',
      '    enabled="editable"',
      '    features="extraFeatures"',
      '    ng-model="answer"',
      '    placeholder="Write your answer here."',
      '    style="{{style}}"',
      '    toolbar-on-focus="true"',
      '>',
      '  <toolbar',
      '      basic="bold italic underline"',
      '      formatting=""',
      '      line-height=""',
      '      markup=""',
      '      media=""',
      '      order="basic,lists,math"',
      '      positioning=""',
      '  />',
      '</wiggi-wiz>'].join('\n');
  }

  function template() {
    return [
      '<div class="corespring-extended-text-entry view-extended-text-entry {{response.correctness}}"',
      '    ng-class="{received: received}">',
      '  <div class="textarea-holder {{inputClass}}">',
      '    <div class="wiggi"></div>',
      '    <div correct-class="{{response.correctClass}}"',
      '        feedback="response.feedback"',
      '        icon-set="{{iconset}}"',
      '    ></div>',
      '  </div>',
      '  <div learn-more-panel="" ng-show="response.comments">',
      '    <div ng-bind-html-unsafe="response.comments"></div>',
      '  </div>',
      '</div>'
    ].join("\n");
  }

  /**
   * A math input feature for the wiggi tool bar
   */
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

}

function mathinputHolderDirective($log) {
  function link($scope, $element) {
    $element.addClass('mathinput-holder');
  }

  return {
    restrict: 'A',
    link: link
  };
}