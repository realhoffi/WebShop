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
	var errorFunction = function (errorMsg, url, lineNumber) {
		if (window.console) {
			console.log("FEHLER!!!!");
		} else {
			alert('there is a error occured');
		}
		if (errorMsg.indexOf('Script error.') > -1) {
			return;
		}
		return ;
	};

	var init = function () {
		if (isErrorFunctionLoad()) {
			errorFunction();
		} else {
			window.onerror = errorFunction;
		}
	}

	init();
};

(function () {
	webshop.errorhandling();
	//alert("Error loaded");
}());
