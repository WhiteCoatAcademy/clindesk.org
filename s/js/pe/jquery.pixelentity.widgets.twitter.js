(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */
	
	var templateController;
	
	function createWidget() {
		var t=$(this);
		if (t.hasClass("static")) {
			return;
		}
		t.peTwitter({
			"username": t.attr("data-username"),
			"count": parseInt(t.attr("data-count"),10) || 9,
			"topDate": (t.attr("data-topdate") === "true"),
			"callback": templateController.expand,
			"api": true
		});

	}

	function check(target,controller) {
		var t = target.find(".twitter");
		if (t.length > 0) {
			templateController = controller;
			t.each(createWidget);
			return true;
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
}(jQuery));
