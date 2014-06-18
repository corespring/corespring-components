exports.framework = 'angular';
exports.service = [
  function() {
    return {
      convertYoutubeUrlToEmbedded: function(url) {
        return url.replace(/watch\?v=/gi, "embed/");
      }
    };
  }
];
