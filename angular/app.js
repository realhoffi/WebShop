/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict';
if (typeof jQuery === 'undefined') {
	throw new Error('Bootstrap\'s JavaScript requires jQuery')
}
+function ($) {
	'use strict';
	$(document).on('click.bs.collapse', '[data-toggle=collapse]', function (e) {
		var b = $(e.currentTarget).find('span.indicator');
		var c = $(b).toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
	});
	$("form.input").click(function (e) {
		alert(':(');
		e.preventDefault();
	});

}
(jQuery)


var ausgabenmanager = angular.module('ausgabenmanager', ['ngRoute', 'ui.bootstrap', 'ausgabenmanagerControllers', 'ausgabenmanagerServices']);
ausgabenmanager.run(function ($rootScope, $log) {
	var maxCountFailCount = 3;
	$rootScope.isUserLoggedIn = false;
	$rootScope.userData = null;
	$rootScope.maxFailCounter = maxCountFailCount;
	$rootScope.resetFailCounter = function () {
		$rootScope.maxFailCounter = maxCountFailCount;
	}
	$rootScope.rootDomain = 'http://info.fhoffma.net/services';
	$log.info("rootScope settings done");
});

ausgabenmanager.config(['$routeProvider',
	function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '../partials/ausgabenOverview.html',
				controller: 'ausgabenCtrl'
			}).
			when('/ausgabenOverview', {
				templateUrl: '../partials/ausgabenOverview.html',
				controller: 'ausgabenCtrl'
			}).

			otherwise({
				redirectTo: '/angulartest.html'
			});
	}]);