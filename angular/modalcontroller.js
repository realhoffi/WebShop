'use strict'
ausgabenmanagerControllers.controller('ModalNeueAusgabeController', function ($scope, $modalInstance, $rootScope, ausgabezeitraeume, priorities, AusgabenService, type, ausgabe, userService) {
	$scope.ausgabe = {};
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
		$scope.ausgabe = angular.copy(ausgabe);
	} else {
		alert("Type not found");
	}

	$scope.ausgabezeitraum = ausgabezeitraeume;
	$scope.priorities = priorities;
	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		if (type == 'new') {
			$scope.ausgabe.UserId = userService.getCurrentUser().UserId;
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
	$scope.errorHappend = false;
	$scope.errorMessasge = "";
	$scope.newUser = userService.getEmptyUser();
	$scope.item = {name: ""};
	$scope.userClickedRegistered = false;
	$scope.Heading = {Register: 'Register', Login: 'Sign in', Logout: 'Sign Out', Registertext: "Please enter all of these Information to create a User-Account", Logintext: "Please enter your E-Mail Address or your UserId."};

	$scope.selectedHeading = function () {
		return  $scope.getHeadingByStatus($scope.userClickedRegistered);
	}
	$scope.getHeadingByStatus = function (b) {
		return b ? $scope.Heading.Register : $scope.Heading.Login;
	}
	$scope.getHeadingInfoTextByStatus = function () {
		return $scope.userClickedRegistered ? $scope.Heading.Registertext : $scope.Heading.Logintext;
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
			}, function (error, status) {
				app.common.utils.setButtonLoadingStateReset($event.currentTarget);
				$scope.errorHappend = true;
				$scope.errorMessasge = "Fehler: " + error + "\nStatus: " + status;
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
	$scope.currentUser = angular.copy($scope.MyUser());
	$scope.ok = function ($event) {
		angular.copy($scope.currentUser, $scope.MyUser());
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
ausgabenmanagerControllers.controller('ModalFavoriteController', function ($scope, $modalInstance, $rootScope, favoriteService, type, favorite, userService) {

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
		$scope.favorite = angular.copy(favorite);
	} else {
		alert("Type not found");
	}

	$scope.ok = function ($event) {
		app.common.utils.setButtonLoadingState($event.currentTarget);
		if (type == 'new') {
			$scope.favorite.UserId = userService.getCurrentUser().UserId;
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
ausgabenmanagerControllers.controller('ModalFileController', function ($scope, $modalInstance, $rootScope, fileService, type, file, userService) {
	var mfile = $scope.myFile;
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
		//not working with modal windows...
		//see https://github.com/angular/angular.js/issues/5489
		for (var cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
			if (!mfile) {
				mfile = cs.myFile;
			}
		}
		app.common.utils.setButtonLoadingState($event.currentTarget);
		if (type == 'new') {
			$scope.file.FileName = mfile.name;
			$scope.file.UserId = userService.getCurrentUser().UserId;
			fileService.uploadFile($scope.file, mfile)
				.then(function (data) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					$modalInstance.close(data);
				}, function (error) {
					app.common.utils.setButtonLoadingStateReset($event.currentTarget);
					alert('Error: ' + JSON.stringify(error));
				}
			);
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
