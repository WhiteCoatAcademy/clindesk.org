/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */
(function($) {

	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	$.pixelentity.effects = $.pixelentity.effects || {version: '1.0.0'};
	
	$.pixelentity.effects.icon = function(e) {
		var target = $(e.currentTarget);
		if (e.type == "mouseenter" && target.hasClass("disabled")) {
			return;
		}
		target.data("icon").fadeTo(300,e.type == "mouseenter" ? 1 : 0,"easeOutQuad");
	};
	
		
}(jQuery));




