var main = [
  function() {

    function wordSplit(content) {
      return _((content || "").split(' ')).filter(_.isBlank).map(function(word) {
        return {
          data: word
        };
      }).value();
    }

    function sentenceSplit(content) {
      return _((content || "").match(/(.*?[.!?]([^ \\t])*)/g)).filter(_.isBlank).map(function(sentence) {
        return {
          data: sentence
        };
      }).value();
    }

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {

        $scope.mode = 'editor';

        $scope.test = {
          hasCopyright: 'false'
        };

        function setBoundaries() {
          if ($scope.model.config.selectionUnit === 'word') {
            $scope.model.selections = wordSplit($scope.content.xhtml);
          } else if ($scope.model.config.selectionUnit === 'sentence') {
            $scope.model.selections = sentenceSplit($scope.content.xhtml);
          } else {
            $scope.model.selections = [$scope.content.xhtml];
          }
        }

        $scope.$watch('content.xhtml', setBoundaries, true);
        $scope.$watch('model.config.selectionUnit', setBoundaries, true);

        $scope.selectItem = function(index) {
          $scope.model.selections[index].correct = !$scope.model.selections[index].correct;
        };

        $scope.safeApply = function(fn) {
          var phase = this.$root.$$phase;
          if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };

        $scope.toggleSelection = function($event) {
          $event.stopPropagation();
          if ($scope.mode === 'editor') {
            $scope.mode = 'selection';
            $scope.safeApply(function() {
              setTimeout(function() {
                $('.select-text-editor-container', $element).trigger('show');
              }, 200);
            });
          } else {
            $scope.mode = 'editor';
            $scope.hidePopover();
          }
        };

        $scope.$watch('model.selections', function() {
          $scope.correctSelections = ($scope.model && $scope.model.selections) ? _.filter($scope.model.selections, function(selection) {
            return selection.correct === true;
          }).length : 0;
        }, true);

        $scope.hidePopover = function() {
          setTimeout(function() {
            if ($('.popover-inner', $element).length !== 0) {
              $('.select-text-editor-container', $element).trigger('show');
            }
          }, 200);
        };

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
            $scope.model.selections = $scope.model.selections || [];
            $scope.content = {};
            $scope.content.xhtml = _.pluck($scope.model.selections, 'data').join(' ');
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          },
          setProfile: function(profile) {
            $scope.profile = profile;
            $scope.profile = _.defaults($scope.profile, { contributorDetails: { additionalCopyrights: [] }});
          }
        };

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
      },
      template: [
        '<div class="select-text-configuration">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        '      <div class="input-holder root">',
        '        <div class="body">',
        '          <p class="info">',
        '            In Select Text Evidence, a student is asked to highlight specific words or sentences from a ',
        '            passage to provide evidence to support their answer.',
        '          </p>',
        '          <div class="select-text-editor-container clearfix" ng-class="mode" ng-click="hidePopover()"',
        '            popover-trigger="show" popover-placement="top"',
        '            popover="Click the {{model.config.selectionUnit}}s you want to set as choices">',
        '            <wiggi-wiz ng-show="mode == \'editor\'" ng-model="content.xhtml"></wiggi-wiz>',
        '            <div class="selection-editor" ng-show="mode == \'selection\'" ng-class="{words: model.config.selectionUnit == \'word\'}">',
        '              <span class="selection" ng-repeat="selection in model.selections" ng-class="{correct: selection.correct}" ng-click="selectItem($index)">{{selection.data}}</span>',
        '            </div>',
        '            <button class="btn btn-sm" ng-click="toggleSelection($event)">{{mode == \'selection\' ? \'edit passage\' : \'done\'}}</button>',
        '          </div>',
        '          <div class="selection-unit property" ng-class="{disabled: mode != \'selection\'}">',
        '            <p>',
        '              Students must select',
        '              <select class="form-control selection-unit" ng-disabled="mode != \'selection\'" ng-model="model.config.selectionUnit">',
        '                <option value="word">Words</option>',
        '                <option value="sentence">Sentences</option>',
        '              </select>',
        '              from the passage above.',
        '            </p>',
        '            <p>Select all possible choices {{model.config.selectionUnit}}s.</p>',
        '            <p>{{correctSelections}} is the total number of correct selections identified.</p>',
        '          </div>',
        '          <div class="property response-type">',
        '            <strong>Acceptable Responses</strong>',
        '            <div class="response-type-selection">',
        '              <p class="prompt">Students must respond by:</p>',
        '              <label>',
        '                <input type="radio" ng-model="model.config.checkIfCorrect" ng-value="true"/> ',
        '                <span>Selecting all of the {{model.config.selectionUnit}}s identified as correct</span>',
        '              </label>',
        '              <label class="open-ended">',
        '                <input type="radio" ng-model="model.config.checkIfCorrect" ng-value="false"/>',
        '                Selecting any number of {{model.config.selectionUnit}}s; the teacher will manually review ',
        '                the selections to determine correctness.',
        '              </label>',
        '            </div>',
        '          </div>',
        '          <div class="additional-copyright-information">',
        '            <additional-copyright-information copyrights="profile.contributorDetails.additionalCopyrights"',
        '              prompt="Does this item contain any other copyrighted materials? E.g., book passage, image, etc.">',
        '            </additional-copyright-information>',
        '          </div>',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
