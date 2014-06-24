describe('corespring video utils', function() {

  var videoUtils;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function(VideoUtils) {
    videoUtils = VideoUtils;
  }));

  it('youtube', function() {
    var url =  "https://www.youtube.com/watch?v=_sBZdSHAIZI";
    var youtubeUrl = videoUtils.convertYoutubeUrlToEmbedded(url);
    expect(youtubeUrl).toBe("https://www.youtube.com/embed/_sBZdSHAIZI?rel=0&showinfo=0");
  });

  it('youtube 2', function() {
    var url =  "http://youtu.be/_FU0ol9lWog";
    var youtubeUrl = videoUtils.convertYoutubeUrlToEmbedded(url);
    expect(youtubeUrl).toBe("https://www.youtube.com/embed/_FU0ol9lWog?rel=0&showinfo=0");
  });

  it('vimeo', function() {
    var url =  "http://vimeo.com/channels/staffpicks/98268016";
    var vimeoUrl = videoUtils.convertVimeoUrlToEmbedded(url);
    expect(vimeoUrl).toBe("https://player.vimeo.com/video/98268016?badge=0&byline=0&portrait=0");
  });

  it('youtube and vimeo', function() {
    var url =  "https://www.youtube.com/watch?v=_sBZdSHAIZI";
    var youtubeUrl = videoUtils.convertYoutubeOrVimeoUrlToEmbedded(url);
    expect(youtubeUrl).toBe("https://www.youtube.com/embed/_sBZdSHAIZI?rel=0&showinfo=0");

    url =  "http://vimeo.com/channels/staffpicks/98268016";
    var vimeoUrl = videoUtils.convertYoutubeOrVimeoUrlToEmbedded(url);
    expect(vimeoUrl).toBe("https://player.vimeo.com/video/98268016?badge=0&byline=0&portrait=0");
  });

});
