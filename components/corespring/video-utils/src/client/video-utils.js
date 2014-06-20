exports.framework = 'angular';
exports.service = [
  function() {
    return {
      convertYoutubeUrlToEmbedded: function(url) {
        return url.replace(/.*?\?v=(\w+)/gi, "https://www.youtube.com/embed/$1?rel=0&showinfo=0");
      },

      convertVimeoUrlToEmbedded: function(url) {
        return url.replace(/.*?\/(\d+).*?/gi, 'https://player.vimeo.com/video/$1?badge=0&byline=0&portrait=0');
      },

      convertYoutubeOrVimeoUrlToEmbedded: function(url) {
        var isYoutube = !_.isEmpty(url.match(/youtube\.com/));
        var isVimeo = !_.isEmpty(url.match(/vimeo\.com/));
        if (isYoutube) {
          return this.convertYoutubeUrlToEmbedded(url);
        }
        if (isVimeo) {
          return this.convertVimeoUrlToEmbedded(url);
        }
      }
    };
  }
];
