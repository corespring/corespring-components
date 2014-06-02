// module: corespring.image-service
// service: ImageService

exports.framework = 'angular';
exports.service = [
  '$log', function($log) {
    return {
      test: function() {
        window.alert('and it works!');
      }
    }
  }
];
