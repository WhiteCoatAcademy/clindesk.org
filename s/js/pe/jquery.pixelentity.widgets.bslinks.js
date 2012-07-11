(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity,$ */
	
	var iDev = navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/);
	var videoRegexp = /[^w](mp4|webm|ogv)$|^http:\/\/(vid\.ly|youtube\.|www\.youtube\.|youtu\.be|vimeo\.|www\.vimeo\.)/i;
	
	function noop() {
		return false;
	}
	
	function addLink() {
		var link = $(this);
		
		/*
		if (this.href.charAt(this.href.length-1) === "#" && !link.attr("data-filter")) {
			link.click(noop);
		}
		*/
		
		var target = link.attr("data-target");
		
		var handler = (target && pixelentity.targets[target]) ? pixelentity.targets[target] : false;
		if (handler) {
			link.click(handler);
		}
		
		if (target == "flare") {
			link.peFlareLightbox();
		}
		
		switch (link.attr("data-rel")) {
		case "popover":
			link.popover();
			break;
		case "tooltip":
			link.tooltip({placement: link.attr("data-position") || "top"});
			break;
		}

		
		if (link.hasClass("peOver")) {
			/*
            if (this.href.match(videoRegexp)) {
                link.attr("data-isVideo","1");
            }
			*/
            var icon = $('<span class="overIcon '+(link.attr("data-target") == "flare" ? "lightbox" : "link")+'Icon"></span>').hide();
			
            link.append(icon).data("icon",icon);
			
            if (!iDev) {
                link.bind("mouseenter mouseleave",$.pixelentity.effects.iconmove);
            }
			
        }
		
		if (link.hasClass("peVideo")) {
			link.peVideoPlayer({responsive:true});
		}
		
	}
	
	function check(target) {
		var t = target.find("a");
		if (t.length > 0) {
			t.each(addLink);
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
}(jQuery));