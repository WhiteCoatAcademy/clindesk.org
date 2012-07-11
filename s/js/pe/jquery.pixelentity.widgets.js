(function ($) {
	/*jslint undef: false, browser: true, devel: false, eqeqeq: false, bitwise: false, white: false, plusplus: false, regexp: false, nomen: false */ 
	/*global jQuery,setTimeout,projekktor,location,setInterval,YT,clearInterval,pixelentity,$ */
	$.pixelentity = $.pixelentity || {};

	var items = [];
	var active = [];
	
	function Factory() {
		function add(cond,widget) {
			items.push({
				check:cond,
				widget:widget
			});
		}
		
		function build(target,controller) {
			if (target.data("peWidgets")) {
				return false;
			}
			var applied = false;
			target.data("peWidgets",true);
			var n = items.length;
			var item;
			var elem;
			for (var i=0;i<n;i++) {
				item = items[i];
				elem = item.check(target,controller);
				if (elem) {
					applied = true;
					if (item.widget) {
						active.push(new item.widget(elem));
					}
				}
			}
			return applied;
		}
		
		$.extend(this, {
			"add":add,
			"build":build
		});
	}
	
	$.pixelentity.widgets = new Factory();
}(jQuery));