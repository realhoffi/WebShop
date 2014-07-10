/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'

var ausgabenmanager = angular.module('appAusgabenmanager', ['ui.bootstrap', 'ausgabenmanagerControllers', 'ausgabenmanagerServices']);

var ausgabenmanagerControllers = angular.module('ausgabenmanagerControllers', []);
ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, $templateCache, userService) {
	$scope.rootDomain = 'http://info.fhoffma.net/services';
	$scope.currentUser = null;
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
				user: function () {
					return "";
				}
			}
		});

		modalInstance.result.then(function (user) {
			if (user != null)
				$scope.currentUser = user;
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

	$scope.updateAusgabe = function (a, b) {
		for (var i = 0; i < $scope.Ausgabenzeitraeume.length; i++) {
			if ($scope.Ausgabenzeitraeume[i].ID == a) {
				b.AusgabezeitraumObject = $scope.Ausgabenzeitraeume[i];
			}
		}
	}

	$scope.$watch('currentUser', function () {
		if ($scope.currentUser) {
			getAusgaben();
			getAusgabenzeitraeume();
		}
	});

	var b = userService.login('Testadress@gmail.com');
	b.then(function (user) {
		$scope.currentUser = user;
	}, function (reason) {
		alert('Failed: ' + reason);
	}, function (update) {
		alert('Got notification: ' + update);
	});

	function getAusgaben() {
		$http.get($scope.rootDomain + '/ausgaben/getausgaben?uid=' + $scope.currentUser.UserId,
			{cache: false})
			.success(function (data) {
				$scope.Ausgaben = data;
			})
			.error(function (data, status, headers) {
				alert('Fehler beim Datenabruf der Ausgaben... :(');
			});
	}

	function getAusgabenzeitraeume() {
		$http.get($scope.rootDomain + '/Ausgabenzeitraum/GetAusgabenzeitraeume?uid=' + $scope.currentUser.UserId,
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
ausgabenmanagerControllers.controller('ModalLogInController', function ($scope, $modalInstance, userService, user) {
	$scope.item = {};

	$scope.ok = function () {
		userService.login($scope.item.name).then(function (loggedUser) {
			$modalInstance.close(loggedUser);
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
			}
			deferred.notify('No Cookie found: ');
			$http.post(rootDomain + "/users/SignIn",
				{
					UserId: uId
				},
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					userData = data;
					isLoggedIn = true;
					deferred.resolve(userData);
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
