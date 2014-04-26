/**
 * Created by florian on 26.04.2014.
 */
/**
 * @description :)
 * @type {webshop|*|{}}
 */
var webshop = webshop || {};
webshop.errorhandling = function () {
	var isErrorFunctionLoad = function () {
		return (window.onerror && typeof window.onerror === "function") ? true : false;
	};
	var errorFunction = function (a, b, c) {
		if (window.console) {
			console.log("FEHLER!!!!");
		} else {
			alert('there is a error occured');
		}
	};
	var init = function () {
		if (isErrorFunctionLoad()) {
			errorFunction();
		} else {
			window.onerror = errorFunction();
		}
	}

	init();
};

(function () {
	webshop.errorhandling();
}());
