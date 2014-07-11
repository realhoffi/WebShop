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

ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, $rootScope, $log, userService, AusgabenService, AusgabenzeitraumService) {

		$scope.Ausgaben = [];
		$scope.Ausgabenzeitraeume = [];
		$scope.orderProp = "Name";

		$scope.MyUser = function () {
			return userService.getCurrentUser();
		}
		$scope.isUserLoggedIn = function () {
			return userService.isUserLoggedIn();
		}
		$scope.neueAufgabeModal = function (size) {
			var modalInstance = $modal.open({
				templateUrl: '../partials/newAusgabe.html',
				controller: 'ModalNeueAusgabeController',
				size: size,
				scope: $scope,
				resolve: {
					ausgabezeitraeume: function () {
						return $scope.Ausgabenzeitraeume;
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
				scope: $scope
			});

			modalInstance.result.then(function (user) {
				if (user != null) {
					$log.info('Received Data LogIn Modal 2: ' + user);
				}
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};
		$scope.editUser = function (size) {
			var modalInstance = $modal.open({
				templateUrl: '../partials/userDetails.html',
				controller: 'ModalUserController',
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
				}
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		}
		$scope.logout = function () {
			$rootScope.isUserLoggedIn = false;
			$rootScope.userData = null;
		}
		$scope.updateAusgabe = function (a, b) {
			for (var i = 0; i < $scope.Ausgabenzeitraeume.length; i++) {
				if ($scope.Ausgabenzeitraeume[i].ID == a) {
					b.AusgabezeitraumObject = $scope.Ausgabenzeitraeume[i];
				}
			}
		}

		//Startup Methode
		$rootScope.$watch('userData', function (newValue, oldValue, scope) {
			$log.info('--WATCH--userData-- ' + new Date());
			if (newValue && newValue != oldValue) {
				$log.info("--WATCH--userData-- Discover new value userData: " + JSON.stringify(newValue));
				if (!oldValue || (oldValue && newValue.UserId != oldValue.UserId)) {
					$log.info("--WATCH--userData--Discover Updated userData");
					AusgabenService.getAusgaben()
						.then(function (data) {
							if (data != null) {
								$scope.Ausgaben = data;
								$log.info('Received Data AusgabenService: ' + JSON.stringify(data));
							}
						}, function (error) {
							$log.info("Error at getAusgaben() (" + new Date() + "): --> " + error);
						});

					AusgabenzeitraumService.getAusgabenzeitraeume()
						.then(function (data) {
							if (data != null) {
								$scope.Ausgabenzeitraeume = data;
								$log.info('Received Data AusgabenzeitraumService: ' + JSON.stringify(data));
							}
						}, function (error) {
							$log.info("Error at getAusgabenzeitraeume() (" + new Date() + "): --> " + error);
						});

				} else {
					$log.info("--WATCH--userData--NOT UPDATE NEEDED");
				}
			} else {
				$log.info("--WATCH--userData-- Old value discovered: userData: " + JSON.stringify(oldValue))
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
	}
);
ausgabenmanagerControllers.controller('ModalNeueAusgabeController', function ($scope, $modalInstance, ausgabezeitraeume, AusgabenService) {
	$scope.ausgabe = AusgabenService.getEmptyAusgabe();
	$scope.ausgabezeitraum = ausgabezeitraeume;
	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		AusgabenService.addNeueAusgabe($scope.ausgabe)
			.then(function (data) {
				app.common.utils.setButtonLoadingStateReset($event.currentTarget);
				$modalInstance.close(data);
			}, function (error) {
				app.common.utils.setButtonLoadingStateReset($event.currentTarget);
				alert('Error: ' + JSON.stringify(error));
			}
		);

	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
ausgabenmanagerControllers.controller('ModalLogInController', function ($scope, $modalInstance, userService) {
	$scope.Heading = {Register: 'Register', Login: 'Sign in', Logout: 'Sign Out'};
	$scope.selectedHeading = function () {
		return  $scope.getHeadingByStatus($scope.userClickedRegistered);
	}
	$scope.getHeadingByStatus = function (b) {
		return b ? $scope.Heading.Register : $scope.Heading.Login;
	}

	$scope.newUser = userService.getEmptyUser();
	$scope.item = {name: ""};
	$scope.userClickedRegistered = false;
	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		if ($scope.userClickedRegistered) {
			userService.register($scope.newUser).then(
				function (newuser) {
					$modalInstance.close(newuser);
				},
				function (error) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					alert('Error: ' + JSON.stringify(error));
				});
		} else {
			userService.login($scope.item.name).then(function (loggedUser) {
				$modalInstance.close(loggedUser);
			}, function (error) {
				app.common.utils.setButtonLoadingStateReset($event.currentTarget);
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
ausgabenmanagerControllers.controller('ModalUserController', function ($scope, $modalInstance, userService) {
	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		userService.updateUser($scope.MyUser()).then(
			function (newuser) {
				app.common.utils.setButtonLoadingStateReset($event.currentTarget);
				$modalInstance.close(newuser);
			},
			function (error) {
				app.common.utils.setButtonLoadingStateReset($event.currentTarget);
				alert('Error: ' + JSON.stringify(error));
			});

	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
var ausgabenmanagerServices = angular.module('ausgabenmanagerServices', [])
	.factory('AusgabenService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
		var getAusgaben = function () {
			var deferred = $q.defer();
			$http.get($rootScope.rootDomain + '/ausgaben/getausgaben?uid=' + $rootScope.userData.UserId,
				{
					cache: false
				})
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(data));
					alert('Fehler beim Datenabruf der Ausgaben... :(');
				});
			return deferred.promise;
		}
		var addNewAusgabe = function (ausgabe) {
			var deferred = $q.defer();
			ausgabe.UserId = $rootScope.userData.UserId;
			$http.post($rootScope.rootDomain + "/ausgaben/CreateAusgabe?uid=" + $rootScope.userData.UserId,
				ausgabe,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var getEmptyAusgabe = function () {
			return {
				"Ausgabezeitraum": 0,
				"Beschreibung": "",
				"ID": 0,
				"Name": "",
				"UserId": app.common.utils.guid.getEmptyGuid()
			};
		}
		return{
			getAusgaben: function () {
				return getAusgaben();
			},
			getEmptyAusgabe: function () {
				return getEmptyAusgabe();
			},
			addNeueAusgabe: function (ausgabe) {
				return addNewAusgabe(ausgabe);
			}
		};
	}])
	.factory('AusgabenzeitraumService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
		var getAusgabenzeitraeume = function () {
			var deferred = $q.defer();
			$http.get($rootScope.rootDomain + '/Ausgabenzeitraum/GetAusgabenzeitraeume?uid=' + $rootScope.userData.UserId,
				{cache: false})
				.success(function (data) {
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(data));
					alert('Fehler beim Datenabruf der getAusgabenzeitraeume... :(');
				});

			return deferred.promise;
		}

		return{
			getAusgabenzeitraeume: function () {
				return getAusgabenzeitraeume();
			}
		}
	}])
	.factory('userService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
		var currentUserId = "";
		var getUserId = function () {
			return app.common.utils.readCookie('userid');
		}
		var getEmptyUser = function () {
			//REMOVE THIS BECAUSE OF SQL PARSING ERROR...:(
			//"Created": null,
			//"LastModified": null,
			return{
				"Email": "",
				"ID": 0,
				"Nachname": "",
				"UserId": app.common.utils.guid.getEmptyGuid(),
				"Vorname": ""
			}
		};
		var register = function (user) {
			var deferred = $q.defer();
			$http.post($rootScope.rootDomain + "/users/Register",
				user,
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
		var updateUser = function (user) {
			var deferred = $q.defer();
			$http.put($rootScope.rootDomain + "/users/UpdateUserDetails",
				user,
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
		var getCurrentUser = function () {
			return $rootScope.userData;
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
				return register(user);
			},
			getCurrentUser: function () {
				return getCurrentUser();
			},
			updateUser: function (user) {
				return updateUser(user);
			}
		};
	}]);
