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
						$log.info('loginModal 1');
						return "";
					}
				}
			});

			modalInstance.result.then(function (user) {
				if (user != null) {
					$log.info('Received Data LogIn Modal 2: ' + user);
					//	alert(JSON.stringify(user));
					//$rootScope.userData = user;
					//$rootScope.$apply();
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

		$rootScope.$watch('userData', function (newValue, oldValue, scope) {
			$log.info('--WATCH--userData-- ' + new Date());
			if (newValue && newValue !== oldValue) {
				$log.info("--WATCH--userData-- New value detected: userData: " + newValue)
				getAusgaben();
				getAusgabenzeitraeume();
			} else {
				$log.info("--WATCH--userData-- Old value detected: userData: " + oldValue)
			}
		});

		//StartUp Methode
		$scope.$watch('$viewContentLoaded', function () {
			$log.info('--WATCH--$viewContentLoaded-- ' + new Date());
			userService.tryLogin().then(function (data) {
				$log.info('--WATCH--$viewContentLoaded--: User found in Cookie: ' + JSON.stringify(data));
			}, function (errorMsg) {
				$log.info("--WATCH--$viewContentLoaded--ERROR: " + JSON.stringify(errorMsg))
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
	$scope.Heading = {Register: 'Register', Login: 'Sign in'};
	$scope.selectedHeading = function () {
		return  $scope.getHeadingByStatus($scope.userClickedRegistered);
	}
	$scope.getHeadingByStatus = function (b) {
		return b ? $scope.Heading.Register : $scope.Heading.Login;
	}
	$scope.newUser = userService.getEmptyUser();
	$scope.item = {name: ""};
	$scope.userClickedRegistered = false;
	$scope.ok = function () {
		if ($scope.userClickedRegistered) {
			userService.register($scope.newUser).then(
				function (newuser) {
					$modalInstance.close(newuser);
				},
				function (error) {
					alert('Error: ' + JSON.stringify(error));
				});
		} else {
			userService.login($scope.item.name).then(function (loggedUser) {
				$modalInstance.close(loggedUser);
			}, function (error) {
				alert('Error: ' + JSON.stringify(error));
			})
		}
	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
	$scope.isUserRegistered = function () {
		return $scope.userClickedRegistered;
	}
	$scope.register = function () {
		$scope.userClickedRegistered = !$scope.userClickedRegistered;
		$scope.selectedHeading();
	}


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
		var getEmptyUser = function () {
			return    {
				//"Created": null,
				"Email": "",
				"ID": 0,
				//"LastModified": null,
				"Nachname": "",
				"UserId": app.common.utils.guid.getEmptyGuid(),
				"Vorname": ""}

		}
		var iRegister = function (user) {
			var deferred = $q.defer();
			$http.post($rootScope.rootDomain + "/users/Register",
				user
				,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					$rootScope.userData = data;
					deferred.resolve($rootScope.userData);
				})
				.error(function (data, status, headers) {
					$rootScope.isUserLoggedIn = false;
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
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
			},
			getEmptyUser: function () {
				return getEmptyUser();
			},
			register: function (user) {
				return iRegister(user);
			}
		};
	}]);
