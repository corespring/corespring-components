/* global com, afterEach*/
describe('component-image-service', function() {

  beforeEach(function() {
    angular.mock.module('test-app');
  });

  var mockFileUploader;
  var mockFileReader;
  var uploadOpts;
  var service;
  var fileUploader;
  var mockDocument;

  beforeEach(function() {
    mockDocument = [{
      location: {
        href: '' 
      }
    }];

    module(function($provide) {
      $provide.value('$document', mockDocument);
    });
  });


  beforeEach(function() {

    mockFileUploader = {};
    
    window.com = {
      ee: {
        v2: {
          RawFileUploader: jasmine.createSpy('RawFileUploader::constructor').and.callFake(function(file, url, name, opts) {
            uploadOpts = opts;
            return mockFileUploader;
          })
        }
      }
    };
  });

  beforeEach(inject(function(ComponentImageService) {
    service = ComponentImageService;
  }));

  describe('addFile', function() {

    it('adds queryParams', function(done){
      var file = {
        name: 'a.jpg',
        type: 'image/jpeg'
      };

      mockDocument[0].location.href = 'path?a=b&c=d';

      service.addFile(file, function(err, url) {
        expect(url).toEqual('a.jpg?a=b&c=d');
        expect(err).toEqual(null);
        done();
      }, jasmine.createSpy('onProgress'));

      uploadOpts.onUploadComplete();
    });

    it('calls onComplete with a url that has been uri encoded', function(done) {
      
      var file = {
        name: 'a#b?c d.jpg',
        type: 'image/jpeg'
      };

      service.addFile(file, function(err, url) {
        expect(url).toEqual('a%23b%3Fc%20d.jpg');
        expect(err).toEqual(null);
        done();
      }, jasmine.createSpy('onProgress'));

      uploadOpts.onUploadComplete();
    });

    it('calls onComplete with an error message', function(done) {

      var file = {
        name: 'bad.jpg',
        type: 'image/jpeg'
      };

      service.addFile(file, function(err, url) {
        expect(err).toEqual(service.errorMessage);
        expect(url).toBe(undefined);
        done();
      }, jasmine.createSpy('onProgress'));

      uploadOpts.onUploadFailed();

    });
  });

});