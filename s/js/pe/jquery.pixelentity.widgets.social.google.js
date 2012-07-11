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
		js.src = "https://apis.google.com/js/plusone.js";
		fjs.parentNode.insertBefore(js, fjs);
	
	}

	function check(target,controller) {
		var t = target.find("button.share.google");
		if (t.length > 0) {
			t.replaceWith('<div class="shareButton"><div class="g-plusone" data-size="medium" data-width="120"></div></div>');
			if (!loaded) {
				loadApi();
			}
			return true;
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
}(jQuery));
