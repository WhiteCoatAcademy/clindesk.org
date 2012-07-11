(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity */
	
	var loaded = false;
	
	function loadApi() {
		loaded = true;
		
		// twitter load script
		var js, fjs = document.getElementsByTagName("script")[0];
		js = document.createElement("script"); 
		js.async = true;
		js.src = "//platform.twitter.com/widgets.js";
		fjs.parentNode.insertBefore(js, fjs);
	
	}

	function check(target,controller) {
		var t = target.find("button.share.twitter");
		if (t.length > 0) {
			t.replaceWith('<div class="shareButton"><a class="twitter-share-button"></a></div>');
			if (!loaded) {
				loadApi();
			}
			return true;
		}
		return false;
	}
	
	$.pixelentity.widgets.add(check);
}(jQuery));
