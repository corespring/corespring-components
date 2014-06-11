// module: corespring.text-procesing
// service: TextProcessing

exports.framework = "angular";
exports.service = ['$log',
  function($log) {

    function adjustMarkup(selections) {

      function getUnclosedTags(content, priorTags) {
        priorTags = priorTags || [];

        function getCloseTags(content) {
          return _.map(content.match(/<\s*\/\s*[a-zA-Z]+(>|.*?[^?]>)/g), function (tag) {
            return tag.match(/<\s*\/\s*(.*?)[\s|>]/)[1];
          });
        }

        function getOpenTags(content) {
          return _.map(content.match(/<\s*[a-zA-Z]+(>|.*?[^?]>)/g), function(tag) {
            return tag.match(/<\s*(.*?)[\s|>]/)[1];
          });
        }

        var openTags = priorTags.concat(getOpenTags(content));
        var closeTags = getCloseTags(content);
        _.forEach(closeTags, function(closeTag) {
          var tag = openTags.pop();
          if (tag !== closeTag) {
            throw "Cannot close " + closeTag;
          }
        });
        return openTags;
      }

      var priorTags = [];
      return _.map(selections, function(selection) {
        var prefix = _.map(priorTags, function(tag) {
          return "<" + tag + ">";
        }).join('');
        priorTags = getUnclosedTags(selection, priorTags);
        console.log(priorTags);
        return prefix + selection + _.map(_.cloneDeep(priorTags).reverse(), function(tag) {
          return "</" + tag + ">";
        }).join('');
      });
    }

    return {
      wordSplit: function(content) {
        var selections = adjustMarkup(_.filter((content || "").split(' '), _.isBlank));
        return _.map(selections, function(word) {
          return {
            data: word
          };
        });
      },
      sentenceSplit: function(content) {
        var selections = adjustMarkup(_((content || "").match(/(.*?[.!?]([^ \\t])*)/g))
          .filter(_.isBlank)
          .map(function(sentence) {
            return sentence.trim();
          }).value());
        return _.map(selections, function(sentence) {
          return {
            data: sentence
          };
        });
      }
    };

  }
];
