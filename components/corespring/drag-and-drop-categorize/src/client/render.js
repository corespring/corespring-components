var main = ['DragAndDropTemplates','$compile', '$log', '$modal', '$rootScope', '$timeout',
  function(DragAndDropTemplates, $compile, $log, $modal, $rootScope, $timeout) {

    var answerArea = [
      '        <h5 ng-bind-html-unsafe="model.config.answerAreaLabel"></h5>',
      '        <div ng-repeat="c in model.categories">',
      '          <div answer-area landingId="{{c.id}}"',
      '                          answer-area-label="{{c.hasLabel ? c.label : \'\'}}"',
      '                          answer-area-layout="{{c.layout}}"',
      '          >',
      '          </div>',
      '        </div>'
    ].join('');

    var link = function(scope, element, attrs) {

      scope._seeSolution = function() {
        scope.seeSolution(answerArea);
      };

      _.extend(scope.containerBridge, {
        setPlayerSkin: function(skin) {
          scope.iconset = skin.iconSet;
        },
        setInstructorData: function(data){
          $log.warn("setInstructorData not implemented");
        },
        setDataAndSession: function(dataAndSession) {
          $log.debug("DnD setting session: ", dataAndSession);

          scope.session = dataAndSession.session || {};
          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;
          scope.landingPlaceChoices = scope.landingPlaceChoices || {};
          scope.local = {};
          scope.resetChoices(scope.rawModel);

          scope.originalChoices = _.cloneDeep(scope.local.choices);

          if (dataAndSession.session && dataAndSession.session.answers) {

            // Build up the landing places with the selected choices
            _.each(dataAndSession.session.answers, function(v, k) {
              scope.landingPlaceChoices[k] = _.map(v, scope.choiceForId);
            });

            // Remove choices that are in landing place area
            scope.model.choices = _.filter(scope.model.choices, function(choice) {
              var landingPlaceWithChoice = _.find(scope.landingPlaceChoices, function(c) {
                return _.pluck(c, 'id').indexOf(choice.id) >= 0;
              });
              return _.isUndefined(landingPlaceWithChoice);
            });

          }

          scope.initUndo();
        },
        getSession: function() {
          var answer = {};
          _.each(scope.landingPlaceChoices, function(v, k) {
            if (k) {
              answer[k] = _.pluck(v, 'id');
            }
          });
          return {
            answers: answer
          };
        },

        setResponse: function(response) {
          console.log("set response for DnD", response);
          scope.response = response;
          scope.correctResponse = response.correctResponse;
          scope.feedback = response.feedback;
          scope.correctClass = response.correctClass;

          // Populate solutionScope with the correct response
          scope.solutionScope = $rootScope.$new();
          scope.solutionScope.landingPlaceChoices = {};
          scope.solutionScope.model = scope.model;
          _.each(scope.correctResponse, function(v, k) {
            scope.solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return scope.choiceForId(r);
            });
          });
        }
      });

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    };


    var tmpl = [
      '<div class="view-drag-and-drop-categorize view-drag-and-drop" drag-and-drop-controller>',
      '  <div ng-hide="response" class="pull-right">',
      '    <span cs-undo-button-with-model></span>',
      '    <span cs-start-over-button-with-model></span>',
      '  </div> <div class="clearfix" />',
      '  <div ng-if="model.config.answerAreaPosition != \'above\'">', DragAndDropTemplates.choiceArea(), '</div>',
      answerArea,
      '  <div ng-if="model.config.answerAreaPosition == \'above\'">', DragAndDropTemplates.choiceArea(), '</div>',
      '  <div class="pull-right see-solution" ',
      '      ng-show="correctResponse && response.correctClass != \'correct\'">',
      '    <a ng-click="_seeSolution()">See solution</a>',
      '  </div>',
      '  <div class="clearfix"></div>',
      '  <div ng-show="feedback" feedback="feedback" icon-set="{{iconset}}" correct-class="{{response.correctClass}}"></div>',
      '  <div ng-show="response.comments" class="well" ng-bind-html-unsafe="response.comments"></div>',
      '</div>'

    ].join("");

    return {
      link: link,
      scope: false,
      restrict: 'AE',
      replace: true,
      template: tmpl
    };
  }];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
