var main = ['$compile', '$log', '$modal', '$rootScope', '$timeout', 'CsUndoModel',
  function($compile, $log, $modal, $rootScope, $timeout, CsUndoModel) {

    var link = function(scope, element, attrs) {

      $log.debug('drag-and-drop :: link');

      scope.landingPlaceChoices = {};
      scope.dragging = {};
      scope.maxWidth = 50;
      scope.maxHeight = 20;
      scope.expandHorizontal = true;
      scope.solutionVisible = false;

      scope.undoModel = new CsUndoModel();
      scope.undoModel.setGetState(getState);
      scope.undoModel.setRevertState(revertState);

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
          if (lastW !== w || lastH !== h && scope.model) {
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

      scope.draggableOptions = function(choice) {
        return {
          onStart: 'onStart',
          revert: 'invalid',
          opacity: 0.35,
          placeholder: (!choice || choice.moveOnDrag) ? false : 'keep'
        };
      };

      scope.resetChoices = function(model) {
        // TODO: rewrite this using stash
        var isNew = !scope.model;

        scope.model = _.cloneDeep(model);
        _.each(scope.landingPlaceChoices, function(lpc, key) {
          scope.landingPlaceChoices[key] = [];
        });

        if (isNew && scope.model.config.shuffle) {
          // TODO: rewrite this using stash
          scope.model.choices = _.shuffle(scope.model.choices);
        }
        scope.$emit('rerender-math', {delay: 20});
      };

      scope.startOver = function() {
        scope.undoModel.startOver();
      };

      scope.undo = function() {
        scope.undoModel.undo();
      };

      function getState() {
        var state = {
          choices: scope.model.choices,
          landingPlaces: scope.landingPlaceChoices
        };
        return state;
      }

      function revertState(state) {
        scope.model.choices = _.cloneDeep(state.choices);
        scope.landingPlaceChoices = _.cloneDeep(state.landingPlaces);
        scope.$emit('rerender-math', {delay: 20});
      }

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
            '<div class="view-drag-and-drop-legacy see-solution" style="display: block;">',
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

      scope.$watch('landingPlaceChoices', function(n, old) {
        if (_.isEmpty(n)) {
          return;
        }
        if (!_.isEmpty(old) && !_.isEqual(n, old) && _.isFunction(scope.answerChangeCallback)) {
          scope.answerChangeCallback();
        }
        scope.undoModel.remember();
      }, true);

      var choiceForId = function(id) {
        var choice = _.find(scope.originalChoices, function(c) {
          return c.id === id;
        });
        return choice;
      };

      scope.containerBridge = {
        setPlayerSkin: function(skin) {
          scope.iconset = skin.iconSet;
        },
        setDataAndSession: function(dataAndSession) {
          $log.debug("DnD setting session: ", dataAndSession);

          scope.rawModel = dataAndSession.data.model;
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
          if (response.emptyAnswer) {
            scope.feedback = {message: response.message, emptyAnswer: true};
          }

          // Populate solutionScope with the correct response
          scope.solutionScope = $rootScope.$new();
          scope.solutionScope.landingPlaceChoices = {};
          _.each(scope.correctResponse, function(v, k) {
            scope.solutionScope.landingPlaceChoices[k] = _.map(v, function(r) {
              return choiceForId(r);
            });
          });
        },

        setInstructorData: function(data) {
          _.each(data.correctResponse, function(v, k) {
            scope.landingPlaceChoices[k] = _.map(v, function(r) {
              return choiceForId(r);
            });
          });
          scope.correctResponse = data.correctResponse;
        },

        setMode: function(newMode) {
          scope.mode = newMode;
        },

        reset: function() {
          scope.feedback = undefined;
          scope.showSolution = false;
          scope.correctResponse = undefined;
          scope.resetChoices(scope.rawModel);
          scope.undoModel.init();
        },

        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function(callback) {
          scope.answerChangeCallback = callback;
        },

        editable: function(e) {
          scope.editable = e;
        }
      };

      scope.$watch('solutionVisible', function() {
        if (scope.solutionVisible) {
          scope.seeSolution();
          scope.solutionVisible = false;
        }
      });

      scope.helperForChoice = function(choice) {
        return ( !!choice.copyOnDrag ? "'clone'" : "''");
      };

      scope.placeholderForChoice = function(choice) {
        return ( !!choice.copyOnDrag ? "'keep'" : "''");
      };

      scope.getChoiceRows = function(choicesLength) {
        return _.range(choicesLength / scope.itemsPerRow);
      };

      scope.getChoicesForRow = function(row) {
        return scope.model.choices.slice(row * scope.itemsPerRow, row * scope.itemsPerRow + scope.itemsPerRow);
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    };

    var choiceArea = function() {
      return [
        '        <div class="choices" >',
        '          <h5 ng-bind-html-unsafe="model.config.choiceAreaLabel"></h5>',
        '          <div class="choices-table">',
        '            <div ng-repeat="row in getChoiceRows(model.choices.length)" class="choices-table-row">',
        '              <div ng-repeat="o in getChoicesForRow(row)" class="choice choices-table-cell" ',
        '                   ng-style="choiceStyle"',
        '                   data-drag="editable"',
        '                   ng-disabled="!editable"',
        '                   data-jqyoui-options="draggableOptions(o)"',
        '                   ng-model="model.choices[$parent.$index * itemsPerRow + $index]"',
        '                   jqyoui-draggable="draggableOptions(o)"',
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
      '<div class="view-drag-and-drop-legacy" ng-class="{editable: editable}">',
      '  <correct-answer-toggle toggle="solutionVisible" visible="showSolution"></correct-answer-toggle>',
      '  <div ng-show="!correctResponse && editable" style="text-align: center">',
      '    <span cs-undo-button-with-model></span>',
      '    <span cs-start-over-button-with-model></span>',
      '  </div>',
      '  <div ng-if="isSeeAnswerPanelExpanded">',
      '  </div>',
      '  <div class="clearfix" />',
      '  <div ng-if="model.config.choicesPosition != \'below\'">', choiceArea(), '</div>',
      '  <h5 ng-bind-html-unsafe="model.config.answerAreaLabel"></h5>',
      '  <div id="answer-area"></div>',
      '  <div ng-if="model.config.choicesPosition == \'below\'">', choiceArea(), '</div>',
      '  <div feedback="feedback.message" icon-set="{{iconset}}" correct-class="{{feedback.emptyAnswer && \'nothing-submitted\'}}"></div>',

      '</div>'
    ].join('');

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
            if (_.find(scope.landingPlaceChoices[scope.id], function(el) { return el.id === scope.dragging.id; })) {
              return false;
            }
            return scope.dragging && (scope.dragging.fromTarget !== scope.id);
          },
          onDrop: 'onDrop',
          onOver: 'overCallback',
          onOut: 'outCallback',
          hoverClass: 'drop-hover',
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
