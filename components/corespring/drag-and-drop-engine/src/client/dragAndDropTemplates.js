/* global exports */
exports.framework = "angular";
exports.service = [ '$log', function($log) {

  "use strict";

  var service = {

    choiceArea: function() {
      return [
        '<div class="choices" >',
        '  <div class="choices-table">',
        '    <div class="label-holder" ng-show="model.config.choiceAreaLabel"><div class="choiceAreaLabel">{{model.config.choiceAreaLabel}}</div></div>',
        '    <div class="label-sizer-holder" style="position: static; visibility: hidden">{{model.config.choiceAreaLabel}}</div>',
        '    <div ng-repeat="row in getChoiceRows()" class="choices-table-row">',
        '      <div ng-repeat="o in getChoicesForRow(row)" class="choice choices-table-cell same-size" ',
        '           ng-style="choiceStyle"',
        '           data-drag="editable"',
        '           ng-disabled="true"',
        '           data-jqyoui-options="draggableOptions(o)"',
        '           ng-model="local.choices[$parent.$index * itemsPerRow() + $index]"',
        '           jqyoui-draggable="draggableOptions(o)"',
        '           data-id="{{o.id}}">',
        '       <div ng-switch="o.labelType">',
        '         <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
        '         <div ng-switch-default="" class="html-holder" ng-bind-html-unsafe="o.label" />',
        '       </div>',
        '       <div class="sizerHolder" ng-switch="o.labelType">',
        '         <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
        '         <div ng-switch-default="" class="html-holder" ng-bind-html-unsafe="o.label" />',
        '       </div>',
        '      </div>',
        '    </div>',
        '    <div class="same-size resize-stopper" ng-style="resizeStopperStyle"/>',
        '  </div>',
        '</div>'
      ].join('');
    }
  };
  return service;
}];