// module: corespring.scoring-utils


var def = [ '$log', function($log){

	var link = function(scope, elem, attrs){
		$log.debug("i'm a directive test");
	};

	return {
		restrict: 'AE',
		template: '<h1>Hello</h1>',
		link: link
	}
}];

exports.framework = "angular";
exports.directive = { name: "directiveTest", directive: def };