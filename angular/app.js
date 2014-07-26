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
}
(jQuery)

var ausgabenmanager = angular.module('ausgabenmanager', ['ngRoute', 'ui.bootstrap', 'ausgabenmanagerControllers', 'ausgabenmanagerServices']);
ausgabenmanager.run(function ($rootScope, $log, userService) {

	var maxCountFailCount = 3;
	var errorFunctionCleanUp = function () {
		$rootScope.needLoginPage = true;
		$rootScope.isUserLoggedIn = false;
		$rootScope.userData = null;
		$rootScope.isAppLoading = false;
	}

	$rootScope.isAppLoading = true;
	$rootScope.needLoginPage = false;
	$rootScope.isUserLoggedIn = false;
	$rootScope.userData = userService.getCurrentUser();
	$rootScope.maxFailCounter = 3;
	$rootScope.rootDomain = 'http://info.fhoffma.net/services';
	$rootScope.spinner = null;
	$rootScope.currency = " €";

	$log.info("rootScope settings done");

	$rootScope.showSpinner = function () {
		if (!$rootScope.spinner) {
			$rootScope.spinner = app.common.utils.getSpinnerInstance();
		}
		$rootScope.spinner.spin(document.getElementById("mainForm"));
	}
	$rootScope.hideSpinner = function () {
		if ($rootScope.spinner)
			$rootScope.spinner.stop();
	}
	$rootScope.resetFailCounter = function () {
		$rootScope.maxFailCounter = maxCountFailCount;
	}

	$rootScope.$watch(function () {
		return userService.getCurrentUser();
	}, function (data, b, c) {
		$rootScope.userData = data;
		if (data != null && data != b) {
			if (b != null && b.UserId == data.UserId) {
				$log.info("Found Userdata old = userdate new");
			} else {
				$rootScope.isUserLoggedIn = true;
				$rootScope.isAppLoading = false;
				$rootScope.resetFailCounter();
			}
		}
	}, true);

	//StartUp Method to try Login! If not possible, SignIn command windows opens
	$rootScope.$watch('$viewContentLoaded', function () {
		$log.info('--WATCH--$viewContentLoaded-- ' + new Date());
		$log.info('- call tryLogin -');
		if (userService.getUserId()) {
			$log.info('--WATCH--$viewContentLoaded-- ' + new Date());
			userService.tryLogin().then(function (data) {
				$log.info('--WATCH--$viewContentLoaded--: User found in Cookie: ' + JSON.stringify(data));
			}, function (errorMsg) {
				$log.info("--WATCH--$viewContentLoaded--ERROR: " + JSON.stringify(errorMsg))
				errorFunctionCleanUp();
			});
		} else {
			errorFunctionCleanUp();
		}
	});
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
			when('/ausgabenBericht', {
				templateUrl: '../partials/ausgabenBericht.html',
				controller: 'ausgabenCtrl'
			}).
			when('/favoritenOverview', {
				templateUrl: '../partials/favoritenOverview.html',
				controller: 'favoriteCtrl'
			}).
			when('/fileOverview', {
				templateUrl: '../partials/fileOverview.html',
				controller: 'fileCtrl'
			}).
			otherwise({
				redirectTo: '/angulartest.html'
			});
	}]);


ausgabenmanager.filter('groupby', function () {
	return function (items, group) {
		return items.filter(function (element, index, array) {
			return element.Ausgabezeitraum == group;
		});
	}
})
