(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */
	
	var loaded = false;
	
	function loadApi() {
		loaded = true;
		$("body").append('<div id="fb-root"/>');
		// facebook load script
		var js, fjs = document.getElementsByTagName("script")[0];
		js = document.createElement("script"); 
		js.async = true;
		js.src = "//assets.pinterest.com/js/pinit.js";
		fjs.parentNode.insertBefore(js, fjs);
	}

	function check(target,controller) {
		var t = target.find("button.share.pinterest");
		if (t.length > 0) {
			var url = encodeURIComponent(location.href);
			t.replaceWith('<div class="shareButton"><a href="http://pinterest.com/pin/create/button/?url='+url+'" class="pin-it-button" count-layout="horizontal"><img border="0" src="//assets.pinterest.com/images/PinExt.png" title="Pin It" /></a></div>');
			if (!loaded) {
				loadApi();
			}
			return true;
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
}(jQuery));
