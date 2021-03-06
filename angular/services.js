'use strict'
var ausgabenmanagerServices = angular.module('ausgabenmanagerServices', [])
	.factory('AusgabenService', ['$http', '$q', '$rootScope', '$log', 'userService', function ($http, $q, $rootScope, $log, userService) {
		var ausgaben = null;
		$rootScope.$on("logout", function () {
			ausgaben = null;
		});
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
				$http.get($rootScope.rootDomain + '/ausgaben/getausgaben?uid=' + userService.getCurrentUser().UserId,
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
						alert('AusgabenService: Fehler beim Datenabruf der Ausgaben... :(');
					});
			}
			return deferred.promise;
		}
		var addNewAusgabe = function (ausgabe) {
			var deferred = $q.defer();
			$http.post($rootScope.rootDomain + "/ausgaben/CreateAusgabe?uid=" + userService.getCurrentUser().UserId,
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
				"Ausgabezeitraum": null,
				"Beschreibung": "",
				"ID": 0,
				"Name": "",
				"UserId": app.common.utils.guid.getEmptyGuid(),
				"Preis": null,
				"Prioritaet": null

			};
		}
		var updateAusgabe = function (ausgabe) {
			var deferred = $q.defer();
			$http.put($rootScope.rootDomain + "/ausgaben/UpdateAusgabenDetails?uid=" + userService.getCurrentUser().UserId,
				ausgabe,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(data.ID);
						$log.info("Update Ausgabe with ID " + data.ID);
						ausgaben[indx] = data;
						$log.info("Update Ausgabe with ID " + data.ID + " done");
						deferred.resolve(ausgaben[indx]);
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
			$http.delete($rootScope.rootDomain + "/ausgaben/DeleteAusgabe?uid=" + userService.getCurrentUser().UserId,
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
	.factory('AusgabenzeitraumService', ['$http', '$q', '$rootScope', '$log', 'userService', function ($http, $q, $rootScope, $log, userService) {
		var ausgabenzeitraeume;
		$rootScope.$on("logout", function () {
			ausgabenzeitraeume = null;
		});
		var getAusgabenzeitraeume = function () {
			var deferred = $q.defer();
			if (ausgabenzeitraeume) {
				$log.info("AusgabenzeitraumService are cached");
				deferred.resolve(ausgabenzeitraeume);
			} else {
				$log.info("AusgabenzeitraumService HTTP Call!");
				$http.get($rootScope.rootDomain + '/Ausgabenzeitraum/GetAusgabenzeitraeume?uid=' + userService.getCurrentUser().UserId,
					{cache: false})
					.success(function (data) {
						$log.info("AusgabenzeitraumService HTTP success!");
						ausgabenzeitraeume = data;
						deferred.resolve(ausgabenzeitraeume);
					})
					.error(function (data, status, headers) {
						$log.error("AusgabenzeitraumService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('AusgabenzeitraumService: Fehler beim Datenabruf der getAusgabenzeitraeume... :(');
					});
			}

			return deferred.promise;
		}

		return{
			getAusgabenzeitraeume: function () {
				return getAusgabenzeitraeume();
			},
			getAusgabenzeitraeumeCached: function () {
				return ausgabenzeitraeume;
			}
		}
	}])
	.factory('PrioritaetService', ['$http', '$q', '$rootScope', '$log', 'userService', function ($http, $q, $rootScope, $log, userService) {
		var prioritaeten;
		$rootScope.$on("logout", function () {
			prioritaeten = null;
		});
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
				$http.get($rootScope.rootDomain + '/Prioritaeten/GetPrioritaeten?uid=' + userService.getCurrentUser().UserId,
					{cache: false})
					.success(function (data) {
						$log.info("PrioritaetService HTTP success!");
						prioritaeten = data;
						deferred.resolve(prioritaeten);
					})
					.error(function (data, status, headers) {
						$log.error("AusgabenzeitraumService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('AusgabenzeitraumService: Fehler beim Datenabruf der getAusgabenzeitraeume... :(');
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
						alert('PrioritaetService: Fehler beim Datenabruf der getPrioritaetById... :(');
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
			},
			getPrioritaetenCached: function () {
				return prioritaeten;
			}
		}
	}])
	.factory('fileService', ['$http', '$q', '$rootScope', '$log', 'userService', function ($http, $q, $rootScope, $log, userService) {
		var files;
		$rootScope.$on("logout", function () {
			files = null;
		});
		var indexGetById = function (id) {
			if (files.length == 0) {
				return null;
			}
			for (var i = 0; i < files.length; i++) {
				if (files[i].ID == id) {
					return i;
				}
			}
			return null;
		};
		var getFiles = function () {
			var deferred = $q.defer();
			if (files) {
				$log.info("fileService are cached");
				deferred.resolve(files);
			} else {
				$log.info("fileService HTTP Call!");
				$http.get($rootScope.rootDomain + '/Files/GetFiles?uid=' + userService.getCurrentUser().UserId,
					{cache: false})
					.success(function (data) {
						$log.info("fileService HTTP success!");
						files = data;
						deferred.resolve(files);
					})
					.error(function (data, status, headers) {
						$log.error("fileService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('fileService: Fehler beim Datenabruf der getFiles... :(');
					});
			}
			return deferred.promise;
		}
		var getEmptyFile = function () {
			return {
				"Erstellt": "",
				"ID": 0,
				"FileName": "",
				"FileStreamData": null,
				"FileStreamDataGUID": null,
				"UserId": app.common.utils.guid.getEmptyGuid()
			};
		}
		var deleteFile = function (file) {
			var deferred = $q.defer();
			$http.delete($rootScope.rootDomain + "/files/DeleteFile?uid=" + userService.getCurrentUser().UserId,
				{
					data: file,
					headers: {
						"Content-Type": "application/json"
					},
					method: 'DELETE',
					dataType: 'json'

				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(file.ID)
						files.splice(indx, 1);
						deferred.resolve(data);
					} else {
						deferred.reject('Error: file nicht gelöscht!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var getFileByName = function (file) {
			var deferred = $q.defer();

			$log.info("fileService HTTP Call!");

			$http.get($rootScope.rootDomain + '/Files/GetFileByName?fid=' + file.FileName + '&uid=' + userService.getCurrentUser().UserId,
				{cache: false})
				.success(function (data) {
					$log.info("fileService HTTP success getFileByName!");
					file.FileStreamData = data;
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
					$log.error("fileService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
					deferred.reject('Error: ' + JSON.stringify(data));
					alert('fileService: Fehler beim Datenabruf der getFileByName... :(');
				});

			return deferred.promise;
		}
		var uploadFile = function (fileObj, inputObj) {
			var deferred = $q.defer();
			var fd = new FormData();
			fd.append('file', inputObj);
			$log.info("fileService HTTP Call! uploadFile");
			$http.post($rootScope.rootDomain + '/Files/UploadFile?fid=' + fileObj.FileName + '&uid=' + userService.getCurrentUser().UserId, fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			}).success(function (data) {
				if (files.length == 0) {
					files = [];
				}
				files.push(data);
				$log.info("fileService HTTP Call! uploadFile success" + JSON.stringify(data));
				deferred.resolve(data);
			}).error(function (data, status, headers) {
				$log.info("fileService HTTP Call! uploadFile ERROR");
				deferred.reject('Error: ' + JSON.stringify(status));
			});
			return deferred.promise;
		}
		return{
			getFiles: function () {
				return getFiles();
			},
			deleteFile: function (file) {
				return deleteFile(file);
			},
			getEmptyFile: function () {
				return getEmptyFile();
			},
			getFileByName: function (file) {
				return getFileByName(file);
			},
			uploadFile: function (file, dataStream) {
				return uploadFile(file, dataStream);
			}

		}
	}])
	.factory('favoriteService', ['$http', '$q', '$rootScope', '$log', 'userService', function ($http, $q, $rootScope, $log, userService) {
		var favoriten;
		$rootScope.$on("logout", function () {
			favoriten = null;
		});
		var indexGetById = function (id) {
			for (var i = 0; i < favoriten.length; i++) {
				if (favoriten[i].ID == id) {
					return i;
				}
			}
			return null;
		};
		var iGetById = function (id) {
			for (var i = 0; i < favoriten.length; i++) {
				if (favoriten[i].ID == id) {
					return favoriten[i];
				}
			}
			return null;
		};
		var getFavoriten = function () {
			var deferred = $q.defer();
			if (favoriten) {
				$log.info("favoriteService are cached");
				deferred.resolve(favoriten);
			} else {
				$log.info("favoriteService HTTP Call!");
				$http.get($rootScope.rootDomain + '/Favoriten/GetFavoriten?uid=' + userService.getCurrentUser().UserId,
					{cache: false})
					.success(function (data) {
						$log.info("favoriteService HTTP success!");
						favoriten = data;
						deferred.resolve(favoriten);
					})
					.error(function (data, status, headers) {
						$log.error("favoriteService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('favoriteService: Fehler beim Datenabruf der getFavoriten... :(');
					});
			}
			return deferred.promise;
		}
		var getFavoriteById = function (id) {
			var deferred = $q.defer();

			if (favoriten) {
				$log.info("favoriteService are cached");
				var p = iGetById(id);
				deferred.resolve(p);
			} else {
				$http.get($rootScope.rootDomain + '/Favoriten/GetFavoriteById?fid=' + id,
					{cache: false})
					.success(function (data) {
						deferred.resolve(data);
					})
					.error(function (data, status, headers) {
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('favoriteService: Fehler beim Datenabruf der getPrioritaetById... :(');
					});
			}


			return deferred.promise;
		}
		var addNewFavorite = function (favorite) {
			var deferred = $q.defer();
			$http.post($rootScope.rootDomain + "/Favoriten/CreateFavorite?uid=" + userService.getCurrentUser().UserId,
				favorite,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (favoriten.length == 0) {
						favoriten = [];
					}
					favoriten.push(data);
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var getEmptyFavorite = function () {
			return {
				"URL": "",
				"ID": 0,
				"Name": "",
				"UserId": app.common.utils.guid.getEmptyGuid()
			};
		}
		var updateFavorite = function (favorite) {
			var deferred = $q.defer();
			$http.put($rootScope.rootDomain + "/Favoriten/UpdateFavoriteDetails?uid=" + userService.getCurrentUser().UserId,
				favorite,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(data.ID);
						favoriten[indx] = data;
						deferred.resolve(favoriten[indx]);
					} else {
						deferred.reject('Error: favoriteService intern nicht gefunden!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var deleteFavorite = function (favorite) {
			var deferred = $q.defer();
			$http.delete($rootScope.rootDomain + "/Favoriten/DeleteFavorite?uid=" + userService.getCurrentUser().UserId,
				{
					data: favorite,
					headers: {
						"Content-Type": "application/json"
					},
					method: 'DELETE',
					dataType: 'json'

				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(favorite.ID)
						favoriten.splice(indx, 1);
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
			getFavoriten: function () {
				return getFavoriten();
			},
			getEmptyFavorite: function () {
				return getEmptyFavorite();
			},
			addNewFavorite: function (favorite) {
				return addNewFavorite(favorite);
			},
			updateFavorite: function (favorite) {
				return updateFavorite(favorite);
			},
			getFavoriteById: function (id) {
				return getFavoriteById(id);
			},
			deleteFavorite: function (favorite) {
				return deleteFavorite(favorite)
			},
			getFavoritenCached: function () {
				return favoriten;
			}
		}
	}])
	.factory('userService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
		var currentUserId = "";
		var currentUser;
		$rootScope.$on("logout", function () {
			logout();
		});
		var logout = function () {
			currentUser = null;
			currentUserId = null;
		}
		var getUserId = function () {
			var currentUser = getCurrentUser();
			return currentUser ? getCurrentUser().UserId : app.common.utils.readCookie('userid');
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
					$log.info("Registered ok! Data recieved: " + JSON.stringify(data))
					currentUser = data;
					app.common.utils.createCookie("userid", currentUser.UserId, 20);
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
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
					currentUser = data;
					app.common.utils.createCookie("userid", currentUser.UserId, 20);
					deferred.resolve(currentUser);
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var getCurrentUser = function () {
			return currentUser;
		}
		var tryLoginByCookie = function () {
			var deferred = $q.defer();
			currentUserId = getUserId();
			if (currentUserId != null && currentUserId.length > 0) {
				logIn(currentUserId).then(function (user) {
					$log.info('tryLoginByCookie success! UserData: ' + JSON.stringify(user));
					deferred.resolve(true);
				}, function (reason) {
					$log.error("tryLoginByCookie error: " + reason);
					deferred.reject('Error: ' + reason);
				});
			} else {
				deferred.reject('No UserId in Cookie found');
			}
			return deferred.promise;
		}
		var logIn = function (uId) {
			var deferred = $q.defer();

			//REJECT IF NO UID!
			if (!uId) {
				deferred.reject("UserService --> REJECT because parameter uId is undefined! Data: " + uId);
			}

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
					var response = jQuery.parseJSON(JSON.stringify(data));
					if (typeof response == 'object') {
						$log.info('logIn success! Response-type is OBJECT');
						currentUser = data;
						$log.info('CreateUserCookie');
						app.common.utils.createCookie("userid", currentUser.UserId, 20);
						$log.info('logIn: resetFailCounter ');

						deferred.resolve($rootScope.userData);

					} else {
						$log.info('logIn success! But response-type is NOT OBJECT');
						$log.info('Do login again!');
						if ($rootScope.maxFailCounter >= 0) {
							$rootScope.maxFailCounter--;
							logIn(uId);
						} else {
							deferred.reject("UserService --> REJECT because errormessage is inside");
							$rootScope.needLoginPage = true;
							return;
						}
						deferred.resolve(data);
					}

				})
				.error(function (data, status, headers) {
					$log.error("logIn error: " + data + JSON.stringify(status) + JSON.stringify(headers));
					currentUser = null;
					deferred.reject(data, status);
				});
			return  deferred.promise;
		}

		return {
			login: function (uid) {
				return logIn(uid);
			},
			isUserLoggedIn: function () {
				return currentUser != null;
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
			},
			getUserId: function () {
				return getUserId();
			},
			logout: function () {
				return logout();
			}
		};
	}])
	.factory('noteService', ['$http', '$q', '$rootScope', '$log', 'userService', function ($http, $q, $rootScope, $log, userService) {
		var notes;
		$rootScope.$on("logout", function () {
			notes = null;
		});
		var indexGetById = function (id) {
			for (var i = 0; i < notes.length; i++) {
				if (notes[i].ID == id) {
					return i;
				}
			}
			return null;
		};
		var iGetById = function (id) {
			for (var i = 0; i < notes.length; i++) {
				if (notes[i].ID == id) {
					return notes[i];
				}
			}
			return null;
		};
		var getNotes = function () {
			var deferred = $q.defer();
			if (notes) {
				$log.info("noteService are cached");
				deferred.resolve(notes);
			} else {
				$log.info("noteService HTTP Call!");
				$http.get($rootScope.rootDomain + '/Notes/GetNotes?uid=' + userService.getCurrentUser().UserId,
					{cache: false})
					.success(function (data) {
						$log.info("noteService HTTP success!");
						notes = data;
						deferred.resolve(notes);
					})
					.error(function (data, status, headers) {
						$log.error("noteService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('noteService: Fehler beim Datenabruf der getNotes... :(');
					});
			}
			return deferred.promise;
		}
		var getNoteById = function (id) {
			var deferred = $q.defer();

			if (notes) {
				$log.info("noteService are cached");
				var p = iGetById(id);
				deferred.resolve(p);
			} else {
				$http.get($rootScope.rootDomain + '/Notes/GetNoteById?nid=' + id,
					{cache: false})
					.success(function (data) {
						deferred.resolve(data);
					})
					.error(function (data, status, headers) {
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('noteService: Fehler beim Datenabruf der getNoteById... :(');
					});
			}


			return deferred.promise;
		}
		var addNewNote = function (note) {
			var deferred = $q.defer();
			$http.post($rootScope.rootDomain + "/Notes/CreateNote?uid=" + userService.getCurrentUser().UserId,
				note,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (notes.length == 0) {
						notes = [];
					}
					notes.push(data);
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var getEmptyNote = function () {
			return {
				"ID": 0,
				"Beschreibung": "Please enter your note text :)",
				"UserId": app.common.utils.guid.getEmptyGuid()
			};
		}
		var updateNote = function (note) {
			var deferred = $q.defer();
			$http.put($rootScope.rootDomain + "/Notes/UpdateNoteDetails?uid=" + userService.getCurrentUser().UserId,
				note,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(data.ID);
						notes[indx] = data;
						deferred.resolve(notes[indx]);
					} else {
						deferred.reject('Error: noteService intern nicht gefunden!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var deleteNote = function (note) {
			var deferred = $q.defer();
			$http.delete($rootScope.rootDomain + "/Notes/DeleteNote?uid=" + userService.getCurrentUser().UserId,
				{
					data: note,
					headers: {
						"Content-Type": "application/json"
					},
					method: 'DELETE',
					dataType: 'json'

				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(note.ID)
						$log.info("deleteNote ID: " + data.ID + " Index:" + indx);
						notes.splice(indx, 1);
						deferred.resolve(data);
					} else {
						deferred.reject('Error: note nicht gelöscht!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}

		return{
			getNotes: function () {
				return getNotes();
			},
			getEmptyNote: function () {
				return getEmptyNote();
			},
			addNewNote: function (note) {
				return addNewNote(note);
			},
			updateNote: function (note) {
				return updateNote(note);
			},
			getNoteById: function (id) {
				return getNoteById(id);
			},
			deleteNote: function (note) {
				return deleteNote(note)
			},
			getNotesCached: function () {
				return notes;
			}
		}
	}])
	.factory('userEventService', ['$http', '$q', '$rootScope', '$log', 'userService', function ($http, $q, $rootScope, $log, userService) {
		var userEvents;
		$rootScope.$on("logout", function () {
			userEvents = null;
		});
		var indexGetById = function (id) {
			for (var i = 0; i < userEvents.length; i++) {
				if (userEvents[i].ID == id) {
					return i;
				}
			}
			return null;
		};
		var iGetById = function (id) {
			for (var i = 0; i < userEvents.length; i++) {
				if (userEvents[i].ID == id) {
					return userEvents[i];
				}
			}
			return null;
		};
		var getUserEvents = function () {
			var deferred = $q.defer();
			if (userEvents) {
				$log.info("userEventService are cached");
				deferred.resolve(userEvents);
			} else {
				$log.info("userEventService HTTP Call!");
				$http.get($rootScope.rootDomain + '/Userevents/GetUserevents?uid=' + userService.getCurrentUser().UserId,
					{cache: false})
					.success(function (data) {
						$log.info("userEventService HTTP success!");
						userEvents = data;
						deferred.resolve(userEvents);
					})
					.error(function (data, status, headers) {
						$log.error("userEventService fail! Error: " + JSON.stringify(data) + " --> " + JSON.stringify(status));
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('userEventService: Fehler beim Datenabruf der getUserEvents... :(');
					});
			}
			return deferred.promise;
		}
		var getUserEventById = function (id) {
			var deferred = $q.defer();

			if (userEvents) {
				$log.info("userEventService are cached");
				var p = iGetById(id);
				deferred.resolve(p);
			} else {
				$http.get($rootScope.rootDomain + '/Userevents/GetUsereventById?ueid=' + id,
					{cache: false})
					.success(function (data) {
						deferred.resolve(data);
					})
					.error(function (data, status, headers) {
						deferred.reject('Error: ' + JSON.stringify(data));
						alert('userEventService: Fehler beim Datenabruf der getUserEventById... :(');
					});
			}


			return deferred.promise;
		}
		var addNewUserEvent = function (userEvent) {
			var deferred = $q.defer();
			$http.post($rootScope.rootDomain + "/Userevents/CreateUserevent?uid=" + userService.getCurrentUser().UserId,
				userEvent,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (userEvents.length == 0) {
						userEvents = [];
					}
					userEvents.push(data);
					deferred.resolve(data);
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var getEmptyUserEvent = function () {
			return {
				"ID": 0,
				"Beschreibung": "Bitte angeben...",
				"Titel": "Bitte angeben...",
				"Start": moment(),
				"Ende": moment(),
				"UserId": app.common.utils.guid.getEmptyGuid()
			};
		}
		var updateUserEvent = function (userEvent) {
			var deferred = $q.defer();
			$http.put($rootScope.rootDomain + "/Userevents/UpdateUsereventDetails?uid=" + userService.getCurrentUser().UserId,
				userEvent,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(data.ID);
						userEvents[indx] = data;
						deferred.resolve(userEvents[indx]);
					} else {
						deferred.reject('Error: userEventService intern nicht gefunden!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var deleteUserEvent = function (userEvent) {
			var deferred = $q.defer();
			$http.delete($rootScope.rootDomain + "/Userevents/DeleteUserevent?uid=" + userService.getCurrentUser().UserId,
				{
					data: userEvent,
					headers: {
						"Content-Type": "application/json"
					},
					method: 'DELETE',
					dataType: 'json'

				})
				.success(function (data) {
					if (data) {
						var indx = indexGetById(userEvent.ID)
						$log.info("deleteNote ID: " + data.ID + " Index:" + indx);
						userEvents.splice(indx, 1);
						deferred.resolve(data);
					} else {
						deferred.reject('Error: note nicht gelöscht!');
					}
				})
				.error(function (data, status, headers) {
					deferred.reject('Error: ' + JSON.stringify(status));
				});
			return  deferred.promise;
		}
		var formatDateInEvent = function (date) {

		}
		return{
			getUserEvents: function () {
				return getUserEvents();
			},
			getEmptyUserEvent: function () {
				return getEmptyUserEvent();
			},
			addNewUserEvent: function (userEvent) {
				return addNewUserEvent(userEvent);
			},
			updateUserEvent: function (userEvent) {
				return updateUserEvent(userEvent);
			},
			getUserEventById: function (id) {
				return getUserEventById(id);
			},
			deleteUserEvent: function (userEvent) {
				return deleteUserEvent(userEvent)
			},
			getUserEventsCached: function () {
				return userEvents;
			}
		}
	}]);
