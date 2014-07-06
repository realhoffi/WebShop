/**
 * Created by florian on 27.04.2014.
 */
"use strict";
var webshop = webshop || {};
webshop.controller = (function () {
	function search(searchString, successCallback) {
		var q = "'" + searchString + "'";
		var url = 'https://ajax.googleapis.com/ajax/services/feed/find?v=1.0&q=' + q;
		$.ajax({
			url: url,
			success: function (data, a, b, c) {
				var respCode = data.responseData.entries;
				if (successCallback && typeof successCallback === "function")
					successCallback(respCode);
			},
			error: function (e) {
				//addErrorItem(JSON.stringify(e) ? JSON.stringify(e) : "unknown error occurred");
			},
			dataType: 'jsonp'
		});
	};
	return{
		search: search
	};
})();