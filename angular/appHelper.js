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
	},
	createCookie: function (name, value, days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		}
		else var expires = "";
		document.cookie = name + "=" + value + expires + "; path=/";
	},
	setButtonLoadingState: function (targetButton) {
		if (targetButton)
			$(targetButton).button('loading');
	},
	setButtonLoadingStateReset: function (targetButton) {
		if (targetButton)
			$(targetButton).button('reset')
	},
	validateForm: function (form) {
		var retVal = true;
		$(form).find('input[required], select[required], textarea[required]').each(function () {
			// add a class to each required field with "required" & the input type
			// using the normal "getAttribute" method because jQuery's attr always returns "text"
			if (!$(this).val() || $(this).val().length == 0) {
				retVal = false;
				$(this).parent().attr('class', $(this).parent().attr('class') + " has-error");
			}
		});
		return retVal;
	},
	getSpinnerInstance: function () {
		var opts = {
			lines: 11, // The number of lines to draw
			length: 0, // The length of each line
			width: 27, // The line thickness
			radius: 60, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 44, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb or array of colors
			speed: 1, // Rounds per second
			trail: 100, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: '40%', // Top position relative to parent
			left: '50%' // Left position relative to parent
		};

		return new Spinner(opts);
	}
}

app.common.utils.guid = {
	getEmptyGuid: function () {
		return "{00000000-0000-0000-0000-000000000000}";
	}

};
