/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'
var ausgabenmanager = angular.module('appAusgabenmanager', ['ui.bootstrap']);

ausgabenmanager.controller('ausgabenCtrl', function ($scope, $http) {
	$scope.rootDomain = 'http://info.fhoffma.net/services';
	$scope.userId;
	$scope.Ausgaben = [];
	$scope.Ausgabenzeitraeume = [];
	$scope.orderProp = "Name";


	LogIn();
	$scope.updateAusgabe = function (a, b) {
		for (var i = 0; i < $scope.Ausgabenzeitraeume.length; i++) {
			if ($scope.Ausgabenzeitraeume[i].ID == a) {
				b.AusgabezeitraumObject = $scope.Ausgabenzeitraeume[i];
			}
		}
	}

	$scope.$watch('userId', function () {
		if ($scope.userId) {
			getAusgaben();
			getAusgabenzeitraeume();
		}
	});

	function getAusgaben() {
		$http.get($scope.rootDomain + '/ausgaben/getausgaben?uid=' + $scope.userId,
			{cache: false})
			.success(function (data) {
				$scope.Ausgaben = data;
			})
			.error(function (data, status, headers) {
				alert('Fehler beim Datenabruf der Ausgaben... :(');
			});
	}

	function getAusgabenzeitraeume() {
		$http.get($scope.rootDomain + '/Ausgabenzeitraum/GetAusgabenzeitraeume?uid=' + $scope.userId,
			{cache: false})
			.success(function (data) {
				$scope.Ausgabenzeitraeume = data;
			})
			.error(function (data, status, headers) {
				alert('Fehler beim Datenabruf der Ausgaben... :(');
			});

	}

	function LogIn() {
		var c = app.common.utils.readCookie('userid');
		if (c && c.length > 0) {
			$scope.userId = c;
		} else {
			$http.post($scope.rootDomain + "/users/SignIn",
				JSON.stringify({UserId: 'Testadress@gmail.com'}),
				{dataType: 'json', contentType: "application/json; charset=utf-8"})
				.success(function (data) {
					$scope.userId = data;
				}).
				error(function (data, status, headers) {
					alert('Fehler beim LogIn... :(');
				});
		}
	}
});