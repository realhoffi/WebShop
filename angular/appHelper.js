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
	}


}

app.common.utils.guid = {
	getEmptyGuid: function () {
		return "{00000000-0000-0000-0000-000000000000}";
	}

};
