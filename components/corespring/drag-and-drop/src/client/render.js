var main = ['$compile', '$log', '$modal', '$rootScope', '$timeout',
  function($compile, $log, $modal, $rootScope, $timeout) {

    var link = function(scope, element, attrs) {

      scope.landingPlaceChoices = {};
      scope.dragging = {};
      scope.maxWidth = 50;
      scope.maxHeight = 20;
      scope.expandHorizontal = true;
      scope.stack = [];

      scope.propagateDimension = function(w, h) {
        scope.$apply(function() {
          if (w > scope.maxWidth) {
            scope.maxWidth = w;
          }
          if (h > scope.maxHeight) {
            scope.maxHeight = h;
          }
          scope.choiceStyle = {
            width: (scope.maxWidth) + 'px',
            height: (scope.maxHeight + 16) + 'px'
          };
        });
      };

      var lastW, lastH;

      setInterval(function() {

        if (!scope.$$phase) {
          var w = 0,
            h = 0;

          $(element).find('.sizerHolder').each(function(idx, e) {
            if ($(e).width() > w) {
              w = $(e).width();
            }
          });
          $(element).find('.sizerHolder').each(function(idx, e) {
            if ($(e).height() > h) {
              h = $(e).height();
            }
          });
          if (lastW !== w || lastH !== h) {
            scope.propagateDimension(w + 18, h);
          }
          lastW = w;
          lastH = h;
        }
      }, 1000);

      scope.onStart = function(event) {
        scope.dragging.id = $(event.currentTarget).attr('data-id');
        scope.dragging.fromTarget = undefined;
      };

      scope.draggableOptions = {
        onStart: 'onStart',
        revert: 'invalid'
      };

      scope.resetChoices = function(model) {
        // TODO: rewrite this using stash
        var isNew = !scope.model;

        scope.stack = [];
        scope.model = _.cloneDeep(model);
        _.each(scope.landingPlaceChoices, function(lpc, key) {
          scope.landingPlaceChoices[key] = [];
        });

        if (isNew && scope.model.config.shuffle) {
          // TODO: rewrite this using stash
          scope.model.choices = _.shuffle(scope.model.choices);
        }
      };

      scope.startOver = function() {
        scope.stack = [];
        scope.model.choices = _.cloneDeep(scope.originalChoices);
        _.each(scope.landingPlaceChoices, function(lpc, key) {
          scope.landingPlaceChoices[key] = [];
        });
      };

      scope.undo = function() {
        if (scope.stack.length < 2) {
          return;
        }
        var o = scope.stack.pop();
        var state = _.last(scope.stack);
        scope.model.choices = _.cloneDeep(state.choices);
        scope.landingPlaceChoices = _.cloneDeep(state.landingPlaces);
      };

      scope.seeSolution = function() {
        scope.solutionScope.choiceStyle = scope.choiceStyle;
        $modal.open({
          controller: function($scope, $modalInstance) {
            scope.$emit('rerender-math', {delay: 1, element: $('.modal-content')[0]});
            $scope.ok = function() {
              $modalInstance.dismiss('cancel');
            };
          },
          template: [
          '<div class="view-drag-and-drop">',
          '   <div class="modal-header">',
          '     <h3>Answer</h3>',
          '   </div>',
          '   <div class="modal-body">',
          scope.model.answerArea,
          '   </div>',
          '   <div class="modal-footer">',
          '     <button class="btn btn-primary" ng-click="ok()">OK</button>',
          '   </div>',
          '</div>'
        ].join(""),
          backdrop: true,
          scope: scope.solutionScope
        });
      };

      scope.$watch('landingPlaceChoices', function(n) {
        var state = {
          choices: _.cloneDeep(scope.model.choices),
          landingPlaces: _.cloneDeep(scope.landingPlaceChoices)
        };
        if (!_.isEqual(state, _.last(scope.stack))) {
          scope.stack.push(state);
        }
      }, true);

      var choiceForId = function(id) {
        var choice = _.find(scope.originalChoices, function(c) {
          return c.id === id;
        });
        return choice;
      };


      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("DnD setting session: ", dataAndSession);

          scope.rawModel = dataAndSession.data.model;
          scope.editable = true;
          scope.resetChoices(scope.rawModel);

          scope.expandHorizontal = dataAndSession.data.model.config.expandHorizontal;
          scope.itemsPerRow = dataAndSession.data.model.config.itemsPerRow || 2;
          scope.originalChoices = _.cloneDeep(scope.model.choices);

          if (dataAndSession.session && dataAndSession.session.answers) {

            // Build up the landing places with the selected choices
            _.each(dataAndSession.session.answers, function(v, k) {
              scope.landingPlaceChoices[k] = _.map(v, choiceForId);
            });

            // Remove choices that are in landing place area
            scope.model.choices = _.filter(scope.model.choices, function(choice) {
              var landingPlaceWithChoice = _.find(scope.landingPlaceChoices, function(c) {
                return _.pluck(c, 'id').indexOf(choice.id) >= 0;
              });
              return _.isUndefined(landingPlaceWithChoice);
            });
          }

          var answerHtml = scope.model.answerArea;

          var $answerArea = element.find("#answer-area").html("<div> " + answerHtml + "</div>");
          $timeout(function() {
            $compile($answerArea)(scope.$new());
          });

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
          scope.correctResponse = response.correctResponse;
          scope.showSolution = response.correctness !== 'correct';

          // Populate solutionScope with the correct response
          scope.solutionScope = $rootScope.$new();
          scope.solutionScope.landingPlaceChoices = {};
          _.each(scope.correctResponse, function(v, k) {
            scope.solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return choiceForId(r);
            });
          });
        },

        setMode: function(newMode) {},

        reset: function() {
          scope.showSolution = false;
          scope.resetChoices(scope.rawModel);
        },

        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function(callback) {
          scope.$watch("landingPlaceChoices", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);
        },

        editable: function(e) {
          scope.editable = e;
        }
      };

      scope.helperForChoice = function(choice) {
        return ( !! choice.copyOnDrag ? "'clone'" : "''");
      };

      scope.placeholderForChoice = function(choice) {
        return ( !! choice.copyOnDrag ? "'keep'" : "''");
      };

      scope.getChoiceRows = function() {
        return _.range(scope.model.choices.length / scope.itemsPerRow);
      };

      scope.getChoicesForRow = function(row) {
        return scope.model.choices.slice(row * scope.itemsPerRow, row * scope.itemsPerRow + scope.itemsPerRow);
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

    };


    var answerArea = function() {
      return [
        '        <h5 ng-bind-html-unsafe="model.config.answerAreaLabel"></h5>',
        '        <div id="answer-area">',
        '        </div>'
        ].join('');

    };

    var choiceArea = function() {
      return [
        '        <div class="choices" >',
        '          <h5 ng-bind-html-unsafe="model.config.choiceAreaLabel"></h5>',
        '          <div class="choices-table">',
        '            <div ng-repeat="row in getChoiceRows()" class="choices-table-row">',
        '              <div ng-repeat="o in getChoicesForRow(row)" class="choice choices-table-cell" ',
        '                   ng-style="choiceStyle"',
        '                   data-drag="editable"',
        '                   ng-disabled="!editable"',
        '                   data-jqyoui-options="{revert: \'invalid\',helper: {{helperForChoice(o)}} }"',
        '                   ng-model="model.choices[$parent.$index * itemsPerRow + $index]"',
        '                   jqyoui-draggable="{placeholder: {{placeholderForChoice(o)}} }"',
        '                   data-id="{{o.id}}">',
        '               <div ng-bind-html-unsafe="o.content" />',
        '               <div class="sizerHolder" style="display: none; position: absolute" ng-bind-html-unsafe="o.content" />',
        '              </div>',
        '            </div>',
        '          </div>',
        '          </div>'
        ].join('');
    };
    var tmpl = [
    '<div class="view-drag-and-drop-legacy">',
    '  <div ng-show="!correctResponse" class="pull-right">',
    '    <button type="button" class="btn btn-default" ng-click="undo()">Undo</button>',
    '    <button type="button" class="btn btn-default" ng-click="startOver()">Start over</button>',
    '  </div> <div class="clearfix" />',
    '  <div ng-if="model.config.choicesPosition != \'below\'">', choiceArea(), '</div>',
    '' + answerArea(),
    '  <div ng-if="model.config.choicesPosition == \'below\'">', choiceArea(), '</div>',
    '  <div class="pull-right" ng-show="showSolution"><a ng-click="seeSolution()">See solution</a></div>',
    '</div>'

  ].join("");


    return {
      link: link,
      scope: {},
      restrict: 'AE',
      replace: false,
      template: '' + tmpl
    };
}];

var landingPlace = [
  function() {
    var isMultiple = true;
    var def = {
      scope: true, //TODO: should use isolate scope, but = doesn't seem to inherit from DanD's scope
      restrict: 'AE',
      transclude: true,
      replace: false,
      link: function(scope, element, attrs) {

        scope['class'] = attrs['class'];
        scope.id = attrs.id;
        scope.cardinality = attrs.cardinality || 'single';
        scope.columnsPerRow = attrs.columnsperrow || 3;
        scope.landingPlaceChoices[scope.id] = scope.landingPlaceChoices[scope.id] || [];
        scope.label = attrs.label || "";
        isMultiple = scope.cardinality !== 'single';

        var nonEmptyElement = function(c) {
          return c && c.id;
        };

        scope.$watch('editable', function(e) {
          scope.sortableOptions.disabled = !e;
        });

        scope.onDrop = function() {
          scope.dragging.isOut = false;
          scope.model.choices = _.filter(scope.model.choices, nonEmptyElement);
          _.each(scope.landingPlaceChoices, function(lpc, key) {
            scope.landingPlaceChoices[key] = _.filter(lpc, nonEmptyElement);
          });
          scope.$emit('rerender-math', {delay: 1});
        };

        scope.onStart = function(event) {
          scope.dragging.id = $(event.currentTarget).attr('data-id');
          scope.dragging.fromTarget = scope.id;
        };

        scope.revertFunction = function(isValid) {
          if (isValid) {
            return false;
          }
          scope.$apply(function() {
            var choiceInLandingPlace = _.find(scope.landingPlaceChoices[scope.id], function(c) {
              return c.id === scope.dragging.id;
            });
            var choiceInChoiceArea = _.find(scope.model.choices, function(c) {
              return c.id === scope.dragging.id;
            });
            if (!choiceInChoiceArea) {
              scope.model.choices.push(choiceInLandingPlace);
            }
            scope.landingPlaceChoices[scope.id] = _.filter(scope.landingPlaceChoices[scope.id], function(e) {
              return e.id !== scope.dragging.id;
            });
          });
          scope.$emit('rerender-math', {delay: 1});
          return true;
        };

        scope.overCallback = function() {
          scope.dragging.isOut = false;
        };

        scope.outCallback = function() {
          scope.dragging.isOut = true;
        };

        scope.droppableOptions = {
          accept: function(a, b) {
            if (scope.cardinality === 'single' && scope.landingPlaceChoices[scope.id].length > 0) {
              return false;
            }
            return scope.dragging && (scope.dragging.fromTarget !== scope.id);
          },
          onDrop: 'onDrop',
          onOver: 'overCallback',
          onOut: 'outCallback',
          multiple: isMultiple
        };

        scope.sortableOptions = {
          start: function(ev, b) {
            scope.$apply(function() {
              scope.dragging.id = $(b.item).attr('data-id');
              scope.dragging.fromTarget = scope.id;
              scope.revertNext = false;
            });
          },
          beforeStop: function() {
            scope.revertNext = scope.dragging.isOut;

            scope.model.choices = _.filter(scope.model.choices, nonEmptyElement);
            _.each(scope.landingPlaceChoices, function(lpc, key) {
              scope.landingPlaceChoices[key] = _.filter(lpc, nonEmptyElement);
            });

          },
          stop: function() {
            if (scope.revertNext) {
              scope.revertFunction();
            }
            scope.dragging.fromTarget = undefined;

          },

          out: scope.outCallback,
          over: scope.overCallback,
          revert: false
        };

        scope.$watch("maxWidth + maxHeight", function(n) {
          var isMultiple = scope.cardinality !== 'single';
          var mw = scope.maxWidth + 25;
          var maxWidth = isMultiple ? (mw * scope.columnsPerRow) : mw;
          if (scope.expandHorizontal) {
            scope.style = "min-height: " + (scope.maxHeight + 20) + "px; min-width: " + maxWidth + "px";
          } else {
            scope.style = "min-height: " + (scope.maxHeight + 20) + "px; width: " + maxWidth + "px";
          }
        });

        scope.classForChoice = function(choice, idx) {
          if (!scope.correctResponse) {
            return;
          }
          var isCorrect;
          if (scope.cardinality === "ordered") {
            isCorrect = scope.correctResponse[scope.id].indexOf(choice.id) === idx;
          } else {
            isCorrect = scope.correctResponse[scope.id].indexOf(choice.id) >= 0;
          }

          return isCorrect ? "correct" : "incorrect";
        };


      },
      template: [
      '    <div data-drop="true" ng-model="landingPlaceChoices[id]" jqyoui-droppable="droppableOptions"',
      '         data-jqyoui-options="droppableOptions" class="landing-place {{class}}" style="{{style}}" >',
      '    <div class="label-holder"><div class="landingLabel">{{label}}</div>&nbsp;</div>',
      '    <div',
      '      ui-sortable="sortableOptions" ',
      '      ng-model="landingPlaceChoices[id]"',
      '      >',
      '        <div ng-repeat-start="choice in landingPlaceChoices[id]"',
      '             ng-style="choiceStyle" ',
      '             jqyoui-draggable="{index: {{$index}}, placeholder: true}"',
      '             data-jqyoui-options=""',
      '             ng-model="landingPlaceChoices[id][$index]"',
      '             data-id="{{choice.id}}"',
      '             class="choice {{classForChoice(choice, $index)}}"',
      '             ng-bind-html-unsafe="choice.content">',
      '        </div>',
      '        <div ng-repeat-end="" class="sizerHolder" style="display: none; position: absolute" ng-bind-html-unsafe="choice.content" />',
      '    </div>',
      '    </div>'].join("")

    };
    return def;
}];

exports.framework = 'angular';
exports.directives = [
/** The default definition - no name is needed. 1 main def is mandatory */
  {
    directive: main
  },
/** A 2nd directive */
  {
    name: 'landingPlace',
    directive: landingPlace
  }
];
