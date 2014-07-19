/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'

var ausgabenmanagerControllers = angular.module('ausgabenmanagerControllers', []);

ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, $rootScope, $log, $timeout, userService, AusgabenService, AusgabenzeitraumService, PrioritaetService) {
		$scope.Ausgaben = AusgabenService.getAusgabenCached();
		$scope.Ausgabenzeitraeume = AusgabenzeitraumService.getAusgabenzeitraeumeCached();
		$scope.Prioritaeten = PrioritaetService.getPrioritaetenCached();
		$scope.orderProp = "Name";
		$scope.gesamtAusgaben = function () {
			var sum = 0;
			if ($scope.Ausgaben) {
				for (var i = 0; i < $scope.Ausgaben.length; i++) {
					sum += $scope.Ausgaben[i].Preis;
				}
			}
			return sum;
		}
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
			if ($scope.Ausgabenzeitraeume) {
				for (var i = 0; i < $scope.Ausgabenzeitraeume.length; i++) {
					if ($scope.Ausgabenzeitraeume[i].ID == ausgabe.Ausgabezeitraum) {
						return $scope.Ausgabenzeitraeume[i].Name;
					}
				}
			}
		}
		$scope.findPrioritaetById = function (ausgabe) {
			if ($scope.Prioritaeten) {
				for (var i = 0; i < $scope.Prioritaeten.length; i++) {
					if ($scope.Prioritaeten[i].ID == ausgabe.Prioritaet) {
						return $scope.Prioritaeten[i].Titel;
					}
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
		//EDIT NEW! NO NEED TO CHECK USERDATA FOR CHANGE, SERVICES CACHE ITEMS!
		$rootScope.$watch('userData', function (newValue, oldValue, scope) {
				$log.info('--WATCH--userData-- ' + new Date());
				$log.info("--WATCH--userData-- Discover new value userData: " + JSON.stringify(newValue));
				$rootScope.userData ? $log.info($rootScope.userData.UserId) : $log.info('--WATCH ausgabenCtrl--userdata-- is NULL, exit function.');
				if (!$rootScope.userData)return;
				$timeout(function () {
					//Check if UserId=null, if yes, redirect to current Page, maximum is maxFailcounter!

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

				}, 200);
			}
		);
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
				$log.info('Received Data LogIn Result: ' + user);
				$rootScope.needLoginPage = false;
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
	$rootScope.$watch('needLoginPage', function (newValue, oldValue, scope) {
		if (newValue) {
			$scope.loginModal();
		}
	});
});
ausgabenmanagerControllers.controller('favoriteCtrl', function ($scope, $modal, $http, $rootScope, $log, $timeout, favoriteService) {
		$scope.Favoriten = [];
		$scope.manageFavorit = function (size, favorite, type) {
			if (type == 'delete') {
				if (confirm("Wirklich löschen?")) {
					favoriteService.deleteFavorite(favorite)
						.then(function (data) {
							$log.info('Ausgabe erfolgreich gelöscht');
						}, function (error) {
							alert('FEHLER: Ausgabe NICHT gelöscht: ' + error)
						});
				}
			} else if (type == 'edit' || type == 'new') {
				var modalInstance = $modal.open({
					templateUrl: '../partials/manageFavorite.html',
					controller: 'ModalFavoriteController',
					size: size,
					scope: $scope,
					resolve: {
						type: function () {
							return type;
						},
						favorite: function () {
							return favorite;
						}
					}
				});

				modalInstance.result.then(function (favorite) {
					//MUST CALL THIS BECAUSE IF ARRAY IS NULL, IT DOES NOT GET UPDATED -.-
					if ($scope.Favoriten.length == 0) {
						$scope.Favoriten = favoriteService.getFavoritenCached();
					}

					if (favorite != null) {
						$log.info('Received Data manageFavoriteController: ' + favorite);
					}
				}, function () {
					$log.info('Modal dismissed at: ' + new Date());
				});
			} else {
				alert("Action not found");
			}
		}
		$rootScope.$watch('userData', function (newValue, oldValue, scope) {
				$log.info('--WATCH--userData-- ' + new Date());
				$log.info("--WATCH--userData-- Discover userData: " + JSON.stringify(newValue));
				$rootScope.userData ? $log.info($rootScope.userData.UserId) : $log.info('--WATCH favoriteCtrl--userdata-- is NULL, exit function');
				if (!$rootScope.userData)return;
				$timeout(function () {
					favoriteService.getFavoriten()
						.then(function (data) {
							if (data != null) {
								$scope.Favoriten = data;
								$log.info('Received Data favoriteService: ' + JSON.stringify(data));
							}
						}, function (error) {
							$log.info("Error at getAusgaben() (" + new Date() + "): --> " + error);
						});
				}, 200);
			}
		);
	}
);
ausgabenmanagerControllers.controller('fileCtrl', function ($scope, $modal, $http, $rootScope, $log, $timeout, fileService) {
	$scope.Files = [];
	$scope.loadFile = function (file) {

		fileService.getFileByName(file).then(function (data) {
			$log.info('file erfolgreich geladen');
			alert(file.FileStreamData);
		}, function (error) {
			alert('FEHLER: file NICHT geladen: ' + error)
		});

		return false;
	}
	$scope.manageFile = function (size, file, type) {
		if (type == 'delete') {
			if (confirm("Datei wirklich löschen?")) {
				fileService.deleteFile(file)
					.then(function (data) {
						$log.info('file erfolgreich gelöscht');
					}, function (error) {
						alert('FEHLER: file NICHT gelöscht: ' + error)
					});
			}
		} else if (type == 'edit' || type == 'new') {
			var modalInstance = $modal.open({
				templateUrl: '../partials/manageFile.html',
				controller: 'ModalFileController',
				size: size,
				scope: $scope,
				resolve: {
					type: function () {
						return type;
					},
					file: function () {
						return file;
					}
				}
			});

			modalInstance.result.then(function (favorite) {
				//MUST CALL THIS BECAUSE IF ARRAY IS NULL, IT DOES NOT GET UPDATED -.-
				if ($scope.Files.length == 0) {
					$scope.Files = favoriteService.getFavoritenCached();
				}

				if (favorite != null) {
					$log.info('Received Data manageFavoriteController: ' + favorite);
				}
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		} else {
			alert("Action not found");
		}
	}
	$rootScope.$watch('userData', function (newValue, oldValue, scope) {
		$rootScope.userData ? $log.info($rootScope.userData.UserId) : $log.info('--WATCH fileCtrl--userdata-- is NULL, exit function.');
		if (!$rootScope.userData)return;
		$timeout(function () {
			fileService.getFiles()
				.then(function (data) {
					if (data != null) {
						$scope.Files = data;
						$log.info('Received Data fileService: ' + JSON.stringify(data));
					}
				}, function (error) {
					$log.info("Error at fileService() (" + new Date() + "): --> " + error);
				});
		}, 200);
	});
});
ausgabenmanagerControllers.controller('ModalNeueAusgabeController', function ($scope, $modalInstance, $rootScope, ausgabezeitraeume, priorities, AusgabenService, type, ausgabe) {

	var type = type;
	$scope.Heading = function () {
		if (type == "new") {
			return "Neue Ausgabe";
		}
		if (type == 'edit') {
			return "Ausgabe bearbeiten";
		}
	}
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
ausgabenmanagerControllers.controller('ModalFavoriteController', function ($scope, $modalInstance, $rootScope, favoriteService, type, favorite) {

	var type = type;
	$scope.favorite = null;
	$scope.Heading = function () {
		if (type == "new") {
			return "Neuer Favorit";
		}
		if (type == 'edit') {
			return "Favorit bearbeiten";
		}
	}

	if (type == 'new') {
		$scope.favorite = favoriteService.getEmptyFavorite();
	} else if (type == 'edit') {
		$scope.favorite = favorite;
	} else {
		alert("Type not found");
	}

	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		if (type == 'new') {
			$scope.favorite.UserId = $rootScope.userData.UserId;
			favoriteService.addNewFavorite($scope.favorite)
				.then(function (data) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					$modalInstance.close(data);
				}, function (error) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					alert('Error: ' + JSON.stringify(error));
				}
			);
		} else if (type == 'edit') {
			favoriteService.updateFavorite($scope.favorite)
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
ausgabenmanagerControllers.controller('ModalFileController', function ($scope, $modalInstance, $rootScope, fileService, type, file) {

	var type = type;
	$scope.file = null;
	$scope.Heading = function () {
		if (type == "new") {
			return "Neue Datei";
		}
		if (type == 'edit') {
			return "Datei bearbeiten";
		}
	}

	if (type == 'new') {
		$scope.file = fileService.getEmptyFile();
	} else if (type == 'edit') {
		$scope.file = file;
	} else {
		alert("Type not found");
	}

	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		if (type == 'new') {
			$scope.favorite.UserId = $rootScope.userData.UserId;
//			favoriteService.addNewFavorite($scope.favorite)
//				.then(function (data) {
//					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
//					$modalInstance.close(data);
//				}, function (error) {
//					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
//					alert('Error: ' + JSON.stringify(error));
//				}
//			);
		} else if (type == 'edit') {
//			favoriteService.updateFavorite($scope.favorite)
//				.then(function (data) {
//					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
//					$modalInstance.close(data);
//				}, function (error) {
//					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
//					alert('Error: ' + JSON.stringify(error));
//				}
//			);
		}

	};
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
