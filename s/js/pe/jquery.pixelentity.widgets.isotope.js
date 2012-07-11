(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */
	
	function check(target) {
		var t = target.find(".peIsotope");
		if (t.length > 0) {
			t.peIsotope();
			return true;
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
}(jQuery));