/**
 * Created by florian on 27.04.2014.
 */
"use strict";
var webshop = webshop || {};

webshop.view = function () {
	function init() {
		$("#startSearch").click(function (event) {
			if (!checkForSearchStringIsEmpty()) {
				emptyItems();
				webshop.controller.search($("#searchQuery").val(), addItems)
			}

		});
		$("#searchQuery").keypress(function (e) {
			if (e.keyCode === 13) {
				$("#startSearch").click();
			}
		});
	}

	function emptyItems() {
		$("#retItems").empty();
	}

	function checkForSearchStringIsEmpty() {
		return $("#searchQuery").val().length === 0;
	}

	function addErrorItem(error) {
		$("#retItems").append(" <a class=\"list-group-item list-group-item-danger\" href=\"#\"><h4 class=\"list-group-item-heading\">Fehler</h4><p class=\"list-group-item-text\">" + error + "</p></a>");
	}

	function addItem(item) {
		$("#retItems").append(" <a class=\"list-group-item\" target='_blank' href=\"" + item.url + "\"><h4 class=\"list-group-item-heading list-group-item-success\">" + item.title + "</h4><p class=\"list-group-item-text\">" + item.contentSnippet + "</p></a>");
	}

	function addItems(items) {
		var dataItems = items;
		for (var i = 0; i < dataItems.length; i++) {
			addItem(dataItems[i] ? dataItems[i] : "unknown error occurred");
		}
	}

	init();
};