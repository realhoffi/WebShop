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
				$log.info($rootScope.userData.UserId);
				if ($rootScope.userData.UserId == 'undefined' || $rootScope.userData.UserId == undefined || $rootScope.userData.UserId.length == 0) {
					$log.info('USERDATA undefined');
				}

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