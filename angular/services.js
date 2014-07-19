/**
 * Created by florian on 13.07.2014.
 */
'use strict'
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
						alert('AusgabenService: Fehler beim Datenabruf der Ausgaben... :(');
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
	.factory('PrioritaetService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
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
	.factory('userService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
		var currentUserId = "";
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
						$rootScope.userData = data;
						$rootScope.isUserLoggedIn = true;
						$log.info('CreateUserCookie');
						app.common.utils.createCookie("userid", $rootScope.userData.UserId, 20);
						$log.info('logIn: resetFailCounter ');
						$rootScope.resetFailCounter();
						deferred.resolve($rootScope.userData);

					} else {
						$log.info('logIn success! But response-type is NOT OBJECT');
						$log.info('Do login again!');
						if ($rootScope.maxFailCounter >= 0) {
							$rootScope.maxFailCounter--;
							logIn(uId);
						} else {
							deferred.reject("UserService --> REJECT because errormessage is inside");
							return;
						}
						deferred.resolve(data);
					}

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
			},
			getUserId: function () {
				return getUserId();
			}
		};
	}])
	.factory('fileService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
		var files;
		var indexGetById = function (id) {
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
				$http.get($rootScope.rootDomain + '/Files/GetFiles?uid=' + $rootScope.userData.UserId,
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
			$http.delete($rootScope.rootDomain + "/files/DeleteFile?uid=" + $rootScope.userData.UserId,
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

			$http.get($rootScope.rootDomain + '/Files/GetFileByName?fid=' + file.FileName + '&uid=' + $rootScope.userData.UserId,
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
			$http.post($rootScope.rootDomain + '/Files/UploadFile?fid=' + fileObj.FileName + '&uid=' + $rootScope.userData.UserId, fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			}).success(function (data) {
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
	.
	factory('favoriteService', ['$http', '$q', '$rootScope', '$log', function ($http, $q, $rootScope, $log) {
		var favoriten;

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
				$http.get($rootScope.rootDomain + '/Favoriten/GetFavoriten?uid=' + $rootScope.userData.UserId,
					{cache: false})
					.success(function (data) {
						$log.info("PrioritaetService HTTP success!");
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

			if (prioritaeten) {
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
			$http.post($rootScope.rootDomain + "/Favoriten/CreateFavorite?uid=" + $rootScope.userData.UserId,
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
			$http.put($rootScope.rootDomain + "/Favoriten/UpdateFavoriteDetails?uid=" + $rootScope.userData.UserId,
				favorite,
				{
					dataType: 'json',
					contentType: "application/json; charset=utf-8"
				})
				.success(function (data) {
					if (data) {
						var fav = iGetById(data.ID);
						deferred.resolve(fav);
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
			$http.delete($rootScope.rootDomain + "/Favoriten/DeleteFavorite?uid=" + $rootScope.userData.UserId,
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
	}]);
