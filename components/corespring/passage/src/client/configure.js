/* global exports */

var main = ['PassageService',
  function(PassageService) {

    var query = {
      'text' : 'great'
    };

    "use strict";
    return {
      scope: {},
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {

        $scope.containerBridge = {
          setModel: function(fullModel) {
            $scope.fullModel = fullModel;
          }
        };

        $scope.searchResults = [];

        $scope.query = {
          text: undefined
        };

        $scope.$watch('query', function() {
          PassageService.search($scope.query, function(err, results) {
            $scope.searchResults = results.hits;
          });
        }, true);

        $scope.init = function() {
          $scope.active = [];
          $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
        };

        $scope.setPassage = function(passage) {
          $scope.fullModel.id = passage.id;
        };

        $scope.selected = function(passage) {
          return $scope.fullModel.id === passage.id;
        };

        $scope.init();
      },
      template: [
        '<div class="passage-config">',
        '  <input type="text" ng-model="query.text" />',
        '  <ul>',
        '    <li ng-repeat="searchResult in searchResults" ng-class="selected(searchResult) ? \'selected\' : \'\'">',
        '      {{searchResult}}',
        '    <button ng-click="setPassage(searchResult)" ng-disabled="selected(searchResult)">Add</button>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];

