describe('text processing', function() {

  var $injector = angular.injector(['ng', 'test-app']);
  var TextProcessing = $injector.get('TextProcessing');

  function split(splitFn, content) {
    return _.pluck(splitFn(content), 'data');
  }

  describe('wordSplit', function() {
    function wordSplit(content) {
      return split(TextProcessing.wordSplit, content);
    }

    it('parses words', function() {
      expect(wordSplit("test this thing")).toEqual(['test', 'this', 'thing']);
    });

    it('moves inline styles around pieces', function() {
      expect(wordSplit("There <strong><u>are some words</u> with styling.</strong>"))
        .toEqual(['There', '<strong><u>are</u></strong>', '<strong><u>some</u></strong>',
          '<strong><u>words</u></strong>', '<strong>with</strong>', '<strong>styling.</strong>']);
    });

  });

  describe('sentenceSplit', function() {
    function sentenceSplit(content) {
      return split(TextProcessing.sentenceSplit, content);
    }

    it('parses sentences', function() {
      expect(sentenceSplit("There are two sentences here. They should be their own elements."))
        .toEqual(["There are two sentences here.", "They should be their own elements."]);
    });

    it('moves inline styles around pieces', function() {
      expect(sentenceSplit("Sentences can <strong>have styling. They can be </strong> partially styled."))
        .toEqual(['Sentences can <strong>have styling.</strong>', '<strong>They can be </strong> partially styled.']);
    });
  });


});
