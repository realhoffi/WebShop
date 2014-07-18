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

    var maxCountFailCount = 3;
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
    $rootScope.$watch('$viewContentLoaded', function () {
        $log.info('--WATCH--$viewContentLoaded-- ' + new Date());

        userService.tryLogin().then(function (data) {
            $log.info('--WATCH--$viewContentLoaded--: User found in Cookie: ' + JSON.stringify(data));
        }, function (errorMsg) {
            $log.info("--WATCH--$viewContentLoaded--ERROR: " + JSON.stringify(errorMsg))
            $scope.loginModal();
        });
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