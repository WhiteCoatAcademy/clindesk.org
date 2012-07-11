/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */
(function($) {

	$.pixelentity = $.pixelentity || {version: '1.0.0'};
	$.pixelentity.effects = $.pixelentity.effects || {version: '1.0.0'};
	
	$.pixelentity.effects.iconmove = function(e) {
		var el = $(e.currentTarget);
        
        if (el.hasClass("disabled")) {
            return;
        }
        
        var xp = (e.pageX-el.offset().left);
        var yp = (e.pageY-el.offset().top);
        
        var w = el.width()+32;
        var h = el.height()+32;
        
        var dx = (xp > w/2 ? w : -w) / 2;
        var dy = (yp > h/2 ? h : -h) / 2;
        
        el.stop();
        
        var horiz;
        
        switch (el.data("peScrollThumbDirection")) {
        case "horizontal":
            horiz = true;
            break;
        case "vertical":
            horiz = false;
            break;
        default:
            horiz = (xp-w/2)*(xp-w/2)>(yp-h/2)*(yp-h/2);
        }
        
		var icon = el.data("icon");
		
		if (e.type == "mouseenter") {
			if (horiz) {
				icon.stop().css({"left":dx,"top":0}).show().delay(100).animate({"left":0},200,"easeOutQuad");
			} else {
				icon.stop().css({"left":0,"top":dy}).show().delay(100).animate({"top":0},200,"easeOutQuad");
			}
		} else {
			if (horiz) {
				icon.stop().css({"left":0,"top":0}).animate({"left":dx},200,"easeOutQuad");
			} else {
				icon.stop().css({"left":0,"top":0}).animate({"top":dy},200,"easeOutQuad");
			}
		}
		
		
	};
	
		
}(jQuery));




