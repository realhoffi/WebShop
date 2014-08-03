/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'

var ausgabenmanagerControllers = angular.module('ausgabenmanagerControllers', []);
ausgabenmanagerControllers.controller('menueController', function ($scope, $modal, $http, $rootScope, $log, userService) {
	$scope.showMenue = false;
	$scope.renderMenue = function () {
		$scope.showMenue = !$scope.showMenue;
		$scope.showMenue ? $("#navbarContent").removeClass("hidden-sm") : $("#navbarContent").addClass("hidden-sm");
		$scope.showMenue ? $("#navbarContent").removeClass("hidden-xs") : $("#navbarContent").addClass("hidden-xs");
		return false;
	}
	$rootScope.$on("$routeChangeSuccess", function (e) {
		//when route changes and menu is visible, then hide it
		if ($scope.showMenue) {
			$scope.renderMenue();
		}
	});
});
ausgabenmanagerControllers.controller('ausgabenCtrl', function ($scope, $modal, $http, $rootScope, $log, $timeout, userService, AusgabenService, AusgabenzeitraumService, PrioritaetService) {
	$scope.Ausgaben = AusgabenService.getAusgabenCached() || [];
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
		return sum + $rootScope.currency;
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
	$scope.findAusgabezeitraumByAusgabe = function (ausgabe) {
		if ($scope.Ausgabenzeitraeume) {
			for (var i = 0; i < $scope.Ausgabenzeitraeume.length; i++) {
				if ($scope.Ausgabenzeitraeume[i].ID == ausgabe.Ausgabezeitraum) {
					return $scope.Ausgabenzeitraeume[i].Name;
				}
			}
		}
	}
	$scope.findAusgabezeitraumById = function (id) {
		if ($scope.Ausgabenzeitraeume) {
			for (var i = 0; i < $scope.Ausgabenzeitraeume.length; i++) {
				if ($scope.Ausgabenzeitraeume[i].ID == id) {
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
			//	if ($scope.Ausgaben.length == 0) {
			$scope.Ausgaben = AusgabenService.getAusgabenCached();
			$log.info("OK CLOSED");
			//}

		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
	$scope.getGroups = function () {
		var groupArray = [];
		angular.forEach($scope.Ausgaben, function (item, idx) {
			if (groupArray.indexOf(item.Ausgabezeitraum) == -1)
				groupArray.push(item.Ausgabezeitraum)
		});
		return groupArray.sort();
	}
	$scope.getGroupSum = function (group) {
		var ausgabenSumme = 0;
		for (var i = 0; i < $scope.Ausgaben.length; i++) {
			if ($scope.Ausgaben[i].Ausgabezeitraum == group) {
				ausgabenSumme += $scope.Ausgaben[i].Preis;
			}
		}

		return ausgabenSumme + $rootScope.currency;

	}
	$scope.toDate = function (wcfDate) {
		try {
			//alert(moment(parseInt(wcfDate.substr(6))).format('DD.MM.YYYY HH:mm:ss'));
			//	return new Date(parseInt(wcfDate.substr(6))).toLocaleString();
			return moment(parseInt(wcfDate.substr(6))).format('DD.MM.YYYY HH:mm:ss');
		} catch (ex) {
			alert(ex);
		}
		return  "";
	}
	//Startup Method which watches, if the userdata changes
	//it changes when A) a new user sign in or B) when the user is logged in
	//EDIT NEW! NO NEED TO CHECK USERDATA FOR CHANGE, SERVICES CACHE ITEMS!
	$scope.$watch(function () {
			return userService.getCurrentUser();
		}, function (newValue, oldValue, scope) {
			$log.info('--WATCH--userData-- ' + new Date());
			$log.info("--WATCH--userData-- Discover new value userData: " + JSON.stringify(newValue));

			if (!newValue) {
				$scope.Ausgaben = [];
				$scope.Ausgabenzeitraeume = [];
				$scope.Prioritaeten = [];
				return;
			}
			$rootScope.userData ? $log.info($rootScope.userData.UserId) : $log.info('--WATCH ausgabenCtrl--userdata-- is NULL, exit function.');
			$timeout(function () {
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
});
ausgabenmanagerControllers.controller('userCtrl', function ($scope, $modal, $http, $rootScope, $log, userService) {
	$scope.MyUser = function () {
		return userService.getCurrentUser();
	}
	$scope.isUserLoggedIn = function () {
		return userService.isUserLoggedIn();
	}
	$scope.logout = function () {
//        $rootScope.isUserLoggedIn = false;
		userService.logout();
		$rootScope.$broadcast("logout");
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
			} else {
				alert('No User?!?!?!?');
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
ausgabenmanagerControllers.controller('favoriteCtrl', function ($scope, $modal, $http, $rootScope, $log, $timeout, favoriteService, userService) {
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
	$scope.$watch(function () {
			return userService.getCurrentUser();
		}, function (newValue, oldValue, scope) {
			$log.info('--WATCH--userData-- ' + new Date());
			$log.info("--WATCH--userData-- Discover userData: " + JSON.stringify(newValue));
			$rootScope.userData ? $log.info($rootScope.userData.UserId) : $log.info('--WATCH favoriteCtrl--userdata-- is NULL, exit function');
			if (!$rootScope.userData) {
				$scope.Favoriten = null;
				return;
			}
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
});
ausgabenmanagerControllers.controller('fileCtrl', function ($scope, $modal, $http, $rootScope, $log, $timeout, fileService, userService) {
	$scope.Files = [];
	$scope.loadFile = function (file) {
		$.fileDownload($rootScope.rootDomain + '/Files/GetFileByName?fid=' + file.FileName + '&uid=' + $rootScope.userData.UserId,
			{
			}
		)
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
				resolve: {
					type: function () {
						return type;
					},
					file: function () {
						return file;
					}
				}
			});

			modalInstance.result.then(function (newFile) {
				//MUST CALL THIS BECAUSE IF ARRAY IS NULL, IT DOES NOT GET UPDATED -.-
				if ($scope.Files.length == 0) {
					$scope.Files = [];
				}

				if (newFile != null) {
					$scope.Files.push(newFile)
					$log.info('Received Data fileCtrl: ' + newFile);
				}
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
		} else {
			alert("Action not found");
		}
	}
	$scope.$watch(function () {
		return userService.getCurrentUser();
	}, function (data, b, c) {
		if (!data) {
			$scope.Files = null;
			return;
		}
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
	}, true);

});
ausgabenmanagerControllers.controller('notesCtrl', function ($scope, $http, $rootScope, $log, $timeout, userService, noteService) {
	$scope.notes = [];
	$scope.addNote = function () {
		var newNode = noteService.getEmptyNote();
		newNode.UserId = userService.getCurrentUser().UserId;
		noteService.addNewNote(newNode).then(function (data) {
			$scope.notes = noteService.getNotesCached();
		}, function (a, b, c) {
			alert("Error!");
		});
	}
	$scope.editNote = function (note) {
		note.edit = !note.edit;
		if (!note.edit) {
			noteService.updateNote(note).then(function (data) {
				$scope.notes = noteService.getNotesCached();
			}, function (a, b, c) {
				alert("Error!");
			});
		}
	}
	$scope.deleteNote = function (note) {
		$log.info("DELETE ID: " + note.ID);
		noteService.deleteNote(note).then(function (data) {
			$scope.notes = noteService.getNotesCached();
			$log.info("DELETED ID: " + note.ID);
		}, function (a, b, c) {
			alert("Error!");
		});
	}

	$scope.$watch(function () {
		return userService.getCurrentUser();
	}, function (data, b, c) {
		if (!data) {
			$scope.notes = null;
			return;
		}
		$timeout(function () {
			noteService.getNotes()
				.then(function (data) {
					if (data != null) {
						$scope.notes = data;
						$log.info('Received Data fileService: ' + JSON.stringify(data));
					}
				}, function (error) {
					$log.info("Error at fileService() (" + new Date() + "): --> " + error);
				});
		}, 200);
	}, true);
});
ausgabenmanagerControllers.controller('userEventCtrl', function ($scope, $http, $rootScope, $log, $timeout, userService, userEventService) {
	$scope.userEvents = [];
	var calendarEvents = [];
	$scope.addEvent = function () {
		var newEvent = userEventService.getEmptyUserEvent();
		newEvent.Start = app.common.utils.toJsonDate(newEvent.Start);
		newEvent.Ende = app.common.utils.toJsonDate(newEvent.Ende);
		newEvent.UserId = userService.getCurrentUser().UserId;
		userEventService.addNewUserEvent(newEvent).then(function (data) {
			$log.info("UserEvent angelegt: " + JSON.stringify(data));
			$scope.userEvents = userEventService.getUserEventsCached();
			$scope.renderCalendar();

		}, function (a, b, c) {
			alert("Error!");
		});
	}
	$scope.manageEvent = function (size, eventStatus, event) {
		if (eventStatus == "delete") {
			userEventService.deleteUserEvent(event)
		} else if (eventStatus == "new") {
		}
		else if (eventStatus == "edit") {
		} else {
			alert('Strange Status -.-');
		}

	}
//	$scope.editNote = function (note) {
//		note.edit = !note.edit;
//		if (!note.edit) {
//			noteService.updateNote(note).then(function (data) {
//				$scope.userEvents = noteService.getNotesCached();
//			}, function (a, b, c) {
//				alert("Error!");
//			});
//		}
//	}
	$scope.deleteNote = function (note) {
		$log.info("DELETE ID: " + note.ID);
		noteService.deleteNote(note).then(function (data) {
			$scope.userEvents = noteService.getNotesCached();
			$log.info("DELETED ID: " + note.ID);
		}, function (a, b, c) {
			alert("Error!");
		});
	}
	$scope.formatNormalizeDate = function (date, format) {
		return (format) ? moment(date).format(format) : moment(date).format();
	}
	$scope.reformatEventForCalendar = function (event) {
		var newEvent = {title: event.Titel,
			start: $scope.formatNormalizeDate(event.Start),
			end: $scope.formatNormalizeDate(event.Ende),
			//	color: 'yellow',   // an option!
			//	textColor: 'black',
			editable: false
		};
		return newEvent
	}
	$scope.renderCalendar = function () {
		calendarEvents = [];
		for (var i = 0; i < $scope.userEvents.length; i++) {
			var formattedEvent = $scope.reformatEventForCalendar($scope.userEvents[i]);
			calendarEvents.push(formattedEvent);
		}
		$('#calendar').fullCalendar('destroy');
		app.common.utils.calendar.renderCalender(calendarEvents, "#calendar");
	}
	$scope.$watch(function () {
		return userService.getCurrentUser();
	}, function (data, b, c) {
		if (!data) {
			$scope.userEvents = null;
			return;
		}
		$timeout(function () {
			userEventService.getUserEvents()
				.then(function (data) {
					$log.info('Received Data userEventService: ' + JSON.stringify(data));
					if (data != null) {
						$scope.userEvents = data;
						$scope.renderCalendar();

					}
				}, function (error) {
					$log.info("Error at userEventService (" + new Date() + "): --> " + error);
				});
		}, 200);
	}, true);
});
