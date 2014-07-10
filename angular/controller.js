/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'

var ausgabenmanager = angular.module('appAusgabenmanager', ['ui.bootstrap', 'ausgabenmanagerControllers', 'ausgabenmanagerServices']);
ausgabenmanager.run(function ($rootScope) {
	$rootScope.isUserLoggedIn = false;
	$rootScope.userData = null;
	$rootScope.rootDomain = 'http://info.fhoffma.net/services';
});
var ausgabenmanagerControllers = angular.module('ausgabenmanagerControllers', []);
ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, userService, $rootScope, $log) {
		$scope.Ausgaben = [];
		$scope.Ausgabenzeitraeume = [];
		$scope.orderProp = "Name";

		$scope.showAusgaben = function () {
			return userService.isUserLoggedIn();
		}

		$scope.neueAufgabeModal = function (size) {
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

		$scope.loginModal = function (size) {
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
				if (user != null) {
					$rootScope.userData = user;
					$rootScope.$apply();
				}
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

		//watch the rootScope User and check if he is logged in!
		$rootScope.$watch('isUserLoggedIn', function (newValue, oldValue, scope) {
			if (newValue && newValue !== oldValue) {
				$log.info("New value detected: isUserLoggedIn: " + newValue)
				getAusgaben();
				getAusgabenzeitraeume();
			} else {
				$log.info("Old value detected: isUserLoggedIn: " + oldValue)
			}
		});

		//StartUp Methode
		$scope.$watch('$viewContentLoaded', function () {
			userService.tryLogin().then(function (data) {
				$log.info('User found in Cookie');
			}, function (errorMsg) {
				$log.info(errorMsg)
				$scope.loginModal();
			});

		});

		function getAusgaben() {
			$http.get($rootScope.rootDomain + '/ausgaben/getausgaben?uid=' + $rootScope.userData.UserId,
				{cache: false})
				.success(function (data) {
					$scope.Ausgaben = data;
				})
				.error(function (data, status, headers) {
					alert('Fehler beim Datenabruf der Ausgaben... :(');
				});
		}

		function getAusgabenzeitraeume() {
			$http.get($rootScope.rootDomain + '/Ausgabenzeitraum/GetAusgabenzeitraeume?uid=' + $rootScope.userData.UserId,
				{cache: false})
				.success(function (data) {
					$scope.Ausgabenzeitraeume = data;
				})
				.error(function (data, status, headers) {
					alert('Fehler beim Datenabruf der getAusgabenzeitraeume... :(');
				});

		}
	}
)
;
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
			alert('Error: ' + JSON.stringify(error));
		})

	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});

var ausgabenmanagerServices = angular.module('ausgabenmanagerServices', [])
	.factory('AusgabenService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
	}])
	.factory('AusgabenzeitraumService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
	}])
	.factory('userService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
		var currentUserId = "";
		var getUserId = function () {
			return app.common.utils.readCookie('userid');
		}
		var tryLoginByCookie = function () {
			var deferred = $q.defer();
			currentUserId = getUserId();
			currentUserId = 'Testadress@gmail.com';
			if (currentUserId != null && currentUserId.length > 0) {
				logIn(currentUserId).then(function (user) {
					deferred.resolve(true);
				}, function (reason) {
					deferred.reject('Error: ' + reason);
				});
				;
			} else {
				deferred.reject('No UserId in Cookie found');
			}
			return deferred.promise;


		}
		var logIn = function (uId) {
			var deferred = $q.defer();

			$http.post($rootScope.rootDomain + "/users/SignIn",
				{
					UserId: uId
				},
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					$rootScope.userData = data;
					$rootScope.isUserLoggedIn = true;

					deferred.resolve($rootScope.userData);
				})
				.error(function (data, status, headers) {
					$rootScope.isUserLoggedIn = false;

					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		return {
			login: function (uid) {
				return logIn(uid);
			},
			isUserLoggedIn: function () {
				return $rootScope.isUserLoggedIn;
			},
			tryLogin: function () {
				return tryLoginByCookie();
			}
		};
	}]);
