/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'

var ausgabenmanagerControllers = angular.module('ausgabenmanagerControllers', []);

ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, $rootScope, $log, $timeout, userService, AusgabenService, AusgabenzeitraumService, PrioritaetService) {

		$scope.Ausgaben = AusgabenService.getAusgabenCached();
		$scope.Ausgabenzeitraeume = [];
		$scope.Prioritaeten = [];
		$scope.orderProp = "Name";

		$scope.deleteAusgabe = function (ausgabe) {
			if (confirm("Wirklich löschen?")) {
				AusgabenService.deleteAusgabe(ausgabe)
					.then(function (data) {
						$log.info('Ausgabe erfolgreich gelöscht');
					}, function (error) {
						alert('FEHLER: Ausgabe NICHT gelöscht: ' + error)
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
					$timeout(function () {
						//Check if UserId=null, if yes, redirect to current Page, maximum is maxFailcounter!
						$log.info($rootScope.userData.UserId);
						if ($rootScope.userData.UserId == 'undefined' || $rootScope.userData.UserId == undefined || $rootScope.userData.UserId.length == 0) {
							$log.info('USERDATA undefined. Redirect to Page again');
							if ($rootScope.maxFailCounter > 0) {
								$rootScope.maxFailCounter--;
								window.location.href = window.location.href;
							}
						}
						$rootScope.resetFailCounter();

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

					}, 500);

				} else {
					$log.info("--WATCH--userData--NOT UPDATE NEEDED");
				}
			} else {
				$log.info("--WATCH--userData-- Old value discovered: userData: " + JSON.stringify(oldValue))
			}
		});
	}
);
ausgabenmanagerControllers.controller('userCtrl', function ($scope, $modal, $http, $rootScope, $log, userService) {
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
		var valResult = app.common.utils.validateForm($event.currentTarget);
		if (!valResult) {
			alert('not validated...');
			return;
		}
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
	$scope.newUser = userService.getEmptyUser();
	$scope.item = {name: ""};
	$scope.userClickedRegistered = false;

	$scope.Heading = {Register: 'Register', Login: 'Sign in', Logout: 'Sign Out'};
	$scope.selectedHeading = function () {
		return  $scope.getHeadingByStatus($scope.userClickedRegistered);
	}
	$scope.getHeadingByStatus = function (b) {
		return b ? $scope.Heading.Register : $scope.Heading.Login;
	}
	$scope.checkValidation = function () {
		if ($scope.userClickedRegistered) {
			return this.formRegister.$invalid;
		} else {
			return this.formLogin.$invalid;
		}
	}

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
		var isValid = app.common.utils.validateForm($event.currentTarget);
		if (!isValid)return false;
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


