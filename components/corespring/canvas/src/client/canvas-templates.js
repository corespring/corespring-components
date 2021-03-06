exports.framework = "angular";
exports.service = [
  'CanvasConfigScopeExtension',
  'CanvasRenderScopeExtension',
  function(CanvasConfigScopeExtension, CanvasRenderScopeExtension) {

    "use strict";

    function CanvasTemplates() {

      this.extendScope = function(scope, componentType) {
        new CanvasConfigScopeExtension().postLink(scope);
        new CanvasRenderScopeExtension().postLink(scope);
      };

      var inline = function(type, value, body, attrs) {
        return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
          '</label>'].join('\n');
      };

      var labelWithInput = function(options) {
        options.size = options.size || 3;
        options.labelSize = options.labelSize || options.size;
        options.labelClass = options.labelClass || "";
        options.inputType = options.inputType || "text";
        options.inputClass = options.inputClass || "default-input";
        return [
          '<label class="col-sm-' + options.labelSize+' '+options.labelClass+'">' + options.label + '</label>',
          '<div class="col-sm-' + options.size + ' ' + options.inputClass + '">',
          '  <input ',
          '    type="' + options.inputType + '" ',
          '    class="form-control" ',
          '    ng-model="fullModel.model.config.' + options.modelKey + '" ',
          options.placeholder ? ('placeholder="' + options.placeholder + '" ') : '',
          options.extraProperties,
          '  />',
          '</div>'
        ].join('');
      };

      this.configGraph = function() {
        return [
          '<div class="row">',
          '  <div class="body col-md-12">',
          '    <h3>Graph Attributes</h3>',
          '    <p class="graph-instructions">Use this section to setup the graph area. <span class="note">Note: Minimum value may not be greater than 0. Maximum value may not be less than 0. Minimum and maximum values can not be equal.</span></p>',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="body col-md-12">',
          '    <form class="form-horizontal" role="form" name="attributesForm">',
          '      <div class="config-form-row">',
          '        <h4>Domain (X)</h4>',
          '      </div>',
          '      <div class="config-form-row">',
          labelWithInput({ label: 'Minimum Value', modelKey: 'domainMin', inputType: "number", placeholder: '{{defaults.domainMin}}' }),
          labelWithInput({ label: 'Maximum Value', modelKey: 'domainMax', inputType: "number", placeholder: '{{defaults.domainMax}}' }),
          '      </div>',
          '      <div class="config-form-row">',
          labelWithInput({ label: 'Tick Value:', modelKey: 'domainStepValue', inputType: "number", placeholder: '{{defaults.domainStepValue}}' }),
          labelWithInput({ label: 'Snap Value:', modelKey: 'domainSnapValue', inputType: "number", placeholder: '{{defaults.domainSnapValue}}' }),
          '      </div>',
          '      <div class="config-form-row">',
          labelWithInput({ label: 'Tick Label Frequency:', modelKey: 'domainLabelFrequency', inputType: "number", placeholder: '{{defaults.domainLabelFrequency}}' }),
          '        <label class="col-sm-3">Padding (%):</label>',
          '        <div class="col-sm-3 default-input"',
          '          ng-class="{ \'has-error\': attributesForm.domainGraphPadding.$error.min || attributesForm.domainGraphPadding.$error.number }">',
          '          <input type="number" name="domainGraphPadding" ',
          '            class="form-control" ',
          '            ng-model="fullModel.model.config.domainGraphPadding" ',
          '            data-toggle="tooltip"',
          '            placeholder="{{defaults.domainGraphPadding}}" ',
          '            min="0" step="25" />',
          '            <div class="inline-error-message" ng-show="attributesForm.domainGraphPadding.$error.number">Please enter a valid number</div>',
          '            <div class="inline-error-message" ng-show="attributesForm.domainGraphPadding.$error.min">Please enter a positive number</div>',
          '        </div>',
          '      </div>',
          '      <div class="config-form-row">',
          '        <h4>Range (Y)</h4>',
          '      </div>',
          '      <div class="config-form-row">',
          labelWithInput({ label: 'Minimum Value', modelKey: 'rangeMin', inputType: "number", placeholder: '{{defaults.rangeMin}}' }),
          labelWithInput({ label: 'Maximum Value', modelKey: 'rangeMax', inputType: "number", placeholder: '{{defaults.rangeMax}}' }),
          '      </div>',
          '      <div class="config-form-row">',
          labelWithInput({ label: 'Tick Value:', modelKey: 'rangeStepValue', inputType: "number", placeholder: '{{defaults.rangeStepValue}}' }),
          labelWithInput({ label: 'Snap Value:', modelKey: 'rangeSnapValue', inputType: "number", placeholder: '{{defaults.rangeSnapValue}}' }),
          '      </div>',
          '      <div class="config-form-row">',
          labelWithInput({ label: 'Tick Label Frequency:', modelKey: 'rangeLabelFrequency', inputType: "number", placeholder: '{{defaults.rangeLabelFrequency}}' }),
          '        <label class="col-sm-3">Padding (%):</label>',
          '        <div class="col-sm-3 default-input"',
          '          ng-class="{ \'has-error\': attributesForm.rangeGraphPadding.$error.min || attributesForm.rangeGraphPadding.$error.number }">',
          '          <input type="number" name="rangeGraphPadding" ',
          '            class="form-control" ',
          '            ng-model="fullModel.model.config.rangeGraphPadding" ',
          '            placeholder="{{defaults.rangeGraphPadding}}" ',
          '            min="0" step="25" />',
          '          <div class="inline-error-message" ng-show="attributesForm.rangeGraphPadding.$error.number">Please enter a valid number</div>',
          '          <div class="inline-error-message" ng-show="attributesForm.rangeGraphPadding.$error.min">Please enter a positive number</div>',
          '        </div>',
          '      </div>',
          '      <div class="config-form-row">',
          labelWithInput({ label: 'Significant Figures:', modelKey: 'sigfigs', inputType: "number",
            placeholder: '{{defaults.sigfigs}}' }),
          '      </div>',
          '    </form>',
          '  </div>',
          '</div>'
        ].join('\n');
      };

      this.configDisplay = function(showInputs) {
        showInputs = showInputs === true;
        return [
          '  <div class="row">',
          '    <div class="body col-md-12">',
          '      <form class="form-horizontal" role="form" name="displayForm">',
          '        <h3>Display</h3>',
          '        <div class="row config-form-row graph-labels-label-row">',
          '          <label class="col-xs-12">',
          '            Graph Labels',
          '          </label>',
          '        </div>',
          '        <div class="row config-form-row graph-labels-row">',
          '          <div class="col-xs-4">',
          '            <div>Top</div>',
          '              <input type="text" class="form-control" ng-model="fullModel.model.config.graphTitle"',
          '                  placeholder="{{defaults.graphTitle}}"/>',
          '          </div>',
          '          <div class="col-xs-4">',
          '            <div>Left</div>',
          '              <input type="text" class="form-control" ng-model="fullModel.model.config.rangeLabel"',
          '                  placeholder="{{defaults.rangeLabel}}"/>',
          '          </div>',
          '          <div class="col-xs-4">',
          '            <div>Bottom</div>',
          '              <input type="text" class="form-control" ng-model="fullModel.model.config.domainLabel"',
          '                  placeholder="{{defaults.domainLabel}}"/>',
          '          </div>',
          '        </div>',
          '        <div class="config-form-row dimensions-row">',
          labelWithInput({ label: 'Width', modelKey: 'graphWidth', inputType: "number", inputClass: 'input-number', placeholder: '{{defaults.graphWidth}}', labelSize: 2, size: 2 }),
          labelWithInput({ label: 'Height', modelKey: 'graphHeight', inputType: "number", inputClass: 'input-number', placeholder: '{{defaults.graphHeight}}', labelSize: 2, size: 2 }),
          '        </div>',
          '        <div class="config-form-row row">',
          '          <div class="col-sm-4">',
          '            <checkbox ng-model="fullModel.model.config.showPointLabels">Show Point Labels</checkbox>',
          '          </div>',
          '          <div class="col-sm-8">',
          '            <checkbox ng-model="fullModel.model.config.showCoordinates">Show Point Coordinates</checkbox>',
          '          </div>',
          '        </div>',
          '        <div class="config-form-row row show-inputs">',
          '          <div class="col-sm-4">',
          '            <checkbox ng-model="fullModel.model.config.showAxisLabels">Show Axis Labels</checkbox>',
          '          </div>',
          '          <div class="col-sm-8" ng-show="'+showInputs+'">',
          '            <checkbox ng-model="fullModel.model.config.showInputs">Show Points Input on the Graph</checkbox>',
          '          </div>',
          '        </div>',
          '        <br />',
          '      </form>',
          '    </div>',
          '  </div>'
        ].join('\n');
      };
    }

    return new CanvasTemplates();
  }
];
