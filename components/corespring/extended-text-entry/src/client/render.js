var main = [
  function () {

    return {
      scope: {},
      restrict: 'AE',
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      scope.editable = true;
      scope.containerBridge = {

        setDataAndSession: function (dataAndSession) {
          scope.question = dataAndSession.data.model;
          scope.session = dataAndSession.session || {answers: ''};
          scope.answer = scope.session.answers;
          scope.rows = (dataAndSession.data.model.config && dataAndSession.data.model.config.expectedLines) || 4;
          scope.cols = (dataAndSession.data.model.config && dataAndSession.data.model.config.expectedLength) || 60;
          var width = (Math.min(scope.cols * 7 + 16, 555) + 'px');
          var height = scope.rows * 20 + 'px';
          element.find('.wiggi-wiz').css({ width: width });
          element.find('.wiggi-wiz-editable').css({
            height: height,
            width: width
          });
        },

        getSession: function () {
          return {
            answers: scope.answer
          };
        },

        setInstructorData: function(data) {
          scope.answer = "Open Ended Answers are not automatically scored. No correct answer is defined.";
          scope.received = true;
        },

        // sets the server's response
        setResponse: function (response) {
          console.log("Setting Response for extended text entry:");
          console.log(response);

          scope.answer = response.studentResponse;
          scope.response = response;

          scope.received = true;
        },

        setMode: function (newMode) {
        },

        reset: function () {
          scope.answer = undefined;
          scope.response = undefined;
          scope.received = false;
        },

        isAnswerEmpty: function () {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function (callback) {
          scope.$watch("answer", function (newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);
        },

        editable: function (e) {
          scope.editable = e;
        }
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    }

    function template() {
      return [
        '<div class="view-extended-text-entry {{response.correctness}}" ng-class="{received: received}">',
        '  <div class="textarea-holder">',
        '    <wiggi-wiz ng-model="answer" enabled="editable" style="{{style}}">',
        '      <toolbar basic="bold italic underline" formatting="" positioning="" markup="" media="" line-height="" />',
        '    </wiggi-wiz>',
        '  </div>',
        '  <div class="alert {{response.correctness == \'incorrect\' ? \'no-\' : \'\'}}feedback" ng-show="response.feedback" ng-bind-html-unsafe="response.feedback"></div>',
        '  <div learn-more-panel ng-show="response.comments"><div ng-bind-html-unsafe="response.comments"></div></div>',
        '</div>'].join("\n");
    }
  }];

exports.framework = 'angular';
exports.directive = main;
