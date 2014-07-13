/**
 * Created by fhoffma on 07.07.2014.
 */
if (typeof jQuery === 'undefined') {
	throw new Error('Bootstrap\'s JavaScript requires jQuery')
}
+function ($) {
	'use strict';
	$(document).on('click.bs.collapse', '[data-toggle=collapse]', function (e) {
		var b = $(e.currentTarget).find('span.indicator');
		var c = $(b).toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
	});

}
(jQuery);
