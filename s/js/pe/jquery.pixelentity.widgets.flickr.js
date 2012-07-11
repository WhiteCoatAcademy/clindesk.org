(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */
	
	function check(target,controller) {
		var t = target.find(".flickr");
		if (t.length > 0) {
			t.peFlickr({
				"userID": t.attr("data-userID"),
				"count": parseInt(t.attr("data-count"),10) || 6,
				"cols": parseInt(t.attr("data-cols"),10) || 3,
				"callback": controller.expand,
				"api": true
			});
			return true;
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
}(jQuery));