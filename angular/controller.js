/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'

var ausgabenmanager = angular.module('appAusgabenmanager', ['ui.bootstrap', 'ausgabenmanagerControllers', 'ausgabenmanagerServices']);

var ausgabenmanagerControllers = angular.module('ausgabenmanagerControllers', []);
ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, $templateCache, userService) {
	$scope.rootDomain = 'http://info.fhoffma.net/services';
	$scope.userId = "";
	$scope.Ausgaben = [];
	$scope.Ausgabenzeitraeume = [];
	$scope.orderProp = "Name";

	$scope.OpenNeueAufgabe = function (size) {
		var modalInstance = $modal.open({
			templateUrl: '../partials/newAusgabe.html',
			controller: 'ModalNeueAufgabeController',
			size: size,
			scope: $scope,
			resolve: {
				item: function () {
					return {"Ausgabezeitraum": 0, "AusgabezeitraumObject": null, "Beschreibung": "", "Created": "", "ID": null, "LastModified": "", "Name": "", "UserId": "", "UserObject": null};
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			selectedItem != null && $scope.Ausgaben.push(selectedItem);
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

	$scope.LogIn = function (size) {
		var modalInstance = $modal.open({
			templateUrl: '../partials/logIn.html',
			controller: 'ModalLogInController',
			size: size,
			scope: $scope,
			resolve: {
			}
		});

		modalInstance.result.then(function (userId) {
			if (userId != null) $scope.userId = userId;
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

	//LogIn();
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

	var b = userService.login('Testadress@gmail.com');
	b.then(function (uid) {
		$scope.userId = uid;
	}, function (reason) {
		alert('Failed: ' + uid);
	}, function (update) {
		alert('Got notification: ' + update);
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
				alert('Fehler beim Datenabruf der getAusgabenzeitraeume... :(');
			});

	}

	function clearCache() {
		$templateCache.removeAll();
	}
});
ausgabenmanagerControllers.controller('ModalNeueAufgabeController', function ($scope, $modalInstance, item) {
	$scope.item = item;
	$scope.ausgaben = $scope.$parent.Ausgabenzeitraeume;
	$scope.ok = function () {
		$modalInstance.close($scope.item);
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
ausgabenmanagerControllers.controller('ModalLogInController', function ($scope, $modalInstance, userService) {
	$scope.userId;

	$scope.ok = function () {
		alert($scope.userId);
		userService.login($scope.userId).then(function (uid) {
			alert(':) ' + userService.isUserLoggedIn());
			$modalInstance.close(uid);
		}, function (error) {
			alert('error');
		}, function (n) {
			alert(n);
		})

	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

var ausgabenmanagerServices = angular.module('ausgabenmanagerServices', [])
	.factory('userService', ['$http', '$q', function ($http, $q) {
		var userId;
		var rootDomain = 'http://info.fhoffma.net/services';
		var isLoggedIn = false;
		var userData;
		var logIn = function (uId) {
			var deferred = $q.defer();
			var c = app.common.utils.readCookie('userid');
			if (c && c.length > 0) {
				deferred.notify('Found Cookie: ' + c);
				userId = c;
				isLoggedIn = true;
				deferred.resolve(userId);
			}
			deferred.notify('No Cookie found: ');
			$http.post(rootDomain + "/users/SignIn",

				{
					UserId: uId
				}
				,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					userId = data;
					isLoggedIn = true;
					deferred.resolve(userId);
				})
				.error(function (data, status, headers) {
					isLoggedIn = false;
					deferred.reject('fail');
				});
			return  deferred.promise;
		}
		return {
			login: function (uid) {
				return logIn(uid);
			},
			getUserId: function () {
				return userId;
			},
			isUserLoggedIn: function () {
				return isLoggedIn;
			}
		};
	}]);
