/**
 * Created by florian on 25.04.2014.
 */
"use strict";

var webshop = webshop || {};

$(document).ready(function () {
//jQuery(function ($) {
	$("#startSearch").click(function (event) {
		goSearch(event);
	});
	$("#searchQuery").keypress(function (e) {
		if (e.keyCode === 13)
			$("#startSearch").click();
	});

	var element = document.getElementById("retItems");
	var element1 = document.getElementById("main");
	var element2 = document.getElementById("main2");
	var element3 = document.getElementById("main3");
	var element4 = document.getElementById("main4");
	var element5 = document.getElementById("main5");

	element.addEventListener("newMessage", newMessageHandler, false);
	element1.addEventListener("newMessage", newMessageHandler, false);
	element2.addEventListener("newMessage", newMessageHandler, false);
	element3.addEventListener("newMessage", newMessageHandler, false);
	element4.addEventListener("newMessage", newMessageHandler, false);
	element5.addEventListener("newMessage", newMessageHandler, false);
	document.addEventListener("newMessage", newMessageHandler, false);
});
function newMessageHandler(e) {
	console.log(
			"Event subscriber on: ID: " + e.currentTarget.id + " , Name: " + e.currentTarget.nodeName + ", "
			+ e.detail.time.toLocaleString() + ": " + e.detail.message
	);
}

function addErrorItem(error) {
	$("#retItems").append(" <a class=\"list-group-item list-group-item-danger\" href=\"#\"><h4 class=\"list-group-item-heading\">Fehler</h4><p class=\"list-group-item-text\">" + error + "</p></a>");
}
function addItem(item) {
	$("#retItems").append(" <a class=\"list-group-item\" target='_blank' href=\"" + item.url + "\"><h4 class=\"list-group-item-heading list-group-item-success\">" + item.title + "</h4><p class=\"list-group-item-text\">" + item.contentSnippet + "</p></a>");
}
function goSearch(e) {

	$("#retItems").empty();
	var q = "'" + $("#searchquery").val() + "'";
	//var url = "https://www.googleapis.com/customsearch/v1?q=" + q;
	var url = 'https://ajax.googleapis.com/ajax/services/feed/find?v=1.0&q=' + q;

	$.ajax({
		url: url,
		success: function (data, a, b, c) {
			var respCode = data.responseStatus;

			var dataItems = data.responseData.entries;
			for (var i = 0; i < dataItems.length; i++) {
				addItem(dataItems[i] ? dataItems[i] : "unbekannter Fehler");
			}
		},
		error: function (e) {
			addErrorItem(JSON.stringify(e) ? JSON.stringify(e) : "unbekannter Fehler");
		},
		dataType: 'jsonp'
	});

	var ce = new CustomEvent("newMessage",
		{
			detail: {
				message: "Hello World!",
				time: new Date()
			},
			bubbles: false,
			cancelable: true
		});

	e.currentTarget.dispatchEvent(ce);

}