// module: corespring.choice-templates
// service: ChoiceTemplates 

exports.framework = "angular";
exports.service = ['$log',
  function($log) {

    var ChoiceTemplates = function() {

      var placeholderText = {
        selectedFeedback: 'Enter feedback to display if this choice is selected.',
        notSelectedFeedback: 'Enter feedback to display if this choice is not selected.'
      };

      this.prompt = '<textarea ck-editor ng-model="model.prompt"></textarea><br/>';


      this.inline = function(type, value, body, attrs) {
        return ['<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
          '</label>'].join('\n');
      };

      this.choice = function(opts) {

        var defaults = {
          correct: this.inline("checkbox", null, "Correct", "ng-model='correctMap[q.value]'")
        };

        opts = _.extend(defaults, opts);

        return [
          '  <table>',
          '    <tr>',
          '     <td><b>Choice {{toChar($index)}}</b></td>',
          '      <td>',
          opts.correct,
          //inline("checkbox", null, "Correct", "ng-model='" + opts.correctNgModel + "'"),
          '      </td>',
          '      <td>',
          '        <select class="form-control" ng-model="q.labelType">',
          '          <option value="text">Text</option>',
          '          <option value="image">Image</option>',
          '          <option value="mathml">MathML</option>',
          '        </select>',
          '      </td>',
          '      <td>',
          '        <div ng-switch="q.labelType">',
          '          <input class="form-control" type="text" ng-switch-when="text" ng-model="q.label"></input>',
          '          <span ng-switch-when="image">',
          '           <label>Image: </label>',
          '           <input type="text" ng-model="q.imageName"></input>',
          '           <a file-uploader fu-url="getUploadUrl()" fu-upload-completed="imageUploadedToChoice(q)" fu-mode="raw" fu-max-size="1000">Upload</a>',
          '          </span>',
          '          <textarea ng-switch-when="mathml" ng-model="q.mathml" ng-change="updateMathJax()"></textarea>',
          '        </div>',
          '      </td>',
          '      <td>',
          '         <div class="remove-button" ng-click="removeQuestion(q)">',
          '           <button type="button" class="close">&times;</button>',
          '         </div>',
          '      </td>',
          '    </tr>',
          '    <tr>',
          '      <td colspan="4" style="text-align: left">',
          '        <div ng-click="feedbackOn = !feedbackOn"><span class="glyphicon glyphicon-plus"></span> Feedback</div>',
          '        <div class="well" ng-show="feedbackOn">',
          '          <div><label>If selected</label></div>',
          '          <input class="form-control" type="text" ng-model="feedback[q.value].feedback" placeholder="' + placeholderText.selectedFeedback + '"></input>',

          '          <div class="pull-right">',
          this.inline("radio", "normal", "Normal", "ng-model='feedback[q.value].feedbackType'"),
          this.inline("radio", "standard", "Standard", "ng-model='feedback[q.value].feedbackType'"),
          this.inline("radio", "custom", "Custom", "ng-model='feedback[q.value].feedbackType'"),
          '          </div>',
          '          <div class="clearfix"></div>',
          '          <div ng-show="correctMap[q.value]" style="margin-top: 15px">',
          '            <div><label>If not selected</label></div>',
          '            <input class="form-control" type="text" ng-model="feedback[q.value].notChosenFeedback" placeholder="' + placeholderText.notSelectedFeedback + '"></input>',
          '          </div>',
          '        </div>',
          '      </td>',
          '    </tr>',
          '  </table>'
          ].join('\n');

      };

      this.wrap = function(title, body) {
        return ['<div class="input-holder">',
          '  <div class="header">' + title + '</div>',
          '  <div class="body">' + body + '</div>',
          '</div>'].join('\n');
      };


      this.scoring = function() {

        return [
          ' <p>',
          '   <input type="radio" ng-model="model.scoringType" value="standard"></input> <label>Standard</label>',
          '   <input type="radio" ng-model="model.scoringType" value="custom"></input> <label>Custom</label>',
          ' </p>',
          ' <table ng-show="model.scoringType==\'custom\'" class="score-table">',
          '   <tr>',
          '   <th>Choice</th>',
          '   <th>Points If Selected</th>',
          '   <tr ng-repeat="ch in model.choices">',
          '     <td>{{toChar($index)}}</td>',
          '     <td><select ng-model="scoreMapping[ch.value]"><option value="-1">-1</option><option value="0">0</option><option value="1">1</option></select></td>',
          '   </tr>',
          ' </table>'
          ].join('\n');
      };

    };

    return new ChoiceTemplates();
}];
