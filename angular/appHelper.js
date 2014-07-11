/**
 * Created by fhoffma on 07.07.2014.
 */
'use strict'
var app = app || {};
app.common = app.common || {};
app.common.utils = {

	readCookie: function (name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

};
app.common.utils.guid = {
	getEmptyGuid: function () {
		return "{00000000-0000-0000-0000-000000000000}";
	}

};
