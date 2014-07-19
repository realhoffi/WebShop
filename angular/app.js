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
//	$("form.input").click(function (e) {
//		alert(':(');
//		e.preventDefault();
//	});

}
(jQuery)

var ausgabenmanager = angular.module('ausgabenmanager', ['ngRoute', 'ui.bootstrap', 'ausgabenmanagerControllers', 'ausgabenmanagerServices']);
ausgabenmanager.run(function ($rootScope, $log, userService) {
	$rootScope.spinner;
	$rootScope.showSpinner = function () {
		var opts = {
			lines: 11, // The number of lines to draw
			length: 0, // The length of each line
			width: 27, // The line thickness
			radius: 60, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 44, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1, // Rounds per second
			trail: 100, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: '40%', // Top position relative to parent
			left: '50%' // Left position relative to parent
		};
		var target = document.getElementById('mainForm');
		$rootScope.spinner = new Spinner(opts).spin(target);
	}
	$rootScope.hideSpinner = function () {
		$rootScope.spinner.stop();
	}
	var maxCountFailCount = 3;
	$rootScope.isAppLoading = true;
	$rootScope.needLoginPage = false;
	$rootScope.isUserLoggedIn = false;
	$rootScope.userData = null;
	$rootScope.maxFailCounter = maxCountFailCount;
	$rootScope.rootDomain = 'http://info.fhoffma.net/services';
	$log.info("rootScope settings done");
	$rootScope.resetFailCounter = function () {
		$rootScope.maxFailCounter = maxCountFailCount;
	}
	$rootScope.checkUserData = function () {
		$log.info('checkUserData is called. FALSE = GOOD, TRUE = BAD  :()');
		var retVal = (!$rootScope.userData || $rootScope.userData.UserId == 'undefined' ||
			$rootScope.userData.UserId == undefined || $rootScope.userData.UserId.length == 0);
		$log.info('checkUserData result: ' + retVal);
		return retVal;
	}
	//StartUp Method to try Login! If not possible, SignIn command windows opens
	$rootScope.$watch('$viewContentLoaded', function () {
		$log.info('--WATCH--$viewContentLoaded-- ' + new Date());
		$log.info('- call tryLogin -');
		userService.tryLogin()
			.then(function (a) {
				$rootScope.isAppLoading = false;
			}, function (error) {
				alert(error);
				$rootScope.isAppLoading = false;
			});
		//Auskommentiert zum testen :)
//        if (userService.getUserId) {
//            $log.info('--WATCH--$viewContentLoaded-- ' + new Date());
//            userService.tryLogin().then(function (data) {
//                $log.info('--WATCH--$viewContentLoaded--: User found in Cookie: ' + JSON.stringify(data));
//            }, function (errorMsg) {
//                $log.info("--WATCH--$viewContentLoaded--ERROR: " + JSON.stringify(errorMsg))
//                $rootScope.needLoginPage = true;
//                $rootScope.userData = null;
//                return;
//            });
//        } else {
//            $rootScope.needLoginPage = true;
//            $rootScope.userData = null;
//            return;
//        }
	});

//EVENTS TO SHOW LOADING
	$rootScope.$on("$routeChangeStart", function (e) {
		//alert('1');
		$rootScope.$broadcast("loading-started");
	});
	$rootScope.$on("$routeChangeSuccess", function (e) {
		//alert('2');
		$rootScope.$broadcast("loading-complete");
	});
	$rootScope.$on("$routeChangeError", function (e) {
		//	alert('3');
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
//ausgabenmanager.config(function ($httpProvider) {
//	$httpProvider.interceptors.push(function ($q, $rootScope) {
//		return {
//			'request': function (config) {
//				$rootScope.$broadcast('loading-started');
//				return config || $q.when(config);
//			},
//			'response': function (response) {
//				$rootScope.$broadcast('loading-complete');
//				return response || $q.when(response);
//			}
//		};
//	});
//});
//ausgabenmanager.directive("loadingIndicator", function () {
//	return {
//		restrict: "A",
//		template: "<div class='alert alert-info'> LOADING </div>",
//		link: function (scope, element, attrs) {
//			scope.$on("loading-started", function (e) {
//				element.css({"display": ""});
//				//	alert('s');
//			});
//
//			scope.$on("loading-complete", function (e) {
//				//alert('h');
//				element.css({"display": "none"});
//			});
//
//		}
//	};
//});