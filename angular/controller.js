/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'
var ausgabenmanager = angular.module('appAusgabenmanager', ['ui.bootstrap', 'ausgabenmanagerControllers', 'ausgabenmanagerServices']);
ausgabenmanager.run(function ($rootScope, $log) {
	$rootScope.isUserLoggedIn = false;
	$rootScope.userData = null;
	$rootScope.rootDomain = 'http://info.fhoffma.net/services';
	$log.info("rootScope settings done");
});
var ausgabenmanagerControllers = angular.module('ausgabenmanagerControllers', []);

ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, $rootScope, $log, userService, AusgabenService, AusgabenzeitraumService, PrioritaetService) {

		$scope.Ausgaben = AusgabenService.getAusgabenCached();
		$scope.Ausgabenzeitraeume = [];
		$scope.Prioritaeten = [];
		$scope.orderProp = "Name";

		$scope.deleteAusgabe = function (ausgabe) {
			if (confirm("Wirklich löschen?")) {
				AusgabenService.deleteAusgabe(ausgabe)
					.then(function (data) {
						alert(data);
					}, function (error) {
						alert(error)
					});
			}
		}
		$scope.editAusgabe = function (ausgabe) {
			ausgabe.Beschreibung = "Test";
			ausgabe.Name = "Done ID" + ausgabe.ID;
			AusgabenService.updateAusgabe(ausgabe);
		}
		$scope.findAusgabezeitraumById = function (ausgabe) {

			for (var i = 0; i < $scope.Ausgabenzeitraeume.length; i++) {
				if ($scope.Ausgabenzeitraeume[i].ID == ausgabe.Ausgabezeitraum) {
					return $scope.Ausgabenzeitraeume[i].Name;
				}
			}
		}
		$scope.findPrioritaetById = function (ausgabe) {

			for (var i = 0; i < $scope.Prioritaeten.length; i++) {
				if ($scope.Prioritaeten[i].ID == ausgabe.Prioritaet) {
					return $scope.Prioritaeten[i].Titel;
				}
			}
		}

		$scope.isUserLoggedIn = function () {
			return userService.isUserLoggedIn();
		}
		$scope.neueAusgabeModal = function (size, typ, ausgab) {
			var modalInstance = $modal.open({
				templateUrl: '../partials/newAusgabe.html',
				controller: 'ModalNeueAusgabeController',
				size: size,
				scope: $scope,
				resolve: {
					ausgabezeitraeume: function () {
						return $scope.Ausgabenzeitraeume;
					},
					priorities: function () {
						return $scope.Prioritaeten;
					},
					type: function () {
						return typ;
					},
					ausgabe: function () {
						return ausgab;
					}
				}
			});

			modalInstance.result.then(function (selectedItem) {
//MUST CALL THIS BECAUSE IF ARRAY IS NULL, IT DOES NOT GET UPDATED -.-
				if ($scope.Ausgaben.length == 0) {
					$scope.Ausgaben = AusgabenService.getAusgabenCached();
				}

			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};

		//Startup Method which watches, if the userdata changes
		//it changes when A) a new user sign in or B) when the user is logged in
		$rootScope.$watch('userData', function (newValue, oldValue, scope) {
			$log.info('--WATCH--userData-- ' + new Date());
			if (newValue && newValue != oldValue) {
				$log.info("--WATCH--userData-- Discover new value userData: " + JSON.stringify(newValue));
				if (!oldValue || (oldValue && newValue.UserId && newValue.UserId != oldValue.UserId)) {
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
					PrioritaetService.getPrioritaeten().then(function (data) {
						if (data != null) {
							$scope.Prioritaeten = data;
							$log.info('Received Data PrioritaetService: ' + JSON.stringify(data));
						}
					}, function (error) {
						$log.info("Error at getPrioritaeten() (" + new Date() + "): --> " + error);
					});

				} else {
					$log.info("--WATCH--userData--NOT UPDATE NEEDED");
				}
			} else {
				$log.info("--WATCH--userData-- Old value discovered: userData: " + JSON.stringify(oldValue))
			}
		});

		//StartUp Method to try Login! If not possible, SignIn command windows opens
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
ausgabenmanagerControllers.controller('userCtrl', function ($scope, $modal, $http, $rootScope, $log, userService) {
	$scope.MyUser = function () {
		return userService.getCurrentUser();
	}
	$scope.isUserLoggedIn = function () {
		return userService.isUserLoggedIn();
	}
	$scope.logout = function () {
		$rootScope.isUserLoggedIn = false;
		$rootScope.userData = null;
	}
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
});
ausgabenmanagerControllers.controller('ModalNeueAusgabeController', function ($scope, $modalInstance, $rootScope, ausgabezeitraeume, priorities, AusgabenService, type, ausgabe) {
	var type = type;
	$scope.ausgabe = null;
	if (type == 'new') {
		$scope.ausgabe = AusgabenService.getEmptyAusgabe();
	} else if (type == 'edit') {
		$scope.ausgabe = ausgabe;
	} else {
		alert("Type not found");
	}

	$scope.ausgabezeitraum = ausgabezeitraeume;
	$scope.priorities = priorities;
	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		if (type == 'new') {
			$scope.ausgabe.UserId = $rootScope.userData.UserId;
			AusgabenService.addNeueAusgabe($scope.ausgabe)
				.then(function (data) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					$modalInstance.close(data);
				}, function (error) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					alert('Error: ' + JSON.stringify(error));
				}
			);
		} else if (type == 'edit') {
			AusgabenService.updateAusgabe($scope.ausgabe)
				.then(function (data) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					$modalInstance.close(data);
				}, function (error) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					alert('Error: ' + JSON.stringify(error));
				}
			);
		}

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
	.factory('AusgabenService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
		var ausgaben = null;
		var indexGetById = function (id) {
			for (var i = 0; i < ausgaben.length; i++) {
				if (ausgaben[i].ID == id) {
					return i;
				}
			}
			return null;
		};
		var iGetById = function (id) {
			for (var i = 0; i < ausgaben.length; i++) {
				if (ausgaben[i].ID == id) {
					return ausgaben[i];
				}
			}
			return null;
		};
		var getAusgabeById = function (id) {
			var deferred = $q.defer();
			if (ausgaben) {
				var p = iGetById(id);
				deferred.resolve(p);
			} else {
				deferred.resolve(null);
			}

			return deferred.promise;
		}
		var getAusgaben = function () {
			var deferred = $q.defer();
			if (ausgaben) {
				$log.info("AusgabenService are cached");
				deferred.resolve(ausgaben);
			} else {
				$log.info("AusgabenService HTTP Call!");
				$http.get($rootScope.rootDomain + '/ausgaben/getausgaben?uid=' + $rootScope.userData.UserId,
					{
						cache: false
					})
					.success(function (data) {
						$log.info("AusgabenService HTTP success!");
						ausgaben = data;
						deferred.resolve(ausgaben);
					})
					.error(function (data, status, headers) {
						$log.error("AusgabenService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('Fehler beim Datenabruf der Ausgaben... :(');
					});
			}
			return deferred.promise;
		}
		var addNewAusgabe = function (ausgabe) {
			var deferred = $q.defer();
			$http.post($rootScope.rootDomain + "/ausgaben/CreateAusgabe?uid=" + $rootScope.userData.UserId,
				ausgabe,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (ausgaben.length == 0) {
						ausgaben = [];
					}
					ausgaben.push(data);
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
				"UserId": app.common.utils.guid.getEmptyGuid(),
				"Preis": 0,
				"Prioritaet": 0

			};
		}
		var updateAusgabe = function (ausgabe) {
			var deferred = $q.defer();
			$http.put($rootScope.rootDomain + "/ausgaben/UpdateAusgabenDetails?uid=" + $rootScope.userData.UserId,
				ausgabe,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (data) {
						var ausg = iGetById(data.ID);
						deferred.resolve(ausg);
					} else {
						deferred.reject('Error: Ausgabe intern nicht gefunden!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var deleteAusgabe = function (ausgabe) {
			var deferred = $q.defer();
			$http.delete($rootScope.rootDomain + "/ausgaben/DeleteAusgabe?uid=" + $rootScope.userData.UserId,
				{
					data: ausgabe,
					headers: {
						"Content-Type": "application/json"
					},
					method: 'DELETE',
					dataType: 'json'

				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(ausgabe.ID)
						ausgaben.splice(indx, 1);
						deferred.resolve(data);
					} else {
						deferred.reject('Error: Ausgabe nicht gelöscht!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
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
			},
			updateAusgabe: function (ausgabe) {
				return updateAusgabe(ausgabe);
			},
			getAusgabeById: function (id) {
				return getAusgabeById(id);
			},
			deleteAusgabe: function (ausgabe) {
				return deleteAusgabe(ausgabe)
			},
			getAusgabenCached: function () {
				return ausgaben;
			}

		};
	}])
	.factory('AusgabenzeitraumService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
		var ausgabenzeitraeume;
		var getAusgabenzeitraeume = function () {
			var deferred = $q.defer();
			if (ausgabenzeitraeume) {
				$log.info("AusgabenzeitraumService are cached");
				deferred.resolve(ausgabenzeitraeume);
			} else {
				$log.info("AusgabenzeitraumService HTTP Call!");
				$http.get($rootScope.rootDomain + '/Ausgabenzeitraum/GetAusgabenzeitraeume?uid=' + $rootScope.userData.UserId,
					{cache: false})
					.success(function (data) {
						$log.info("AusgabenzeitraumService HTTP success!");
						ausgabenzeitraeume = data;
						deferred.resolve(ausgabenzeitraeume);
					})
					.error(function (data, status, headers) {
						$log.error("AusgabenzeitraumService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('Fehler beim Datenabruf der getAusgabenzeitraeume... :(');
					});
			}

			return deferred.promise;
		}

		return{
			getAusgabenzeitraeume: function () {
				return getAusgabenzeitraeume();
			}
		}
	}])
	.factory('PrioritaetService', ['$http', '$q', '$rootScope', '$log', '$timeout', function ($http, $q, $rootScope, $log, $timeout) {
		var prioritaeten;
		var iGetById = function (id) {
			for (var i = 0; i < prioritaeten.length; i++) {
				if (prioritaeten[i].ID == id) {
					return prioritaeten[i];
				}
			}
			return null;
		};
		var getPrioritaeten = function () {
			var deferred = $q.defer();
			if (prioritaeten) {
				$log.info("PrioritaetService are cached");
				deferred.resolve(prioritaeten);
			} else {
				$log.info("PrioritaetService HTTP Call!");
				$http.get($rootScope.rootDomain + '/Prioritaeten/GetPrioritaeten?uid=' + $rootScope.userData.UserId,
					{cache: false})
					.success(function (data) {
						$log.info("PrioritaetService HTTP success!");
						prioritaeten = data;
						deferred.resolve(prioritaeten);
					})
					.error(function (data, status, headers) {
						$log.error("AusgabenzeitraumService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('Fehler beim Datenabruf der getAusgabenzeitraeume... :(');
					});
			}
			return deferred.promise;
		}
		var getPrioritaetById = function (id) {
			var deferred = $q.defer();

			if (prioritaeten) {
				$log.info("PrioritaetService are cached");
				var p = iGetById(id);
				deferred.resolve(p);
			} else {
				$http.get($rootScope.rootDomain + '/Prioritaeten/GetPrioritaetById?pid=' + id,
					{cache: false})
					.success(function (data) {
						deferred.resolve(data);
					})
					.error(function (data, status, headers) {
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('Fehler beim Datenabruf der getPrioritaetById... :(');
					});
			}


			return deferred.promise;
		}
		return{
			getPrioritaeten: function () {
				return getPrioritaeten();
			},
			getPrioritaetById: function (id) {
				return getPrioritaetById(id);
			}
		}
	}])
	.factory('userService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
		var currentUserId = "";
		var thisUser;
		var isThisUserLoggedIn = false;
		var getUserId = function () {
			return getCurrentUser() ? getCurrentUser().UserId : app.common.utils.readCookie('userid');
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
					$rootScope.isUserLoggedIn = true;
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
					$log.info('tryLoginByCookie success! UserData: ' + JSON.stringify(user));
					deferred.resolve(true);
				}, function (reason) {
					$log.error("tryLoginByCookie error: " + reason);
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
					$log.info('logIn success! UserData: ' + JSON.stringify(data));
					$rootScope.userData = data;
					$rootScope.isUserLoggedIn = true;
					deferred.resolve($rootScope.userData);
				})
				.error(function (data, status, headers) {
					$log.error("tryLoginByCookie error: " + data);
					$rootScope.isUserLoggedIn = false;
					$rootScope.userData = null;
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
