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
  var fileReader;

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
    fileReader = window.FileReader;

    mockFileUploader = {
      beginUpload: jasmine.createSpy('beginUpload').and.callFake(function() {
        uploadOpts.onUploadComplete({}, 200);
      })
    };

    mockFileReader = {
      onloadend: null,
      readAsBinaryString: jasmine.createSpy('readAsBinaryString').and.callFake(function() {
        mockFileReader.onloadend();
      })
    };

    window.FileReader = function() {
      return mockFileReader;
    };

    window.com = {
      ee: {
        RawFileUploader: jasmine.createSpy('RawFileUploader::constructor').and.callFake(function(file, result, url, name, opts) {
          uploadOpts = opts;
          return mockFileUploader;
        })
      }
    };
  });

  afterEach(function() {
    window.FileReader = fileReader;
  });

  beforeEach(inject(function(ComponentImageService) {
    service = ComponentImageService;
  }));

  describe('addFile', function() {

    it('adds queryParams', function(done){
      var file = {
        name: 'a.jpg'
      };

      mockDocument[0].location.href = 'path?a=b&c=d';

      service.addFile(file, function(err, url) {
        expect(url).toEqual('a.jpg?a=b&c=d');
        expect(err).toEqual(null);
        done();
      }, jasmine.createSpy('onProgress'));

    });

    it('calls onComplete with a url that has _ instead of #', function(done) {

      var file = {
        name: 'a#b.jpg'
      };

      service.addFile(file, function(err, url) {
        expect(url).toEqual('a_b.jpg');
        expect(err).toEqual(null);
        done();
      }, jasmine.createSpy('onProgress'));
    });

    it('calls onComplete with an error message', function(done) {

      var file = {
        name: 'bad.jpg'
      };

      mockFileUploader.beginUpload.and.callFake(function() {
        uploadOpts.onUploadFailed();
      });

      service.addFile(file, function(err, url) {
        expect(err).toEqual(service.errorMessage);
        expect(url).toBe(undefined);
        done();
      }, jasmine.createSpy('onProgress'));

    });
  });

});