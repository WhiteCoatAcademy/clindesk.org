(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity,google */
                
    
	var slider;
	
	function clickHandler(e) {
		if (e.currentTarget.id === "carouselPrev") {
			slider.prev();
		} else {
			slider.next();
		}
		return false;
	}

	
	function addTarget() {
		var target = $(this);
		slider = target.parent().next(".carouselBox");
		if (slider.length > 0) {
			slider.addClass("peVolo").wrapInner('<div class="peWrap"></div>');
		}
		target.delegate("a","click",clickHandler);
		slider = slider.peVolo({api:true});
	}
	
	
	function check(target,controller) {
		var t = target.find(".carousel-nav");
		if (t.length > 0) {
			t.each(addTarget);
			return true;
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
	
}(jQuery));